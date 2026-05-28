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
    });

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
      include: { skills: true },
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
