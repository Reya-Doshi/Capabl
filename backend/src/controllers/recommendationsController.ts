import prisma from "../config/db.js";
import readinessService from "../services/readinessService.js";
import { generateJson } from "../services/geminiText.js";

/**
 * POST /api/recommendations/reasoning
 * Body: { targetRole, items: (string | { name })[] }   (userId from JWT)
 *
 * Returns a 2-sentence tradeoff reasoning per item from ONE Gemini call.
 * If Gemini fails, returns { reasonings: [] } (200) — never throws, so the
 * recommendations still render without reasoning.
 */
export const reasoningForRecommendations = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const targetRole = (req.body?.targetRole || "").trim() || "your target role";

    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const names: string[] = rawItems
      .map((i: any) => (typeof i === "string" ? i : i?.name))
      .filter((n: any) => typeof n === "string" && n.trim())
      .slice(0, 12);

    if (!names.length) return res.json({ reasonings: [] });

    // Context for specificity (skills + project titles). Best-effort only.
    const profile = await readinessService.loadReadinessProfile(userId);
    const userSkills =
      profile?.skills?.map((s) => ({ name: s.name, evidence: s.readiness })) ?? [];
    const ai = await prisma.aIAnalysis.findUnique({
      where: { userId },
      select: { projectTitles: true },
    });
    const userProjects = ai?.projectTitles ?? [];
    const currentScore = profile?.currentScore ?? 0;

    const prompt = `
For each item, write exactly 2 sentences for someone targeting
${targetRole} at ${currentScore}% readiness.
Sentence 1: why this over alternatives (name the tradeoff).
Sentence 2: concrete impact on readiness or hirability.
No generic advice. Be specific to this user's gaps.

User skills: ${JSON.stringify(userSkills)}
User projects: ${JSON.stringify(userProjects)}

Items:
${names.map((item, i) => `${i + 1}. ${item}`).join("\n")}

JSON only:
{
  "reasonings": [
    { "name": "item name", "reasoning": "sentence 1. sentence 2." }
  ]
}
`;

    const parsed = await generateJson(prompt);
    const reasonings =
      parsed && Array.isArray(parsed.reasonings)
        ? parsed.reasonings
            .filter((r: any) => r?.name && r?.reasoning)
            .map((r: any) => ({ name: String(r.name), reasoning: String(r.reasoning) }))
        : [];

    return res.json({ reasonings });
  } catch (error: any) {
    console.error("reasoningForRecommendations error:", error);
    return res.status(500).json({ error: "Failed to generate reasoning" });
  }
};
