import prisma from "../config/db.js";
import { runAnalysis } from "../services/analysisService.js";

function buildUserPayload(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    age: user.age,
    bio: user.bio,
    github: user.github,
    linkedin: user.linkedin,
    resume: user.resume,
    resumeName: user.resumeName,
    careerGoal: user.careerGoal,
    skills: user.skills.map((s: any) => s.name),
  };
}

async function persistAnalysis(userId: any, result: any, hasResume: any) {
  const aiData = {
    careerFit: result.careerFit,
    readinessScore: result.readinessScore,
    atsScore: result.resume.atsScore,
    resumeScore: hasResume ? result.resume.score : 0,
    githubScore: result.github.score,
    linkedinScore: result.linkedin.score,
    extractedSkills: result.extractedSkills,
    missingSkills: result.skillGaps,
    strengths: result.skillStrengths,
    weaknesses: result.skillGaps,
    recommendedRoles: [result.careerFit],
    requiredSkills: result.requiredSkills,
    roleIntelligence: result.roleIntelligence,
    roleGoalSnapshot: result.roleGoalSnapshot,
    aiSuggestions: result.aiSuggestions.map(
      (s: any) => `${s.title}: ${s.description}`
    ),
    aiSummary: `Readiness ${result.readinessScore}% for ${result.careerFit}. Resume ${result.resume.score}%, ATS ${result.resume.atsScore}%, GitHub ${result.github.score}%, LinkedIn ${result.linkedin.score}%.`,
  };

  await prisma.aIAnalysis.upsert({
    where: { userId },
    create: { ...aiData, userId },
    update: aiData,
  });
}

// Pull the user's projects out of their stored analysis so the scoring engine
// can use them as an independent evidence source. Projects live on AIAnalysis as
// parallel arrays (projectTitles/Descriptions/Technologies) plus savedProjects
// JSON written by the Projects page.
function extractProjects(aiAnalysis: any) {
  if (!aiAnalysis) return [];

  const projects: { title: string; description: string; technologies: string[] }[] = [];

  const titles: any[] = aiAnalysis.projectTitles || [];
  const descriptions: any[] = aiAnalysis.projectDescriptions || [];
  const technologies: any[] = aiAnalysis.projectTechnologies || [];

  titles.forEach((title: any, i: number) => {
    projects.push({
      title: String(title || ""),
      description: String(descriptions[i] || ""),
      technologies: String(technologies[i] || "")
        .split(/[,|·•]/g)
        .map((s: string) => s.trim())
        .filter(Boolean),
    });
  });

  for (const raw of aiAnalysis.savedProjects || []) {
    try {
      const p = JSON.parse(raw);
      const tech = Array.isArray(p.technologies)
        ? p.technologies
        : Array.isArray(p.tags)
        ? p.tags
        : [];
      projects.push({
        title: String(p.title || p.name || ""),
        description: String(p.description || p.summary || ""),
        technologies: tech.map((t: any) => String(t).trim()).filter(Boolean),
      });
    } catch {
      /* skip malformed entries */
    }
  }

  // Dedupe by title (savedProjects often mirror the parallel arrays).
  const seen = new Set<string>();
  return projects.filter((p) => {
    const key = p.title.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadManualProgress(userId: any) {
  try {
    const [skills, weekly] = await Promise.all([
      prisma.skillProgress.findMany({
        where: { userId },
        select: { skillName: true },
      }),
      prisma.weeklyTaskProgress.findMany({
        where: { userId },
        select: { week: true, taskKey: true },
      }),
    ]);
    return {
      manualSkills: skills.map((s: any) => s.skillName),
      weeklyProgress: weekly,
    };
  } catch {
    // Tables may not exist yet (migration pending). Fall back gracefully.
    return { manualSkills: [], weeklyProgress: [] };
  }
}

export const getAnalysis = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, aiAnalysis: true, roadmaps: true },
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const { manualSkills, weeklyProgress } = await loadManualProgress(userId);

    const analysis = await runAnalysis({
      user,
      skills: (user as any).skills.map((s: any) => s.name),
      careerGoal: (user as any).careerGoal,
      resumePath: (user as any).resume,
      githubUrl: (user as any).github,
      linkedinUrl: (user as any).linkedin,
      manualSkills,
      weeklyProgress,
      projects: extractProjects((user as any).aiAnalysis),
      cachedRoleIntelligence: {
        goalSnapshot: (user as any).aiAnalysis?.roleGoalSnapshot,
        requiredSkills: (user as any).aiAnalysis?.requiredSkills,
        roleIntelligence: (user as any).aiAnalysis?.roleIntelligence,
      },
    });

    await persistAnalysis(userId, analysis, Boolean((user as any).resume));

    res.status(200).json({
      user: buildUserPayload(user),
      analysis,
      stored: (user as any).aiAnalysis || null,
    });
  } catch (error: any) {
    console.error("getAnalysis error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const refreshAnalysis = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, aiAnalysis: true },
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const { manualSkills, weeklyProgress } = await loadManualProgress(userId);

    const result = await runAnalysis({
      user,
      skills: (user as any).skills.map((s: any) => s.name),
      careerGoal: (user as any).careerGoal,
      resumePath: (user as any).resume,
      githubUrl: (user as any).github,
      linkedinUrl: (user as any).linkedin,
      manualSkills,
      weeklyProgress,
      projects: extractProjects((user as any).aiAnalysis),
      cachedRoleIntelligence: {
        goalSnapshot: (user as any).aiAnalysis?.roleGoalSnapshot,
        requiredSkills: (user as any).aiAnalysis?.requiredSkills,
        roleIntelligence: (user as any).aiAnalysis?.roleIntelligence,
      },
    });

    await persistAnalysis(userId, result, Boolean((user as any).resume));

    const refreshed: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, aiAnalysis: true },
    });

    res.status(200).json({
      user: buildUserPayload(refreshed),
      analysis: result,
      stored: refreshed.aiAnalysis,
    });
  } catch (error: any) {
    console.error("refreshAnalysis error:", error);
    res.status(500).json({ message: error.message });
  }
};
