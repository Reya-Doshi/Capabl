import prisma from "../config/db.js";
import { runAnalysis } from "../services/analysisService.js";

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
    return { manualSkills: [], weeklyProgress: [] };
  }
}

const parseSkills = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw.map((s: any) => String(s).trim()).filter(Boolean);
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j))
      return j.map((s: any) => String(s).trim()).filter(Boolean);
  } catch {
    /* not JSON */
  }
  return String(raw)
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
};

const TECH_KEYWORDS = [
  "react",
  "next.js",
  "nextjs",
  "node",
  "express",
  "typescript",
  "javascript",
  "python",
  "java",
  "spring",
  "mysql",
  "postgres",
  "postgresql",
  "mongodb",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "firebase",
  "tailwind",
  "redux",
  "graphql",
  "rest api",
  "fastapi",
  "django",
  "flask",
  "ai",
  "ml",
  "machine learning",
  "deep learning",
  "nlp",
  "llm",
  "rag",
  "gemini",
  "openai",
  "pytorch",
  "tensorflow",
  "voice",
  "websocket",
  "analytics",
];

function normalizeKey(value: any) {
  return String(value || "").toLowerCase().trim();
}

function uniqueStrings(values: any): string[] {
  return Array.from(
    new Set(
      (values || [])
        .map((value: any) => String(value || "").trim())
        .filter(Boolean)
    )
  ) as string[];
}

function toTitleCase(value: any) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
    .trim();
}

function extractTechKeywords(text: any) {
  const haystack = normalizeKey(text);
  return TECH_KEYWORDS.filter((keyword) => haystack.includes(keyword));
}

function parseSavedProject(raw: any) {
  try {
    const project = JSON.parse(raw);
    return {
      title: project.title || project.name || "Untitled project",
      description: project.description || project.summary || "",
      technologies: uniqueStrings(
        parseSkills(project.tags || project.technologies)
      ),
      url: project.url || project.repoUrl || null,
      stars: project.stars || 0,
      readme: project.readme || "",
      source: "profile",
    };
  } catch {
    return null;
  }
}

function buildProjectRecordFromRepo(repo: any, careerFit: any) {
  const repoLanguages = uniqueStrings([
    ...(repo.languages || []),
    repo.language,
  ]);
  const repoText = [repo.description, repo.readme, ...(repo.topics || [])].join(" ");
  const technologies = uniqueStrings([
    ...repoLanguages,
    ...extractTechKeywords(repoText),
  ]);
  const hasDescription = Boolean(String(repo.description || "").trim());
  const hasMultipleTechnologies = technologies.length >= 2;
  const hasRepo = Boolean(repo.repoUrl || repo.url);
  const hasReadme = Boolean(String(repo.readme || "").trim());
  const status = hasDescription && hasMultipleTechnologies && hasRepo && hasReadme
    ? "Completed"
    : "In Progress";

  return {
    title: toTitleCase(repo.name || repo.title),
    description:
      repo.description ||
      `GitHub repository associated with ${careerFit || "the user's profile"}.`,
    technologies,
    status,
    image: "/github.jpg",
    url: repo.repoUrl || repo.url || null,
    stars: repo.stars || 0,
    forks: repo.forks || 0,
    openIssues: repo.openIssues || 0,
    pushedAt: repo.pushedAt || null,
    size: repo.size || 0,
    homepage: repo.homepage || null,
    license: repo.license || null,
    topics: uniqueStrings(repo.topics || []),
    readme: repo.readme || "",
    completion: status,
    source: repo.source || "github",
  };
}

function buildRecommendations(analysisResult: any, projects: any, githubProjects: any) {
  const careerFit = analysisResult.careerFit || "Software Engineer";
  const readiness = analysisResult.readinessScore || 0;
  const missingSkills = uniqueStrings(analysisResult.skillGaps || analysisResult.recommendedSkills || []);
  const githubTech = uniqueStrings(
    githubProjects.flatMap((project: any) => project.technologies || [])
  );
  const allTech = uniqueStrings([
    ...githubTech,
    ...(analysisResult.github?.profile?.topLanguages || []).map((l: any) => l.name),
  ]);

  const suggestions: any[] = [];
  const addSuggestion = (title: any, desc: any, tag: any) => {
    if (!title || suggestions.some((item) => normalizeKey(item.title) === normalizeKey(title))) return;
    suggestions.push({ title, desc, tag });
  };

  const roleKey = normalizeKey(careerFit);
  if (roleKey.includes("ai") || roleKey.includes("ml") || allTech.some((t: any) => /python|nlp|llm|gemini|openai|tensorflow|pytorch/.test(t))) {
    addSuggestion(
      "Build an AI Resume Analyzer",
      `Improve NLP + backend skills by building a resume parser, keyword matcher, and scoring pipeline.`,
      "AI + NLP"
    );
    addSuggestion(
      "Build an Interview Coach Bot",
      `Use your AI stack to simulate interviews and give feedback based on transcripts and scoring.`,
      "LLM"
    );
  }
  if (roleKey.includes("frontend") || allTech.some((t: any) => /react|next.js|tailwind|redux/.test(t))) {
    addSuggestion(
      "Build a Design System Showcase",
      `Strengthen frontend depth with reusable UI components, accessibility, and motion.`,
      "Frontend"
    );
  }
  if (roleKey.includes("backend") || allTech.some((t: any) => /node|express|postgres|mongodb|redis/.test(t))) {
    addSuggestion(
      "Build a Secure API Platform",
      `Improve backend credibility with auth, validation, pagination, and clean API design.`,
      "Backend"
    );
  }
  if (roleKey.includes("data") || allTech.some((t: any) => /python|sql|analytics|pandas|numpy/.test(t))) {
    addSuggestion(
      "Build a Data Insights Dashboard",
      `Turn datasets into visual insights and demonstrate analysis + reporting depth.`,
      "Data"
    );
  }

  if (missingSkills.length > 0) {
    addSuggestion(
      `Build a ${careerFit} Capstone`,
      `Focus on missing skills like ${missingSkills.slice(0, 3).join(", ")} to close your readiness gaps.`,
      missingSkills[0] || "Growth"
    );
  }

  if (readiness < 60) {
    addSuggestion(
      "Ship One Portfolio Project End-to-End",
      `Prioritize completeness, documentation, and deployment to raise project quality quickly.`,
      "Portfolio"
    );
  }

  const existingTitles = new Set(projects.map((project: any) => normalizeKey(project.title)));
  const filtered = suggestions.filter((item: any) => !existingTitles.has(normalizeKey(item.title)));

  return filtered.slice(0, 6);
}

async function persistAnalysis(userId: any, analysisResult: any, hasResume: any) {
  const latestInterview = await prisma.interviewSession.findFirst({
    where: {
      userId,
      status: "finished",
    },
    orderBy: {
      finishedAt: "desc",
    },
    select: {
      score: true,
      readinessScore: true,
      strengths: true,
      weaknesses: true,
      skillGaps: true,
      summary: true,
      purpose: true,
      role: true,
    },
  });

  const existingAnalysis: any = await prisma.aIAnalysis.findUnique({
    where: { userId },
  });

  const githubProjects = (analysisResult.github?.profile?.topRepos || [])
    .map((repo: any) =>
      buildProjectRecordFromRepo(repo, analysisResult.careerFit || "Software Engineer")
    )
    .filter(Boolean);

  const existingProjects: any[] = [];
  if (existingAnalysis) {
    const titles = existingAnalysis.projectTitles || [];
    const descriptions = existingAnalysis.projectDescriptions || [];
    const technologies = existingAnalysis.projectTechnologies || [];
    const statuses = existingAnalysis.projectStatuses || [];
    const images = existingAnalysis.projectImages || [];

    titles.forEach((title: any, index: number) => {
      const project = {
        title,
        description: descriptions[index] || "",
        technologies: parseSkills(technologies[index]),
        status: statuses[index] || "In Progress",
        image: images[index] || "/github.jpg",
        source: "profile",
      };
      existingProjects.push(project);
    });

    (existingAnalysis.savedProjects || [])
      .map(parseSavedProject)
      .filter(Boolean)
      .forEach((project: any) => existingProjects.push(project));
  }

  const mergedProjects = uniqueStrings([
    ...existingProjects.map((project: any) => project.title),
    ...githubProjects.map((project: any) => project.title),
  ]).map((title: any) => {
    const existing = existingProjects.find(
      (project: any) => normalizeKey(project.title) === normalizeKey(title)
    );
    const githubProject = githubProjects.find(
      (project: any) => normalizeKey(project.title) === normalizeKey(title)
    );
    const source = githubProject || existing;
    const technologies = uniqueStrings([
      ...(existing?.technologies || []),
      ...(githubProject?.technologies || []),
    ]);
    const description = githubProject?.description || existing?.description || "";
    const hasDescription = Boolean(description.trim());
    const hasMultipleTechnologies = technologies.length >= 2;
    const hasRepo = Boolean(githubProject?.url || existing?.url);
    const hasReadme = Boolean(githubProject?.readme || existing?.readme);
    const status = hasDescription && hasMultipleTechnologies && hasRepo && hasReadme
      ? "Completed"
      : source?.status || "In Progress";

    return {
      title,
      description,
      technologies,
      status,
      image: source?.image || "/github.jpg",
      url: githubProject?.url || existing?.url || null,
      stars: githubProject?.stars || existing?.stars || 0,
      forks: githubProject?.forks || existing?.forks || 0,
      openIssues: githubProject?.openIssues || existing?.openIssues || 0,
      pushedAt: githubProject?.pushedAt || existing?.pushedAt || null,
      size: githubProject?.size || existing?.size || 0,
      homepage: githubProject?.homepage || existing?.homepage || null,
      license: githubProject?.license || existing?.license || null,
      topics: uniqueStrings([...(githubProject?.topics || []), ...(existing?.topics || [])]),
      readme: githubProject?.readme || existing?.readme || "",
      completion: status,
      source: githubProject?.source || existing?.source || "profile",
    };
  });

  const recommendedProjects = buildRecommendations(
    {
      ...analysisResult,
      interview: latestInterview,
      skillGaps: uniqueStrings([
        ...(analysisResult.skillGaps || []),
        ...(latestInterview?.skillGaps || []),
        ...(latestInterview?.weaknesses || []),
      ]),
      aiSuggestions: uniqueStrings([
        ...(analysisResult.aiSuggestions || []).map((s: any) =>
          typeof s === "string" ? s : `${s.title}: ${s.description}`
        ),
        ...(latestInterview?.summary ? [latestInterview.summary] : []),
      ]),
    },
    mergedProjects,
    githubProjects
  );

  const aiData = {
    careerFit: analysisResult.careerFit,
    readinessScore: analysisResult.readinessScore,
    atsScore: analysisResult.resume.atsScore,
    resumeScore: hasResume ? analysisResult.resume.score : 0,
    githubScore: analysisResult.github.score,
    linkedinScore: analysisResult.linkedin.score,
    languages: uniqueStrings(
      (analysisResult.github?.profile?.topLanguages || []).map((language: any) =>
        language.name
      )
    ),
    extractedSkills: analysisResult.extractedSkills,
    missingSkills: analysisResult.skillGaps,
    strengths: analysisResult.skillStrengths,
    weaknesses: analysisResult.skillGaps,
    recommendedRoles: [analysisResult.careerFit],
    recommendedCourses: uniqueStrings(
      analysisResult.recommendedSkills?.map(
        (skill: any) => `Course on ${skill}`
      ) || []
    ),
    recommendedInternships: uniqueStrings([
      `Search for ${analysisResult.careerFit} internships`,
    ]),
    internshipExperience: [],
    certifications: [],
    aiSuggestions: analysisResult.aiSuggestions.map(
      (s: any) => `${s.title}: ${s.description}`
    ),
    whyRecommendations: uniqueStrings([
      `Readiness is ${analysisResult.readinessScore}% for ${analysisResult.careerFit}`,
      ...(analysisResult.skillGaps || []).slice(0, 3).map(
        (skill: any) => `Close the ${skill} gap with project work`
      ),
    ]),
    projectTitles: mergedProjects.map((project: any) => project.title),
    projectDescriptions: mergedProjects.map((project: any) => project.description),
    projectTechnologies: mergedProjects.map((project: any) =>
      uniqueStrings(project.technologies || []).join(", ")
    ),
    projectImages: mergedProjects.map((project: any) => project.image || "/github.jpg"),
    projectStatuses: mergedProjects.map((project: any) => project.status || "In Progress"),
    savedProjects: mergedProjects.map((project: any) =>
      JSON.stringify({
        title: project.title,
        description: project.description,
        technologies: project.technologies || [],
        status: project.status,
        url: project.url,
        stars: project.stars,
        forks: project.forks,
        openIssues: project.openIssues,
        pushedAt: project.pushedAt,
        size: project.size,
        homepage: project.homepage,
        license: project.license,
        topics: project.topics || [],
        readme: project.readme || "",
        source: project.source,
      })
    ),
    recommendedProjects: recommendedProjects.map((project: any) => project.title),
    recommendedProjectTitles: recommendedProjects.map((project: any) => project.title),
    recommendedProjectDesc: recommendedProjects.map((project: any) => project.desc),
    recommendedProjectTags: recommendedProjects.map((project: any) => project.tag),
    totalProjects: mergedProjects.length,
    completedProjects: mergedProjects.filter(
      (project: any) => project.status === "Completed"
    ).length,
    inProgressProjects: mergedProjects.filter(
      (project: any) => project.status === "In Progress"
    ).length,
    aiSummary: `Readiness ${analysisResult.readinessScore}% for ${analysisResult.careerFit}. Resume ${analysisResult.resume.score}%, ATS ${analysisResult.resume.atsScore}%, GitHub ${analysisResult.github.score}%, LinkedIn ${analysisResult.linkedin.score}%.`,
  };

  await prisma.aIAnalysis.upsert({
    where: { userId },
    create: { ...aiData, userId },
    update: aiData,
  });
}

export const upsertProfile = async (req: any, res: any) => {
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

    const data: any = {
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
        data: skills.map((s: any) => ({ name: s, userId })),
      });
    }

    const fullUser: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true },
    });

    const { manualSkills, weeklyProgress } = await loadManualProgress(userId);

    const analysisResult = await runAnalysis({
      user: fullUser,
      skills: fullUser.skills.map((s: any) => s.name),
      careerGoal: fullUser.careerGoal,
      resumePath: fullUser.resume,
      githubUrl: fullUser.github,
      linkedinUrl: fullUser.linkedin,
      manualSkills,
      weeklyProgress,
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
  } catch (error: any) {
    console.error("upsertProfile error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { skills: true, aiAnalysis: true, roadmaps: true },
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadResume = async (req: any, res: any) => {
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

    const fullUser: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true },
    });

    const { manualSkills, weeklyProgress } = await loadManualProgress(userId);

    const analysisResult = await runAnalysis({
      user: fullUser,
      skills: fullUser.skills.map((s: any) => s.name),
      careerGoal: fullUser.careerGoal,
      resumePath: fullUser.resume,
      githubUrl: fullUser.github,
      linkedinUrl: fullUser.linkedin,
      manualSkills,
      weeklyProgress,
    });

    await persistAnalysis(userId, analysisResult, true);

    res.status(200).json({
      message: "Resume uploaded and analyzed",
      resume: relPath,
      resumeName: req.file.originalname,
      analysis: analysisResult,
    });
  } catch (error: any) {
    console.error("uploadResume error:", error);
    res.status(500).json({ message: error.message });
  }
};
