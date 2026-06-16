// interviewEngine.ts
// -----------------------------------------------------------------------------
// The "brain" of the new interview module. Three jobs:
//
//   1. Compose the personalised SYSTEM PROMPT given a candidate context +
//      type selection (purpose / role / stage / medium / format / level).
//      The same prompt is used both for the Retell voice agent and for the
//      text-mode Gemini fallback.
//
//   2. Drive adaptive question generation — each new question is fed the
//      live transcript so the interviewer can react to what the candidate
//      actually said (skip, dig deeper, change angle).
//
//   3. Evaluate every answer against the 6-dimension rubric and produce a
//      final scorecard with per-dimension scores, strengths, gaps, an
//      improvement plan, and a "next adaptive question" recommendation.
//
// We use Gemini for both generation and evaluation so we don't add a 2nd
// LLM bill — Retell only does the speech-to-text + TTS layer; reasoning
// stays with Gemini.
// -----------------------------------------------------------------------------

import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";
import {
  PURPOSE_MAP,
  ROLE_MAP,
  STAGE_MAP,
  MEDIUM_MAP,
  FORMAT_MAP,
  DEFAULT_QUESTION_BUDGET,
} from "./interviewTypes.js";
import { contextToPromptBlock } from "./candidateContext.js";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface InterviewType {
  purpose: string;
  role: string;
  stage: string;
  medium: string;
  format: string;
  level: string;
  totalQuestions?: number;
}

export interface CandidateIdentity {
  name?: string;
  careerGoal?: string;
}

export interface CandidateContext {
  identity: CandidateIdentity;
  careerFit?: string;
  [key: string]: unknown;
}

export interface InterviewContext {
  candidateContext: CandidateContext;
  type: InterviewType;
  interviewerName?: string;
}

export interface ConversationTurn {
  question?: string;
  answer?: string;
}

/** Scores on a 0–10 scale (per-turn evaluation). */
export interface TurnDims {
  technical: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  clarity: number;
  culturalFit: number;
}

export interface TurnEvaluation {
  feedback: string | null;
  dims: TurnDims;
}

/** Scores on a 0–100 scale (final scorecard). */
export interface ScorecardScores {
  technical: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  clarity: number;
  culturalFit: number;
}

export interface QuestionBreakdownItem {
  question: string;
  answerQuality: string; // Excellent | Good | Average | Weak
  feedback: string;
}

export interface Scorecard {
  scores: ScorecardScores;
  overall: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  improvementPlan: string[];
  advice: string[];
  nextAdaptiveQuestion: string | null;
  readinessScore: number;
  // --- Richer scorecard (new evaluation prompt) ---------------------------
  verdict: string;
  improvements: string[];
  questionBreakdown: QuestionBreakdownItem[];
  nextSteps: string[];
  readinessShift: number; // -5..+5 — how much this interview shifts dashboard readiness
}

export interface OpenerResult {
  greeting: string;
  question: string;
  rationale: string | null;
}

export interface NextQuestionResult {
  question: string;
  rationale: string | null;
}

// Loose shape of what parseJsonLoose returns for question generation
interface GeneratedQuestion {
  greeting?: string;
  question?: string;
  rationale?: string;
}

// Loose shape of what parseJsonLoose returns for turn evaluation
interface RawTurnEval {
  feedback?: string;
  dims?: Partial<TurnDims>;
}

// Loose shape of what parseJsonLoose returns for scorecard generation.
// Supports both the new evaluation prompt field names (technicalDepth,
// cultureFit, overallScore, verdict, improvements, questionBreakdown,
// readinessShift, nextSteps) and the legacy ones for backward safety.
interface RawScorecard {
  scores?: Record<string, number>;
  overall?: number;
  overallScore?: number;
  summary?: string;
  verdict?: string;
  strengths?: unknown[];
  weaknesses?: unknown[];
  improvements?: unknown[];
  skillGaps?: unknown[];
  improvementPlan?: unknown[];
  advice?: unknown[];
  nextSteps?: unknown[];
  questionBreakdown?: unknown[];
  nextAdaptiveQuestion?: string;
  readinessScore?: number;
  readinessShift?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODEL_NAME = "gemini-2.5-flash";

// ---------------------------------------------------------------------------
// Gemini client (cached singleton)
// ---------------------------------------------------------------------------

let cachedClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (cachedClient) return cachedClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to backend/.env (get one free at https://aistudio.google.com/app/apikey)."
    );
  }
  cachedClient = new GoogleGenerativeAI(key);
  return cachedClient;
}

function getModel(temperature = 0.7): GenerativeModel {
  return getClient().getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { temperature },
  });
}

// ---------------------------------------------------------------------------
// SYSTEM PROMPT
// ---------------------------------------------------------------------------

export function buildSystemPrompt({
  candidateContext: ctx,
  type,
  interviewerName = "Rexa",
}: InterviewContext): string {
  const purpose = PURPOSE_MAP[type.purpose];
  const role = ROLE_MAP[type.role];
  const stage = STAGE_MAP[type.stage];
  const medium = MEDIUM_MAP[type.medium];
  const format = FORMAT_MAP[type.format];

  const overlays: string[] = [
    purpose?.promptOverlay,
    role?.promptOverlay,
    stage?.promptOverlay,
    medium?.promptOverlay,
    format?.promptOverlay,
  ]
    .filter(Boolean)
    .map((s) => (s as string).replace("{{careerFit}}", ctx.careerFit || "this role"));

  const totalQuestions: number =
    type.totalQuestions || DEFAULT_QUESTION_BUDGET[type.purpose] || 6;

  // Gap-targeted interviewing (v4 continuous loop): steer the majority of the
  // question budget at the candidate's detected readiness gaps, in priority
  // order, so the interview generates evidence on exactly the skills the
  // readiness engine flagged as weak.
  const topGaps: string[] = ((ctx as any).skillGaps || []).slice(0, 4);
  const gapDirective = topGaps.length
    ? `
PRIORITY — TARGET THESE READINESS GAPS
The readiness engine flagged these skills as the candidate's weakest, in priority order: ${topGaps.join(", ")}.
- Spend the MAJORITY of your ${totalQuestions} questions probing these gap skills, starting with the first.
- For each, test whether the candidate has actually closed the gap (concepts, hands-on application, trade-offs) — not just surface familiarity.
- You may still spend 1–2 questions confirming a claimed strength, but gaps come first.`
    : "";

  // Detect if this is a voice call (Retell) or text mode (Gemini)
  const isVoice = type.medium === "phone" || type.medium === "ai";

  const responseFormat = isVoice
    ? `
IMPORTANT: This is a LIVE VOICE CALL via Retell.
- Speak ONLY in natural, conversational sentences — exactly like a real human interviewer on a phone call.
- NEVER output JSON, markdown, bullet points, numbered lists, or any structured format.
- NEVER say words like "rationale", "output", "JSON", or explain your question choice.
- NEVER use symbols like *, #, {, }, [, ], or backticks.
- Just ask your next question naturally and conversationally.
- Keep each response SHORT — one question at a time, under 60 words.
- If you want to transition (e.g. "Let's explore that further"), do it in one natural spoken sentence.`
    : `
You will be invoked turn-by-turn. On your turn, output JSON only (no markdown fences) in this exact shape unless told otherwise:
{
  "question": "<your next question, ≤ 60 words>",
  "rationale": "<one short sentence on why you chose this question>"
}`;

  return `You are ${interviewerName}, a warm but rigorous senior recruiter conducting a ${type.level} mock interview.
You are NOT a robotic bot — you sound like a real human recruiter. You greet, you actively listen, you reference what the candidate said.

INTERVIEW TYPE
- Purpose: ${purpose?.label}
- Role flavor: ${role?.label}
- Stage: ${stage?.label}
- Medium: ${medium?.label}
- Format: ${format?.label}
- Level: ${type.level}
- Question budget: ${totalQuestions} questions total

TYPE-SPECIFIC GUIDANCE
${overlays.map((o) => `- ${o}`).join("\n")}

${contextToPromptBlock(ctx)}
${gapDirective}

GROUND RULES
- Ask EXACTLY ONE question per turn. ≤ 60 words per question.
- ALWAYS personalise — reference the candidate's actual skills, projects, GitHub, or roadmap. Never ask a question that would make sense for someone else.
- Make follow-ups adaptive — react to the previous answer (skip what they nailed, dig where they were vague).
- For a ${ctx.careerFit || "this candidate"}, do NOT ask about unrelated stacks (e.g. don't ask a React/Node candidate about Java).
- Do not number the question; just output the question text.
- You MUST ask EXACTLY ${totalQuestions} interview questions — not one more, not one fewer. This is a hard limit, not a suggestion. Internally count each question you ask. After question ${totalQuestions} and the candidate's response, you MUST say: "That's all I have for today. Thank you for your time." and then stop completely. NEVER ask a ${totalQuestions + 1}th question under any circumstance.
- Never say "Correct", "Great answer", or "Wrong". Instead say things like "Interesting, walk me through your thinking" or "Let's explore that further."
${responseFormat}`;
}

// ---------------------------------------------------------------------------
// QUESTION GENERATION (adaptive)
// ---------------------------------------------------------------------------

interface GenerateQuestionArgs {
  systemPrompt: string;
  turns: ConversationTurn[];
  isOpener: boolean;
}

async function generateQuestion({
  systemPrompt,
  turns,
  isOpener,
}: GenerateQuestionArgs): Promise<GeneratedQuestion> {
  const model = getModel(0.8);

  const history = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Understood. Ready to interview." }] },
  ];

  // Replay the conversation so the model sees the live state.
  for (const t of turns) {
    if (t.question)
      history.push({ role: "model", parts: [{ text: t.question }] });
    if (t.answer)
      history.push({ role: "user", parts: [{ text: t.answer }] });
  }

  const chat: ChatSession = model.startChat({ history });

  const instruction = isOpener
    ? `Greet the candidate by first name in one short sentence, then ask the FIRST question. Output JSON: { "greeting": "<one sentence>", "question": "<first question>", "rationale": "<why>" }`
    : `Based on the candidate's most recent answer, decide the next adaptive question. If they nailed the topic, change angle. If they were vague, dig deeper on the same point. Output JSON only: { "question": "<next question>", "rationale": "<one sentence>" }`;

  const result = await callGeminiWithRetry(() => chat.sendMessage(instruction));
  const raw = result.response.text().trim();
  return (parseJsonLoose(raw) ?? {}) as GeneratedQuestion;
}

export async function generateOpener(ctx: InterviewContext): Promise<OpenerResult> {
  const firstName =
    ctx.candidateContext.identity.name?.split(" ")[0] || "there";
  try {
    const systemPrompt = buildSystemPrompt(ctx);
    const out = await generateQuestion({
      systemPrompt,
      turns: [],
      isOpener: true,
    });
    return {
      greeting: out?.greeting || `Hi ${firstName}! Ready to start?`,
      question:
        out?.question ||
        "Could you start by walking me through your background?",
      rationale: out?.rationale || null,
    };
  } catch (error) {
    console.error("Gemini overloaded:", error);
    return {
      greeting: `Hi ${firstName}! Thanks for joining — let's get started.`,
      question: "Can you explain a project you recently worked on?",
      rationale: null,
    };
  }
}

export async function generateNextQuestion(
  ctx: InterviewContext,
  turns: ConversationTurn[]
): Promise<NextQuestionResult> {
  try {
    const systemPrompt = buildSystemPrompt(ctx);
    const out = await generateQuestion({
      systemPrompt,
      turns,
      isOpener: false,
    });
    return {
      question: out?.question || "Can you elaborate a bit more?",
      rationale: out?.rationale || null,
    };
  } catch (error) {
    console.error("Gemini overloaded:", error);
    return {
      question: "Can you explain a project you recently worked on?",
      rationale: null,
    };
  }
}

// ---------------------------------------------------------------------------
// PER-TURN EVALUATION (6 dimensions)
// ---------------------------------------------------------------------------
//
// Returns one-line feedback + a small score per dimension (0-10). We keep
// the per-turn scores small so they roll up cleanly at finalization without
// the model trying to "predict" a 100-scale every turn.
//
export async function evaluateTurn(
  ctx: InterviewContext,
  turn: ConversationTurn
): Promise<TurnEvaluation> {
  try {
    const systemPrompt = buildSystemPrompt(ctx);
    const model = getModel(0.3);

    const prompt = `${systemPrompt}

You just received this single Q&A:
Q: ${turn.question}
A: ${turn.answer || "(no answer)"}

Rate this answer on each dimension (0-10 integer):
- technical: technical depth and correctness
- communication: how clearly the candidate communicates
- problemSolving: how they structure and approach the problem
- confidence: tone and assertiveness
- clarity: directness, no rambling
- culturalFit: alignment with role expectations

Output JSON only:
{
  "feedback": "<one-sentence coach feedback for the candidate>",
  "dims": {
    "technical": <0-10>,
    "communication": <0-10>,
    "problemSolving": <0-10>,
    "confidence": <0-10>,
    "clarity": <0-10>,
    "culturalFit": <0-10>
  }
}`;

    const result = await callGeminiWithRetry(() =>
      model.generateContent(prompt)
    );
    const raw = result.response.text().trim();
    const parsed = (parseJsonLoose(raw) ?? {}) as RawTurnEval;
    const dims = parsed.dims || {};
    return {
      feedback: parsed.feedback || null,
      dims: {
        technical: clamp10(dims.technical),
        communication: clamp10(dims.communication),
        problemSolving: clamp10(dims.problemSolving),
        confidence: clamp10(dims.confidence),
        clarity: clamp10(dims.clarity),
        culturalFit: clamp10(dims.culturalFit),
      },
    };
  } catch (error) {
    console.error("Gemini overloaded:", error);
    return {
      feedback: null,
      dims: {
        technical: 7,
        communication: 7,
        problemSolving: 7,
        confidence: 7,
        clarity: 7,
        culturalFit: 7,
      },
    };
  }
}

// ---------------------------------------------------------------------------
// FINAL SCORECARD
// ---------------------------------------------------------------------------

// Thrown when the AI scorecard cannot be produced (e.g. Gemini 429 / overload,
// or unparseable output after a repair attempt). The caller must surface this
// as "evaluation unavailable" and let the user retry — we never fabricate a
// neutral 70/100 scorecard, which misleads the candidate about their result.
export class EvaluationUnavailableError extends Error {
  constructor(message = "AI evaluation temporarily unavailable") {
    super(message);
    this.name = "EvaluationUnavailableError";
  }
}

// Retry a Gemini call up to 3 times with exponential backoff (1s → 2s → 4s).
// `fn` is a thunk so it can wrap either model.generateContent(...) or
// chat.sendMessage(...) — whichever shape the caller uses.
async function callGeminiWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [1000, 2000, 4000];
  let lastError: unknown;
  for (let attempt = 0; attempt < delays.length; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error("Gemini overloaded:", error);
      if (attempt < delays.length - 1) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }
  throw lastError;
}

export async function generateScorecard(
  { candidateContext, type }: Pick<InterviewContext, "candidateContext" | "type">,
  turns: ConversationTurn[]
): Promise<Scorecard> {
  try {
    const model = getModel(0.4);

    const transcript = turns
      .map(
        (t, i) =>
          `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer || "(no answer)"}`
      )
      .join("\n\n");

    const careerFit =
      candidateContext.identity.careerGoal ||
      candidateContext.careerFit ||
      "this role";
    const interviewPurpose = combinedPurposeLabelFor(type.purpose, type.role);

    // ---- New, stricter scorecard prompt (Part 4) --------------------------
    const prompt = `You are an expert technical recruiter evaluating a mock interview. The candidate was interviewing for ${careerFit} roles at ${type.level} difficulty. The interview type was ${interviewPurpose}.
Here is the full interview transcript:
${transcript}
Evaluate honestly, fairly, and constructively. Be specific to what was actually said and cite real moments from the transcript. Frame every weakness as a concrete, actionable growth area — never as a personal judgment. Do NOT use harsh, dismissive, or demoralizing language (avoid phrasings like "profound lack of", "failure", "incompetent", "no understanding"); describe gaps in terms of what the candidate should build next.
Return a JSON object with exactly these fields:
scores: object containing technicalDepth out of 10, communication out of 10, problemSolving out of 10, confidence out of 10, clarity out of 10, cultureFit out of 10
overallScore: weighted average — technicalDepth times 0.30 plus communication times 0.25 plus problemSolving times 0.20 plus confidence times 0.10 plus clarity times 0.10 plus cultureFit times 0.05 — rounded to one decimal
verdict: one honest but encouraging sentence summarizing the candidate's overall performance and their single most important next step — constructive in tone, never harsh or dismissive
strengths: array of exactly 3 strings — specific things the candidate did well with direct reference to what they said
improvements: array of exactly 3 strings — specific, actionable growth areas phrased constructively, each tied to a concrete moment in the transcript
questionBreakdown: array of objects, one per question, each containing question as string, answerQuality as Excellent or Good or Average or Weak, and feedback as one sentence. Only include turns in questionBreakdown where Rexa asked a genuine interview question. Do not include the opening greeting.
readinessShift: a number between minus 5 and plus 5 representing how much this interview performance should shift the candidate's overall Capabl readiness score
nextSteps: array of exactly 2 strings — specific actionable things the candidate should do before their next interview based on their weak areas
Return only valid JSON. No markdown. No explanation outside the JSON.`;

    const result = await callGeminiWithRetry(() => model.generateContent(prompt));
    let raw = result.response.text().trim();
    let parsed = parseJsonLoose(raw) as RawScorecard | null;

    // If the model wrapped its answer in prose/markdown we couldn't parse, ask
    // it once more to reformat the SAME content into pure JSON. We never render
    // the raw model output to the user.
    if (!parsed) {
      try {
        const repair = await callGeminiWithRetry(() =>
          model.generateContent(
            `Convert the following interview evaluation into a single valid JSON object with exactly these keys: scores (object with technicalDepth, communication, problemSolving, confidence, clarity, cultureFit — each a number out of 10), overallScore, verdict, strengths, improvements, questionBreakdown, readinessShift, nextSteps. Return ONLY the JSON — no markdown, no code fences, no commentary.\n\n${raw}`
          )
        );
        raw = repair.response.text().trim();
        parsed = parseJsonLoose(raw) as RawScorecard | null;
      } catch (e) {
        console.error("Scorecard JSON repair call failed:", e);
      }
    }

    // Still unparseable after a repair attempt. Fall back to a graceful, neutral
    // scorecard rather than surfacing Gemini's raw output or a 0/100 error.
    if (!parsed) {
      console.error("Could not parse scorecard evaluation after repair attempt.");
      throw new EvaluationUnavailableError(
        "Could not parse AI evaluation after repair attempt."
      );
    }

    // The new prompt scores each dimension out of 10. We scale to the 0-100
    // scale the rest of the app (DB columns, dashboards, history) expects.
    const s = parsed.scores || {};
    const score100 = (v: unknown) => clamp100(Math.round(Number(v) * 10));
    const scores: ScorecardScores = {
      technical: score100(s.technicalDepth ?? s.technical),
      communication: score100(s.communication),
      problemSolving: score100(s.problemSolving),
      confidence: score100(s.confidence),
      clarity: score100(s.clarity),
      culturalFit: score100(s.cultureFit ?? s.culturalFit),
    };

    // Recompute the weighted overall ourselves (on the 0-100 scale) using the
    // exact weights from the spec, so it always matches the dimension scores.
    const overall =
      Math.round(
        (scores.technical * 0.3 +
          scores.communication * 0.25 +
          scores.problemSolving * 0.2 +
          scores.confidence * 0.1 +
          scores.clarity * 0.1 +
          scores.culturalFit * 0.05) *
          10
      ) / 10;

    const verdict = sanitizeVerdict(String(parsed.verdict || parsed.summary || ""));
    const improvements = arr(parsed.improvements).length
      ? arr(parsed.improvements)
      : arr(parsed.weaknesses);
    const nextSteps = arr(parsed.nextSteps).length
      ? arr(parsed.nextSteps)
      : arr(parsed.advice);

    const questionBreakdown: QuestionBreakdownItem[] = Array.isArray(
      parsed.questionBreakdown
    )
      ? parsed.questionBreakdown.map((q: any, i: number) => ({
          question: String(q?.question || turns[i]?.question || ""),
          answerQuality: String(q?.answerQuality || ""),
          feedback: String(q?.feedback || ""),
        }))
      : [];

    const readinessShift = clampShift(parsed.readinessShift);

    return {
      scores,
      overall,
      // Map verdict → summary so the existing DB column / history / modal keep
      // working unchanged.
      summary: verdict,
      verdict,
      strengths: arr(parsed.strengths),
      // Map improvements → weaknesses for the existing column / modal.
      weaknesses: improvements,
      improvements,
      skillGaps: arr(parsed.skillGaps),
      improvementPlan: nextSteps,
      // Map nextSteps → advice for the existing column.
      advice: nextSteps,
      nextSteps,
      questionBreakdown,
      nextAdaptiveQuestion: parsed.nextAdaptiveQuestion || null,
      // Per-interview readiness snapshot = where the dashboard score lands
      // after applying the shift (controller computes & persists the dashboard
      // value; here we keep a sensible standalone number too).
      readinessScore: clamp100(
        (Number(candidateContext.readinessScore) || overall) + readinessShift
      ),
      readinessShift,
    };
  } catch (error) {
    // Re-throw our own signal untouched; wrap any other failure (429, network,
    // overload) as an unavailable evaluation so the caller can offer a retry.
    if (error instanceof EvaluationUnavailableError) throw error;
    console.error("Scorecard generation failed:", error);
    throw new EvaluationUnavailableError();
  }
}

// Local copy of the purpose+role label combiner (kept here so the engine has
// no dependency on the controller). Mirrors combinedPurposeLabel().
function combinedPurposeLabelFor(purposeKey: string, roleKey: string): string {
  const purposeLabel = PURPOSE_MAP[purposeKey]?.label || purposeKey;
  if (!roleKey || roleKey === "standard") return purposeLabel;
  const roleLabel = ROLE_MAP[roleKey]?.label || "";
  if (!roleLabel) return purposeLabel;
  return `${purposeLabel.replace(/\s*Interview$/i, "").trim()} ${roleLabel}`.trim();
}

// Responsible-AI safety net: soften any harsh, demoralizing phrasing the model
// may still produce so the candidate-facing verdict stays constructive. The
// prompt already asks for constructive feedback — this only rewrites a small,
// targeted set of clearly damaging phrases and leaves normal sentences intact.
function sanitizeVerdict(text: string): string {
  if (!text) return text;
  const replacements: [RegExp, string][] = [
    [/profound(ly)?\s+lack(s|ing|ed)?(\s+of)?/gi, "has room to grow in"],
    [/\b(complete|total|severe|utter)(ly)?\s+(lack|absence|failure)\b/gi, "a clear area to strengthen"],
    [/\b(incompeten|hopeless|terrible|awful|abysmal|dismal|pathetic|woeful)\w*/gi, "still developing"],
    [/\bno\s+(real\s+)?understanding\b/gi, "a limited understanding"],
  ];
  let out = text;
  for (const [re, to] of replacements) out = out.replace(re, to);
  return out.trim();
}

function clampShift(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(-5, Math.min(5, Math.round(v)));
}

// ---------------------------------------------------------------------------
// PROFILE-BASED RECOMMENDATION (Part 3)
//
// One quick Gemini call that recommends an interview configuration tailored to
// the candidate's current profile. The caller (controller) applies a hard
// timeout so this never blocks the page.
// ---------------------------------------------------------------------------

export interface RecommendationInput {
  careerGoal?: string | null;
  careerFit?: string | null;
  readinessScore?: number | null;
  skillGaps?: string[];
  projectCount?: number;
}

export interface RecommendationResult {
  purpose: string;
  roleFlavor: string;
  difficulty: string;
  questionBudget: number;
  reason: string;
}

export async function generateRecommendation(
  input: RecommendationInput
): Promise<RecommendationResult> {
  const purposeKeys = Object.keys(PURPOSE_MAP);
  const roleKeys = Object.keys(ROLE_MAP);

  const model = getModel(0.5);
  const prompt = `You are a career coach picking the single most useful mock-interview configuration for a candidate, based on their profile.

CANDIDATE PROFILE
- Career goal / target role: ${input.careerGoal || input.careerFit || "n/a"}
- Current readiness score: ${input.readinessScore ?? "n/a"}/100
- Known skill gaps: ${(input.skillGaps || []).slice(0, 8).join(", ") || "none recorded"}
- Number of projects: ${input.projectCount ?? 0}

Pick exactly one configuration. Choose values ONLY from these allowed options:
- purpose: ${purposeKeys.join(" | ")}
- roleFlavor: ${roleKeys.join(" | ")}
- difficulty: easy | medium | hard
- questionBudget: 4 | 6 | 8 | 10

Guidance: lower readiness or few projects → easier difficulty and a screening/behavioral focus; strong profile → harder difficulty and technical/role-specific depth. The reason must be ONE sentence, specific to this candidate, explaining why this config helps them most right now.

Return ONLY valid JSON, no markdown:
{
  "purpose": "<one allowed purpose key>",
  "roleFlavor": "<one allowed roleFlavor key>",
  "difficulty": "<easy|medium|hard>",
  "questionBudget": <4|6|8|10>,
  "reason": "<one sentence>"
}`;

  const result = await callGeminiWithRetry(() => model.generateContent(prompt));
  const raw = result.response.text().trim();
  const parsed = (parseJsonLoose(raw) ?? {}) as Partial<RecommendationResult>;

  const purpose = purposeKeys.includes(String(parsed.purpose))
    ? String(parsed.purpose)
    : "technical";
  const roleFlavor = roleKeys.includes(String(parsed.roleFlavor))
    ? String(parsed.roleFlavor)
    : "standard";
  const difficulty = ["easy", "medium", "hard"].includes(String(parsed.difficulty))
    ? String(parsed.difficulty)
    : "medium";
  const questionBudget = [4, 6, 8, 10].includes(Number(parsed.questionBudget))
    ? Number(parsed.questionBudget)
    : 6;
  const reason =
    String(parsed.reason || "").trim() ||
    "Tuned to your current profile to give you the most useful practice right now.";

  return { purpose, roleFlavor, difficulty, questionBudget, reason };
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function parseJsonLoose(raw: string): unknown {
  if (!raw) return null;
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}

function clamp10(n: unknown): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(10, v));
}

function clamp100(n: unknown): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

function zeroScores(): ScorecardScores {
  return {
    technical: 0,
    communication: 0,
    problemSolving: 0,
    confidence: 0,
    clarity: 0,
    culturalFit: 0,
  };
}