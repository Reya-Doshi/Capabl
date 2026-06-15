import prisma from "../config/db.js";

/**
 * readinessService — thin, dependency-light readiness math for the What-if
 * simulator and weekly-goal commit flow.
 *
 * It deliberately does NOT call runAnalysis() (the heavy Gemini/GitHub/embedding
 * pipeline). Instead it reads the already-persisted per-skill proficiency
 * (AIAnalysis.skillProficiency) and recomputes the SAME aggregation the engine
 * uses for the overall match:
 *
 *   score = Σ (skill.weight × skill.readiness) / 100
 *
 * which is exactly the spec's readiness formula
 * (0.35·interview + 0.25·projects + 0.20·resume + 0.12·certs + 0.08·roadmap is
 * baked into each skill's `readiness`, then weighted-averaged here).
 *
 * NOTE on score identity: this is the engine's `matchScore` space, not the
 * dashboard's broader composite `readinessScore`. Skill completion only moves
 * matchScore faithfully — see the deviations note in the build summary.
 */

export interface ReadinessSkill {
  name: string;
  weight: number; // role-importance weight (%), sums to ~100 across skills
  readiness: number; // 0-100 current evidence-derived readiness
}

export interface DataCompleteness {
  resume: boolean;
  interview: boolean;
  projects: boolean;
  certs: boolean;
  roadmap: boolean;
}

export interface ReadinessProfile {
  userId: number;
  skills: ReadinessSkill[];
  dataCompleteness: DataCompleteness;
  currentScore: number; // Σ(weight×readiness)/100, rounded
}

const clampReadiness = (r: unknown): number =>
  Math.max(0, Math.min(100, Math.round(Number(r) || 0)));

const normalize = (s: unknown): string =>
  String(s ?? "").trim().toLowerCase();

/**
 * Core formula — overall score as the weighted average of per-skill readiness.
 * Mirrors analysisService's matchScore aggregation; never rewrites it elsewhere.
 */
export function calculate(skills: ReadinessSkill[]): number {
  if (!Array.isArray(skills) || skills.length === 0) return 0;
  const total = skills.reduce(
    (sum, s) => sum + ((Number(s.weight) || 0) * clampReadiness(s.readiness)) / 100,
    0
  );
  return Math.round(total);
}

/**
 * Readiness gain from completing a single skill: override that skill's
 * readiness to 100 in a LOCAL copy, recalculate, return the (non-negative) delta.
 * (Spec used a per-skill `evidence` field; this codebase's equivalent is
 * `readiness`.)
 */
export function calculateIsolatedGain(
  skills: ReadinessSkill[],
  skillName: string,
  currentScore: number
): number {
  const target = normalize(skillName);
  const overridden = skills.map((s) =>
    normalize(s.name) === target ? { ...s, readiness: 100 } : s
  );
  return Math.max(0, calculate(overridden) - currentScore);
}

/**
 * Combined readiness gain from completing all named skills together.
 */
export function calculateCombinedGain(
  skills: ReadinessSkill[],
  skillNames: string[],
  currentScore: number
): number {
  const set = new Set((skillNames || []).map(normalize));
  const overridden = skills.map((s) =>
    set.has(normalize(s.name)) ? { ...s, readiness: 100 } : s
  );
  return Math.max(0, calculate(overridden) - currentScore);
}

/**
 * Load a lightweight readiness profile from the PERSISTED analysis row.
 * Does not trigger runAnalysis(). Returns null if the user has no analysis yet.
 */
export async function loadReadinessProfile(
  userId: number
): Promise<ReadinessProfile | null> {
  const user: any = await prisma.user.findUnique({
    where: { id: userId },
    include: { aiAnalysis: true },
  });

  if (!user || !user.aiAnalysis) return null;

  const raw = (user.aiAnalysis.skillProficiency as any[]) || [];
  const skills: ReadinessSkill[] = raw
    .filter((e) => e && e.name)
    .map((e) => ({
      name: String(e.name),
      weight: Number(e.weight) || 0,
      readiness: clampReadiness(e.readiness),
    }));

  const es = (user.aiAnalysis.evidenceSummary as any) || {};
  const certCount = (user.aiAnalysis.certifications as any[])?.length || 0;

  const dataCompleteness: DataCompleteness = {
    resume: Boolean(user.resume) || (Number(es.resume) || 0) > 0,
    interview: (Number(es.interview) || 0) > 0,
    projects: (Number(es.project) || 0) > 0,
    certs: (Number(es.certification) || 0) > 0 || certCount > 0,
    roadmap: (Number(es.roadmap) || 0) > 0,
  };

  return {
    userId,
    skills,
    dataCompleteness,
    currentScore: calculate(skills),
  };
}

export default {
  calculate,
  calculateIsolatedGain,
  calculateCombinedGain,
  loadReadinessProfile,
};
