import prisma from "../config/db.js";
import { runAnalysis } from "../services/analysisService.js";

function buildUserPayload(user) {
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
    skills: user.skills.map((s) => s.name),
  };
}

async function persistAnalysis(userId, result, hasResume) {
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
      (s) => `${s.title}: ${s.description}`
    ),
    aiSummary: `Readiness ${result.readinessScore}% for ${result.careerFit}. Resume ${result.resume.score}%, ATS ${result.resume.atsScore}%, GitHub ${result.github.score}%, LinkedIn ${result.linkedin.score}%.`,
  };

  await prisma.aIAnalysis.upsert({
    where: { userId },
    create: { ...aiData, userId },
    update: aiData,
  });
}

export const getAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, aiAnalysis: true, roadmaps: true },
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const analysis = await runAnalysis({
      user,
      skills: user.skills.map((s) => s.name),
      careerGoal: user.careerGoal,
      resumePath: user.resume,
      githubUrl: user.github,
      linkedinUrl: user.linkedin,
    });

    res.status(200).json({
      user: buildUserPayload(user),
      analysis,
      stored: user.aiAnalysis || null,
    });
  } catch (error) {
    console.error("getAnalysis error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const refreshAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true },
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const result = await runAnalysis({
      user,
      skills: user.skills.map((s) => s.name),
      careerGoal: user.careerGoal,
      resumePath: user.resume,
      githubUrl: user.github,
      linkedinUrl: user.linkedin,
    });

    await persistAnalysis(userId, result, Boolean(user.resume));

    const refreshed = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, aiAnalysis: true },
    });

    res.status(200).json({
      user: buildUserPayload(refreshed),
      analysis: result,
      stored: refreshed.aiAnalysis,
    });
  } catch (error) {
    console.error("refreshAnalysis error:", error);
    res.status(500).json({ message: error.message });
  }
};
