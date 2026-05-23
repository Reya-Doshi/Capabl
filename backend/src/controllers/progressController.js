import prisma from "../config/db.js";

function normaliseSkill(raw) {
  return String(raw || "").trim().toLowerCase();
}

export const toggleSkillProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillName = normaliseSkill(req.body?.skillName);
    const completed = Boolean(req.body?.completed);

    if (!skillName) {
      return res.status(400).json({ message: "skillName is required" });
    }

    if (completed) {
      await prisma.skillProgress.upsert({
        where: { userId_skillName: { userId, skillName } },
        create: { userId, skillName, source: "manual" },
        update: { completedAt: new Date() },
      });
    } else {
      await prisma.skillProgress
        .delete({
          where: { userId_skillName: { userId, skillName } },
        })
        .catch(() => null);
    }

    const list = await prisma.skillProgress.findMany({
      where: { userId },
      select: { skillName: true },
    });

    res.status(200).json({
      message: "Skill progress updated",
      manualSkills: list.map((s) => s.skillName),
    });
  } catch (error) {
    console.error("toggleSkillProgress error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const toggleWeeklyTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const week = Number(req.body?.week);
    const taskKey = normaliseSkill(req.body?.taskKey);
    const completed = Boolean(req.body?.completed);

    if (!Number.isFinite(week) || !taskKey) {
      return res
        .status(400)
        .json({ message: "week and taskKey are required" });
    }

    if (completed) {
      await prisma.weeklyTaskProgress.upsert({
        where: { userId_week_taskKey: { userId, week, taskKey } },
        create: { userId, week, taskKey },
        update: { completedAt: new Date() },
      });
    } else {
      await prisma.weeklyTaskProgress
        .delete({
          where: { userId_week_taskKey: { userId, week, taskKey } },
        })
        .catch(() => null);
    }

    const list = await prisma.weeklyTaskProgress.findMany({
      where: { userId },
      select: { week: true, taskKey: true },
    });

    res.status(200).json({
      message: "Weekly task updated",
      weeklyProgress: list,
    });
  } catch (error) {
    console.error("toggleWeeklyTask error:", error);
    res.status(500).json({ message: error.message });
  }
};
