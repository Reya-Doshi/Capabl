import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Semantic alignment between a candidate's resume and a *dynamic role profile*
// generated from Role Intelligence (NOT a manually pasted job description).
//
// Strategy (degrades gracefully, never throws, never surfaces a hard error):
//   1. Try Gemini embeddings → cosine similarity.
//   2. If embeddings are unsupported / fail → ask Gemini to reason a 0-100
//      alignment score.
//   3. If reasoning also fails → fall back to the skill-overlap baseline the
//      caller already computed.
// The returned object always contains a usable `semanticScore`.
// ---------------------------------------------------------------------------

export type SemanticMethod = "embeddings" | "reasoning" | "skill-overlap";

export interface SemanticAlignment {
  semanticScore: number; // 0-100
  method: SemanticMethod;
}

export interface SemanticInput {
  resumeText: string;
  roleProfileText: string;
  normalizedTitle: string;
  requiredSkills: string[];
  /** Skill-overlap percentage (0-100) used as the last-resort baseline. */
  skillMatchBaseline: number;
}

const EMBEDDING_MODEL = "gemini-embedding-001";
const REASONING_MODEL = "gemini-1.5-flash";

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenerativeAI(key);
}

function clampScore(value: unknown, fallback = 0): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  if (!length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function embed(text: string): Promise<number[]> {
  const model = getGeminiClient().getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  const values = result?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Embedding response contained no vector");
  }
  return values;
}

// Cosine similarity of two short, topically-related documents tends to sit in a
// compressed high band (0.6-0.9). Rescale that band onto 0-100 so the score is
// interpretable instead of clustering near the top.
function similarityToScore(similarity: number): number {
  const floor = 0.5; // below this we treat alignment as effectively zero
  const ceil = 0.92; // at/above this we treat alignment as essentially perfect
  const normalized = (similarity - floor) / (ceil - floor);
  return clampScore(normalized * 100, 0);
}

async function scoreByEmbeddings(input: SemanticInput): Promise<number> {
  const [resumeVec, roleVec] = await Promise.all([
    embed(input.resumeText.slice(0, 8000)),
    embed(input.roleProfileText.slice(0, 8000)),
  ]);
  return similarityToScore(cosineSimilarity(resumeVec, roleVec));
}

async function scoreByReasoning(input: SemanticInput): Promise<number> {
  const model = getGeminiClient().getGenerativeModel({ model: REASONING_MODEL });

  const prompt = `You are an expert technical recruiter. Rate how semantically aligned this candidate's resume is with the target role profile on a scale of 0 to 100.

Consider depth of relevant experience, projects, and technologies — not just keyword overlap.

TARGET ROLE: ${input.normalizedTitle}
ROLE PROFILE:
${input.roleProfileText.slice(0, 3000)}

CANDIDATE RESUME:
${input.resumeText.slice(0, 4000)}

Respond with ONLY a single integer between 0 and 100. No words, no symbols, no explanation.`;

  const response = await model.generateContent(prompt);
  const raw = response.response.text();
  const match = raw.match(/\d{1,3}/);
  if (!match) throw new Error("Reasoning response contained no number");
  return clampScore(match[0]);
}

/**
 * Compute the semantic alignment score. Always resolves — never rejects.
 * Logs a single warning when it has to step down to a weaker method.
 */
export async function computeSemanticAlignment(
  input: SemanticInput
): Promise<SemanticAlignment> {
  const hasResume = Boolean(input.resumeText && input.resumeText.trim().length > 40);

  // No meaningful resume text → there's nothing to compare. Use the baseline.
  if (!hasResume) {
    return { semanticScore: clampScore(input.skillMatchBaseline), method: "skill-overlap" };
  }

  // 1. Embeddings (preferred)
  try {
    const score = await scoreByEmbeddings(input);
    return { semanticScore: score, method: "embeddings" };
  } catch (embeddingErr) {
    console.warn(
      "[semanticMatch] embeddings unavailable, falling back to reasoning:",
      (embeddingErr as Error)?.message || embeddingErr
    );
  }

  // 2. Gemini reasoning
  try {
    const score = await scoreByReasoning(input);
    return { semanticScore: score, method: "reasoning" };
  } catch (reasoningErr) {
    console.warn(
      "[semanticMatch] reasoning fallback failed, using skill-overlap baseline:",
      (reasoningErr as Error)?.message || reasoningErr
    );
  }

  // 3. Skill-overlap baseline (last resort — guaranteed)
  return { semanticScore: clampScore(input.skillMatchBaseline), method: "skill-overlap" };
}

/**
 * Build a dense, embedding-friendly description of the *ideal candidate* for a
 * role from its Role Intelligence. This is the text the resume is compared
 * against — it replaces the old "paste a job description" input entirely.
 */
export function buildRoleProfileText(params: {
  normalizedTitle: string;
  requiredSkills: string[];
  roadmapStages?: { title: string; skills: string[] }[];
}): string {
  const { normalizedTitle, requiredSkills, roadmapStages = [] } = params;

  const skills = requiredSkills.join(", ");
  const progression = roadmapStages
    .map((s) => `${s.title}: ${(s.skills || []).join(", ")}`)
    .join(". ");

  return [
    `Role: ${normalizedTitle}.`,
    `An ideal candidate for a ${normalizedTitle} position is proficient in the following skills and technologies: ${skills}.`,
    `They have built real projects applying these technologies and can demonstrate hands-on experience across them.`,
    progression ? `Expected learning progression — ${progression}.` : "",
    `The candidate's resume should show relevant projects, technologies, and measurable impact aligned with the ${normalizedTitle} role.`,
  ]
    .filter(Boolean)
    .join(" ");
}
