import prisma from "../config/db.js";
import { runAnalysis } from "../services/analysisService.js";

const parseSkills = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw.map((s) => String(s).trim()).filter(Boolean);
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j))
      return j.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    /* not JSON */
  }
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

async function persistAnalysis(userId, analysisResult, hasResume) {
  const aiData = {
    careerFit: analysisResult.careerFit,
    readinessScore: analysisResult.readinessScore,
    atsScore: analysisResult.resume.atsScore,
    resumeScore: hasResume ? analysisResult.resume.score : 0,
    githubScore: analysisResult.github.score,
    linkedinScore: analysisResult.linkedin.score,
    extractedSkills: analysisResult.extractedSkills,
    missingSkills: analysisResult.skillGaps,
    strengths: analysisResult.skillStrengths,
    weaknesses: analysisResult.skillGaps,
    recommendedRoles: [analysisResult.careerFit],
    aiSuggestions: analysisResult.aiSuggestions.map(
      (s) => `${s.title}: ${s.description}`
    ),
    aiSummary: `Readiness ${analysisResult.readinessScore}% for ${analysisResult.careerFit}. Resume ${analysisResult.resume.score}%, ATS ${analysisResult.resume.atsScore}%, GitHub ${analysisResult.github.score}%, LinkedIn ${analysisResult.linkedin.score}%.`,
  };

  await prisma.aIAnalysis.upsert({
    where: { userId },
    create: { ...aiData, userId },
    update: aiData,
  });
}

export const upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      college,
      age,
      bio,
      github,
      linkedin,
      careerGoal,
    } = req.body;

    const skills = parseSkills(req.body.skills);

    const data = {
      college: college || null,
      age: age ? Number(age) : null,
      bio: bio || null,
      github: github || null,
      linkedin: linkedin || null,
      careerGoal: careerGoal || null,
    };

    if (name && name.trim()) data.name = name.trim();

    if (req.file) {
      data.resume = `uploads/resumes/${req.file.filename}`;
      data.resumeName = req.file.originalname;
    }

    await prisma.user.update({
      where: { id: userId },
      data,
    });

    await prisma.skill.deleteMany({ where: { userId } });
    if (skills.length > 0) {
      await prisma.skill.createMany({
        data: skills.map((s) => ({ name: s, userId })),
      });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true },
    });

    const analysisResult = await runAnalysis({
      user: fullUser,
      skills: fullUser.skills.map((s) => s.name),
      careerGoal: fullUser.careerGoal,
      resumePath: fullUser.resume,
      githubUrl: fullUser.github,
      linkedinUrl: fullUser.linkedin,
    });

    await persistAnalysis(userId, analysisResult, Boolean(fullUser.resume));

    const userResponse = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, aiAnalysis: true },
    });

    res.status(200).json({
      message: "Profile saved successfully",
      user: userResponse,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("upsertProfile error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { skills: true, aiAnalysis: true, roadmaps: true },
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No resume file provided" });

    const userId = req.user.id;
    const relPath = `uploads/resumes/${req.file.filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: {
        resume: relPath,
        resumeName: req.file.originalname,
      },
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true },
    });

    const analysisResult = await runAnalysis({
      user: fullUser,
      skills: fullUser.skills.map((s) => s.name),
      careerGoal: fullUser.careerGoal,
      resumePath: fullUser.resume,
      githubUrl: fullUser.github,
      linkedinUrl: fullUser.linkedin,
    });

    await persistAnalysis(userId, analysisResult, true);

    res.status(200).json({
      message: "Resume uploaded and analyzed",
      resume: relPath,
      resumeName: req.file.originalname,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("uploadResume error:", error);
    res.status(500).json({ message: error.message });
  }
};
