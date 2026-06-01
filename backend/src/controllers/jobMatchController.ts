import type { Request, Response } from "express";

import prisma from "../config/db.js";
import { matchJobDescription } from "../services/jobMatchService.js";
import { extractResumeText } from "../services/resumeService.js";

export const getJobMatch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { jobDescription } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        error: "Please paste a full job description (at least 50 characters)",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { aiAnalysis: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.resume) {
      return res.status(400).json({
        error: "Please upload your resume first before matching jobs",
      });
    }

    const resumeText = await extractResumeText(user.resume);

    if (!resumeText || resumeText.length < 100) {
      return res.status(400).json({
        error: "Could not read resume. Please re-upload your resume.",
      });
    }

    const extractedSkills = user.aiAnalysis?.extractedSkills ?? [];
    const careerFit =
      user.aiAnalysis?.careerFit ?? user.careerGoal ?? "Software Developer";

    const result = await matchJobDescription(
      resumeText,
      extractedSkills,
      careerFit,
      jobDescription
    );

    return res.status(200).json({
      success: true,
      match: result,
    });
  } catch (error: any) {
    console.error("Job match error:", error);
    return res.status(500).json({
      error: "Failed to analyze job match. Please try again.",
    });
  }
};
