// interviewEngine.js
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

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  PURPOSE_MAP,
  ROLE_MAP,
  STAGE_MAP,
  MEDIUM_MAP,
  FORMAT_MAP,
  resolveWeights,
  DEFAULT_QUESTION_BUDGET,
} from "./interviewTypes.js";
import { contextToPromptBlock } from "./candidateContext.js";

const MODEL_NAME = "gemini-2.5-flash";

let cachedClient = null;
function getClient() {
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

function getModel(temperature = 0.7) {
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
}) {
  const purpose = PURPOSE_MAP[type.purpose];
  const role = ROLE_MAP[type.role];
  const stage = STAGE_MAP[type.stage];
  const medium = MEDIUM_MAP[type.medium];
  const format = FORMAT_MAP[type.format];

  const overlays = [
    purpose?.promptOverlay,
    role?.promptOverlay,
    stage?.promptOverlay,
    medium?.promptOverlay,
    format?.promptOverlay,
  ]
    .filter(Boolean)
    .map((s) => s.replace("{{careerFit}}", ctx.careerFit || "this role"));

  const totalQuestions =
    type.totalQuestions || DEFAULT_QUESTION_BUDGET[type.purpose] || 6;

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
async function generateQuestion({ systemPrompt, turns, isOpener }) {
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

  const chat = model.startChat({ history });

  const instruction = isOpener
    ? `Greet the candidate by first name in one short sentence, then ask the FIRST question. Output JSON: { "greeting": "<one sentence>", "question": "<first question>", "rationale": "<why>" }`
    : `Based on the candidate's most recent answer, decide the next adaptive question. If they nailed the topic, change angle. If they were vague, dig deeper on the same point. Output JSON only: { "question": "<next question>", "rationale": "<one sentence>" }`;

  const result = await callGeminiWithRetry(() => chat.sendMessage(instruction));
  const raw = result.response.text().trim();
  return parseJsonLoose(raw);
}

export async function generateOpener(ctx) {
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

export async function generateNextQuestion(ctx, turns) {
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
export async function evaluateTurn(ctx, turn) {
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
    const parsed = parseJsonLoose(raw) || {};
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
// Default scorecard returned when Gemini is unavailable. Shape matches what
// finalise() expects so the interview can still be marked complete.
function defaultScorecard() {
  return {
    scores: {
      technical: 70,
      communication: 70,
      problemSolving: 70,
      confidence: 70,
      clarity: 70,
      culturalFit: 70,
    },
    overall: 70,
    summary:
      "Interview completed successfully. Detailed AI analysis unavailable due to temporary service load.",
    strengths: ["Interview completed"],
    weaknesses: ["AI evaluation temporarily unavailable"],
    skillGaps: [],
    improvementPlan: [],
    advice: [],
    nextAdaptiveQuestion: null,
    readinessScore: 70,
  };
}

// Retry a Gemini call up to 3 times with exponential backoff (1s → 2s → 4s).
// `fn` is a thunk so it can wrap either model.generateContent(...) or
// chat.sendMessage(...) — whichever shape the caller uses.
async function callGeminiWithRetry(fn) {
  const delays = [1000, 2000, 4000];
  let lastError;
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

export async function generateScorecard({ candidateContext, type }, turns) {
  try {
    const weights = resolveWeights(type.purpose);
    const systemPrompt = buildSystemPrompt({ candidateContext, type });
    const model = getModel(0.4);

    const qaText = turns
      .map(
        (t, i) =>
          `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer || "(no answer)"}`
      )
      .join("\n\n");

    const weightLine = Object.entries(weights)
      .map(([k, v]) => `${k} ${v}%`)
      .join(" · ");

    const prompt = `${systemPrompt}

The interview is complete. Here is the transcript:

${qaText}

Score the candidate on each dimension 0-100 (integer). Then compute the overall score as the WEIGHTED AVERAGE using these weights: ${weightLine}.

Also identify concrete strengths, weaknesses, skill gaps (specific tech/topics they should learn), and a 3-step improvement plan.

The candidate's current career goal is "${
      candidateContext.identity.careerGoal || "n/a"
    }" and target role is "${candidateContext.careerFit}".

Output JSON only — no markdown fences — in this exact shape:
{
  "scores": {
    "technical": <0-100>,
    "communication": <0-100>,
    "problemSolving": <0-100>,
    "confidence": <0-100>,
    "clarity": <0-100>,
    "culturalFit": <0-100>
  },
  "overall": <0-100>,
  "summary": "<2-3 sentence overall verdict>",
  "strengths": ["<bullet>", "<bullet>", "<bullet>"],
  "weaknesses": ["<bullet>", "<bullet>"],
  "skillGaps": ["<specific skill or topic>", "<specific skill or topic>"],
  "improvementPlan": ["<concrete step>", "<concrete step>", "<concrete step>"],
  "advice": ["<short actionable next step>", "<short actionable next step>"],
  "nextAdaptiveQuestion": "<one question they should expect next time, based on what was weakest>",
  "readinessScore": <0-100>
}`;

    const result = await callGeminiWithRetry(() => model.generateContent(prompt));
    const raw = result.response.text().trim();
    const parsed = parseJsonLoose(raw);
    if (!parsed) {
      return {
        scores: zeroScores(),
        overall: 0,
        summary: "Could not parse evaluation. " + raw.slice(0, 200),
        strengths: [],
        weaknesses: [],
        skillGaps: [],
        improvementPlan: [],
        advice: [],
        nextAdaptiveQuestion: null,
        readinessScore: 0,
      };
    }

    const scores = {
      technical: clamp100(parsed.scores?.technical),
      communication: clamp100(parsed.scores?.communication),
      problemSolving: clamp100(parsed.scores?.problemSolving),
      confidence: clamp100(parsed.scores?.confidence),
      clarity: clamp100(parsed.scores?.clarity),
      culturalFit: clamp100(parsed.scores?.culturalFit),
    };

    // Recompute the weighted overall ourselves so it always matches the rubric
    // and the dimension scores — the model is allowed to suggest one, but we
    // don't trust it implicitly.
    const weighted = Math.round(
      (scores.technical * weights.technical +
        scores.communication * weights.communication +
        scores.problemSolving * weights.problemSolving +
        scores.confidence * weights.confidence +
        scores.clarity * weights.clarity +
        scores.culturalFit * weights.culturalFit) /
        100
    );

    return {
      scores,
      overall: weighted,
      summary: String(parsed.summary || ""),
      strengths: arr(parsed.strengths),
      weaknesses: arr(parsed.weaknesses),
      skillGaps: arr(parsed.skillGaps),
      improvementPlan: arr(parsed.improvementPlan),
      advice: arr(parsed.advice),
      nextAdaptiveQuestion: parsed.nextAdaptiveQuestion || null,
      readinessScore: clamp100(parsed.readinessScore ?? weighted),
    };
  } catch (error) {
    console.error("Gemini overloaded:", error);
    return defaultScorecard();
  }
}

// ---------------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------------
function parseJsonLoose(raw) {
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

function clamp10(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(10, v));
}

function clamp100(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function arr(v) {
  return Array.isArray(v) ? v.map(String) : [];
}

function zeroScores() {
  return {
    technical: 0,
    communication: 0,
    problemSolving: 0,
    confidence: 0,
    clarity: 0,
    culturalFit: 0,
  };
}