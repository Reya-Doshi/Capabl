import prisma from "../config/db.js";
import readinessService, {
  ReadinessProfile,
  DataCompleteness,
} from "../services/readinessService.js";
import { generateJson } from "../services/geminiText.js";

const normalize = (s: unknown): string => String(s ?? "").trim().toLowerCase();

/**
 * Confidence band from how many of the 5 evidence sources are present.
 * Fewer sources → wider band (less certain).
 */
function getConfidenceBand(dc: DataCompleteness): number {
  const count = Object.values(dc).filter(Boolean).length;
  if (count >= 4) return 5;
  if (count === 3) return 10;
  return 15;
}

// ---------------------------------------------------------------------------
// POST /api/whatif/simulate
// Body: { targetRole, skillsToComplete[] }  (userId comes from JWT)
// ---------------------------------------------------------------------------
export const simulate = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const targetRole = (req.body?.targetRole || "").trim() || "your target role";
    const skillsList: string[] = Array.isArray(req.body?.skillsToComplete)
      ? req.body.skillsToComplete.filter((s: any) => typeof s === "string" && s.trim())
      : [];

    const profile: ReadinessProfile | null =
      await readinessService.loadReadinessProfile(userId);
    if (!profile) {
      return res
        .status(400)
        .json({ error: "No analysis found yet. Run your AI analysis first." });
    }

    const currentScore = profile.currentScore;

    // Per-skill isolated gains (from readinessService — never hardcoded/AI).
    const gainMap: Record<string, number> = {};
    for (const skill of skillsList) {
      gainMap[skill] = readinessService.calculateIsolatedGain(
        profile.skills,
        skill,
        currentScore
      );
    }

    // Combined projection.
    const combinedGain = readinessService.calculateCombinedGain(
      profile.skills,
      skillsList,
      currentScore
    );
    const projectedScore = Math.min(99, currentScore + combinedGain);
    const delta = projectedScore - currentScore;
    const confidenceBand = getConfidenceBand(profile.dataCompleteness);

    // ── ONE Gemini call for ALL skill reasonings (text only) ──────────────
    const reasoningMap: Record<string, string> = {};
    if (skillsList.length) {
      const userSkills = profile.skills.map((s) => ({
        name: s.name,
        evidence: s.readiness,
      }));
      const prompt = `
You are a career advisor. For each skill listed, write ONE sentence
(max 18 words) explaining why it matters for a ${targetRole} role.
Be specific to this user's profile. No generic advice.

User current readiness: ${currentScore}%
User skills evidence: ${JSON.stringify(userSkills)}

Skills:
${skillsList.map((s, i) => `${i + 1}. ${s}`).join("\n")}

JSON only, no markdown:
{
  "reasonings": [
    { "skill": "skill name", "reasoning": "one sentence" }
  ]
}
`;
      const parsed = await generateJson(prompt);
      if (parsed && Array.isArray(parsed.reasonings)) {
        for (const r of parsed.reasonings) {
          if (r?.skill && r?.reasoning) {
            reasoningMap[normalize(r.skill)] = String(r.reasoning);
          }
        }
      }
    }

    // Hardcoded fallback per skill if Gemini missed it.
    const fallbackReasoning = (skill: string) =>
      `${skill} is a top gap for ${targetRole} based on current evidence.`;

    const skillReasonings = skillsList.map((skill) => ({
      skill,
      reasoning: reasoningMap[normalize(skill)] ?? fallbackReasoning(skill),
      gainIfCompleted: gainMap[skill] ?? 0,
    }));

    // Persist the snapshot only when something was toggled (avoid empty rows).
    if (skillsList.length) {
      await prisma.simulationSnapshot.create({
        data: {
          userId,
          skillsToggled: skillReasonings.map((s) => ({
            skill: s.skill,
            gain: s.gainIfCompleted,
          })),
          projectedScore,
          delta,
        },
      });
    }

    const history = await prisma.simulationSnapshot.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return res.json({
      currentScore,
      projectedScore,
      delta,
      confidenceBand,
      dataCompleteness: profile.dataCompleteness,
      skillReasonings,
      simulationHistory: history.map((h) => ({
        skillsToggled: h.skillsToggled,
        projectedScore: h.projectedScore,
        delta: h.delta,
        createdAt: h.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("simulate error:", error);
    return res.status(500).json({ error: "Simulation failed" });
  }
};

// ---------------------------------------------------------------------------
// POST /api/goals/commit
// Body: { targetRole, skillsToFocus[], weekStartDate }  (userId from JWT)
// ---------------------------------------------------------------------------
function fallbackPlan(targetRole: string, skillsToFocus: string[]) {
  const first = skillsToFocus[0] || "the skill";
  return {
    weekGoal: `Build foundational knowledge in ${skillsToFocus.join(" and ")} this week.`,
    days: [
      { day: "Monday", task: `Watch intro tutorial for ${first}`, resource: "YouTube", duration: "1h" },
      { day: "Tuesday", task: "Follow official quickstart docs", resource: "Official docs", duration: "2h" },
      { day: "Wednesday", task: "Build a small practice project", resource: "GitHub", duration: "2h" },
      { day: "Thursday", task: "Add the skill to an existing portfolio project", resource: "Your repo", duration: "2h" },
      { day: "Friday", task: "Complete one practice problem or exercise", resource: "freeCodeCamp", duration: "1h" },
      { day: "Saturday", task: "Review and consolidate notes", resource: "Notion", duration: "1h" },
      { day: "Sunday", task: "Push completed work to GitHub", resource: "GitHub", duration: "1h" },
    ],
  };
}

export const commitGoal = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const targetRole = (req.body?.targetRole || "").trim() || "Target Role";
    const skillsToFocus: string[] = Array.isArray(req.body?.skillsToFocus)
      ? req.body.skillsToFocus.filter((s: any) => typeof s === "string" && s.trim())
      : [];

    if (!skillsToFocus.length) {
      return res.status(400).json({ error: "Select at least one skill to focus on." });
    }

    const profile = await readinessService.loadReadinessProfile(userId);
    if (!profile) {
      return res
        .status(400)
        .json({ error: "No analysis found yet. Run your AI analysis first." });
    }

    const currentScore = profile.currentScore;
    const expectedGain = readinessService.calculateCombinedGain(
      profile.skills,
      skillsToFocus,
      currentScore
    );
    const projectedScoreByWeekend = Math.min(99, currentScore + expectedGain);

    const parsedDate = req.body?.weekStartDate ? new Date(req.body.weekStartDate) : new Date();
    const weekStart = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    // ── ONE Gemini call for the 7-day plan text (no scores) ───────────────
    const prompt = `
Create a 7-day plan for someone targeting ${targetRole} focusing on
${skillsToFocus.join(", ")} this week. Current readiness: ${currentScore}%.

JSON only, no markdown:
{
  "weekGoal": "one sentence of what they achieve by Sunday",
  "days": [
    { "day": "Monday", "task": "...", "resource": "...", "duration": "Xh" }
  ]
}

Rules:
- Each task under 15 words
- Resources must be free (YouTube, official docs, freeCodeCamp, Kaggle)
- Be specific to the skills listed, not generic productivity advice
- Do NOT include any score or number — scores are computed separately
`;
    const parsed = await generateJson(prompt);
    const plan =
      parsed && parsed.weekGoal && Array.isArray(parsed.days) && parsed.days.length
        ? { weekGoal: String(parsed.weekGoal), days: parsed.days }
        : fallbackPlan(targetRole, skillsToFocus);

    const goal = await prisma.weeklyGoal.create({
      data: {
        userId,
        targetRole,
        skillsFocus: skillsToFocus,
        weekStart,
        weekGoal: plan.weekGoal,
        dailyPlan: plan.days,
        expectedGain,
      },
    });

    return res.json({
      goalId: goal.id,
      weekGoal: plan.weekGoal,
      expectedGain,
      projectedScoreByWeekend,
      days: plan.days,
    });
  } catch (error: any) {
    console.error("commitGoal error:", error);
    return res.status(500).json({ error: "Failed to commit goal" });
  }
};
