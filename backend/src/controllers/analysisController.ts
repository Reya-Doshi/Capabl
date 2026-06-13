import prisma from "../config/db.js";
import { recomputeUserAnalysis } from "./profileController.js";

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

async function loadUser(userId: any) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { skills: true, aiAnalysis: true, roadmaps: true },
  });
}

async function sendCanonicalAnalysis(req: any, res: any) {
  const userId = req.user.id;
  const analysis = await recomputeUserAnalysis(userId);
  const user: any = await loadUser(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    user: buildUserPayload(user),
    analysis,
    stored: user.aiAnalysis || null,
  });
}

export const getAnalysis = async (req: any, res: any) => {
  try {
    await sendCanonicalAnalysis(req, res);
  } catch (error: any) {
    console.error("getAnalysis error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const refreshAnalysis = async (req: any, res: any) => {
  try {
    await sendCanonicalAnalysis(req, res);
  } catch (error: any) {
    console.error("refreshAnalysis error:", error);
    res.status(500).json({ message: error.message });
  }
};
