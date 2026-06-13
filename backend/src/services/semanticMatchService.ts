import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Semantic Evidence Matching (v4).
//
// The named mechanism: candidate evidence and role-skill requirements are both
// turned into dense vector embeddings; cosine similarity between them produces a
// normalized per-skill match score, classified into Strong / Partial / Gap.
//
// Two public surfaces:
//   • computeSemanticAlignment  — whole-resume vs whole-role alignment (a single
//     0-100 used as one composite-score input). Embeddings → skill-overlap only;
//     NO LLM-as-judge fallback (that would undercut the named mechanism).
//   • computeSemanticSkillMatrix — per-skill × per-source cosine similarity, the
//     core of the v4 engine. This is what drives per-skill readiness.
// ---------------------------------------------------------------------------

export type SemanticMethod = "embeddings" | "skill-overlap";

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

// Calibrated, adjustable thresholds (operate on the normalized 0-100 similarity
// score, NOT raw cosine — see similarityToScore). Tunable as evaluation data
// accumulates; nothing here is a permanent magic constant.
export const SEMANTIC_THRESHOLDS = {
  strong: 70, // >= → Strong match
  partial: 40, // >= → Partial; below → Gap
};

// How much credit a purely-semantic match (no explicit keyword mention) can earn
// for a source, relative to a verified structural mention. Keeps semantic from
// fully substituting explicit evidence while still rescuing vocabulary mismatches.
export const SEMANTIC_CREDIT = 0.85;

export type MatchTier = "strong" | "partial" | "gap";

export function tierFromScore(score: number): MatchTier {
  if (score >= SEMANTIC_THRESHOLDS.strong) return "strong";
  if (score >= SEMANTIC_THRESHOLDS.partial) return "partial";
  return "gap";
}

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenerativeAI(key);
}

// In-process embedding cache keyed by content hash, so re-running analysis (e.g.
// after an interview) never re-embeds unchanged evidence ("store embeddings for
// reuse"). A persistent per-user cache table is a future optimization.
const embeddingCache = new Map<string, number[]>();

function hashText(text: string): string {
  return crypto.createHash("sha1").update(text).digest("hex");
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
  const key = hashText(text);
  const cached = embeddingCache.get(key);
  if (cached) return cached;

  const model = getGeminiClient().getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  const values = result?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Embedding response contained no vector");
  }
  embeddingCache.set(key, values);
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

/**
 * Whole-resume vs whole-role semantic alignment (0-100). Always resolves.
 * Embeddings → skill-overlap baseline. No LLM-as-judge step: if embeddings are
 * unavailable we degrade to the deterministic structural baseline rather than
 * to an opaque model judgment, keeping the named mechanism honest.
 */
export async function computeSemanticAlignment(
  input: SemanticInput
): Promise<SemanticAlignment> {
  const hasResume = Boolean(input.resumeText && input.resumeText.trim().length > 40);
  if (!hasResume) {
    return { semanticScore: clampScore(input.skillMatchBaseline), method: "skill-overlap" };
  }

  try {
    const score = await scoreByEmbeddings(input);
    return { semanticScore: score, method: "embeddings" };
  } catch (embeddingErr) {
    console.warn(
      "[semanticMatch] embeddings unavailable, using skill-overlap baseline:",
      (embeddingErr as Error)?.message || embeddingErr
    );
    return { semanticScore: clampScore(input.skillMatchBaseline), method: "skill-overlap" };
  }
}

// ---------------------------------------------------------------------------
// Per-skill Semantic Evidence Matching (the v4 engine core).
//
// Embeds each evidence SOURCE's aggregate text once and each ROLE SKILL (with
// its expanded concepts) once, then computes cosine similarity for every
// skill × source pair. Returns a normalized 0-100 similarity per pair plus a
// per-skill Strong/Partial/Gap tier from the skill's peak similarity.
//
// Cost is |sources| + |skills| embeddings per run (cached), NOT the product.
// ---------------------------------------------------------------------------

export interface EvidenceSourceText {
  key: string; // e.g. "resume" | "project" | "certification" | "roadmap" | "interview"
  text: string;
}

export interface RoleSkillConcepts {
  name: string; // normalized skill name
  concepts: string[]; // expanded concept list (semantic expansion)
}

export interface SemanticSkillMatch {
  method: SemanticMethod;
  /** simBySkill[skillName][sourceKey] = 0-100 normalized similarity. */
  simBySkill: Record<string, Record<string, number>>;
  /** Peak similarity (0-100) across sources, per skill. */
  peakBySkill: Record<string, number>;
  /** Strong/Partial/Gap per skill, from peak similarity. */
  tierBySkill: Record<string, MatchTier>;
}

function skillEmbeddingText(skill: RoleSkillConcepts): string {
  const concepts = (skill.concepts || []).filter(Boolean).join(", ");
  return concepts ? `${skill.name}: ${concepts}` : skill.name;
}

export async function computeSemanticSkillMatrix(
  sources: EvidenceSourceText[],
  skills: RoleSkillConcepts[]
): Promise<SemanticSkillMatch> {
  const empty: SemanticSkillMatch = {
    method: "skill-overlap",
    simBySkill: {},
    peakBySkill: {},
    tierBySkill: {},
  };
  if (!skills.length) return empty;

  const usableSources = sources.filter((s) => s.text && s.text.trim().length > 2);

  try {
    // Embed every source and every skill once (cached by content hash).
    const sourceVecs = new Map<string, number[]>();
    await Promise.all(
      usableSources.map(async (s) => {
        sourceVecs.set(s.key, await embed(s.text.slice(0, 8000)));
      })
    );

    const skillVecs = new Map<string, number[]>();
    await Promise.all(
      skills.map(async (sk) => {
        skillVecs.set(sk.name, await embed(skillEmbeddingText(sk)));
      })
    );

    const simBySkill: Record<string, Record<string, number>> = {};
    const peakBySkill: Record<string, number> = {};
    const tierBySkill: Record<string, MatchTier> = {};

    for (const sk of skills) {
      const skVec = skillVecs.get(sk.name)!;
      const row: Record<string, number> = {};
      let peak = 0;
      for (const s of usableSources) {
        const sv = sourceVecs.get(s.key);
        if (!sv) continue;
        const score = similarityToScore(cosineSimilarity(skVec, sv));
        row[s.key] = score;
        if (score > peak) peak = score;
      }
      simBySkill[sk.name] = row;
      peakBySkill[sk.name] = peak;
      tierBySkill[sk.name] = tierFromScore(peak);
    }

    return { method: "embeddings", simBySkill, peakBySkill, tierBySkill };
  } catch (err) {
    console.warn(
      "[semanticMatch] per-skill embeddings unavailable, structural-only fallback:",
      (err as Error)?.message || err
    );
    return empty;
  }
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
