import prisma from "../config/db.js";
import { runAnalysis } from "../services/analysisService.js";
import { extractResumeText } from "../services/resumeService.js";
import { extractResumeProfile } from "../services/resumeExtractionService.js";

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

export function buildCanonicalAnalysisDto(analysisResult: any) {
  return {
    readinessScore: analysisResult.readinessScore,
    matchScore: analysisResult.matchScore,
    skillStrengths: analysisResult.skillStrengths || [],
    skillGaps: analysisResult.skillGaps || [],
    recommendedSkills: analysisResult.recommendedSkills || [],
    roadmap: analysisResult.roadmap || [],
    roadmapStages: analysisResult.roadmapStages || [],
    confidence: analysisResult.confidence || "Low",
    evidenceSummary:
      analysisResult.evidenceSummary ||
      analysisResult.scoreExplanation?.evidenceSummary ||
      {},
    skillProficiency: analysisResult.skillProficiency || [],
    profileCompleteness: analysisResult.profileCompleteness || 0,
    scoreExplanation: analysisResult.scoreExplanation || null,
    profileStatus: analysisResult.profileStatus || null,
  };
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
    canonicalAnalysis: buildCanonicalAnalysisDto(analysisResult),
    careerFit: analysisResult.careerFit,
    readinessScore: analysisResult.readinessScore,
    matchScore: analysisResult.matchScore,
    profileCompleteness: analysisResult.profileCompleteness,
    evidenceSummary:
      analysisResult.evidenceSummary ||
      analysisResult.scoreExplanation?.evidenceSummary ||
      {},
    skillProficiency: analysisResult.skillProficiency || [],
    roadmapPlan: {
      weeks: analysisResult.roadmap || [],
      stages: analysisResult.roadmapStages || [],
    },
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
    requiredSkills: analysisResult.requiredSkills,
    roleIntelligence: analysisResult.roleIntelligence,
    roleGoalSnapshot: analysisResult.roleGoalSnapshot,
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

// Reconstruct lightweight project evidence ({title, description, technologies})
// from a persisted AIAnalysis row so re-runs feed the projects evidence source.
function projectsFromAnalysis(ai: any): any[] {
  if (!ai) return [];
  const out: any[] = [];
  const titles = ai.projectTitles || [];
  const descriptions = ai.projectDescriptions || [];
  const technologies = ai.projectTechnologies || [];
  titles.forEach((title: any, i: number) => {
    out.push({
      title,
      description: descriptions[i] || "",
      technologies: parseSkills(technologies[i]),
    });
  });
  (ai.savedProjects || []).forEach((raw: any) => {
    const p = parseSavedProject(raw);
    if (p) out.push({ title: p.title, description: p.description, technologies: p.technologies });
  });
  return out;
}

// Parse a field that may arrive as a JSON string (FormData) or a real array.
function parseJsonField(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

// Persist confirmed education + certifications + phone from the Review step onto
// the AIAnalysis row. Only updates an existing row (persistAnalysis creates it
// first) and only sets fields that were actually provided.
async function patchConfirmedProfile(userId: any, body: any) {
  const education = parseJsonField(body.education);
  const certifications = parseJsonField(body.certifications);
  const phone = body.phone ? String(body.phone).trim() : null;

  const patch: any = {};
  if (phone) patch.phone = phone;

  const edu = education[0];
  if (edu && typeof edu === "object") {
    if (edu.degree) patch.degree = String(edu.degree);
    if (edu.field) patch.specialization = String(edu.field);
    if (edu.institution) patch.collegeName = String(edu.institution);
    if (edu.startYear) patch.startYear = String(edu.startYear);
    if (edu.endYear) patch.endYear = String(edu.endYear);
    if (edu.cgpa) patch.cgpa = String(edu.cgpa);
  }

  if (certifications.length) {
    patch.certifications = uniqueStrings(
      certifications.map((c: any) =>
        typeof c === "string" ? c : [c?.name, c?.issuer].filter(Boolean).join(" — ")
      )
    );
  }

  // Persist onboarding-confirmed projects so future re-runs (e.g. after an
  // interview) keep the projects evidence source. Only fill when the analysis
  // row has no projects yet — never clobber GitHub-derived projects.
  const projects = parseJsonField(body.projects).filter(
    (p: any) => p && (p.title || p.description)
  );
  if (projects.length) {
    const existing = await prisma.aIAnalysis.findUnique({
      where: { userId },
      select: { projectTitles: true },
    });
    if (existing && (existing.projectTitles || []).length === 0) {
      patch.projectTitles = projects.map((p: any) => p.title || "Untitled project");
      patch.projectDescriptions = projects.map((p: any) => p.description || "");
      patch.projectTechnologies = projects.map((p: any) =>
        uniqueStrings(parseSkills(p.technologies)).join(", ")
      );
      patch.projectStatuses = projects.map(() => "In Progress");
      patch.projectImages = projects.map(() => "/github.jpg");
      patch.totalProjects = projects.length;
    }
  }

  if (Object.keys(patch).length === 0) return;

  try {
    await prisma.aIAnalysis.update({ where: { userId }, data: patch });
  } catch (e: any) {
    console.warn("[patchConfirmedProfile] skipped:", e.message);
  }
}

// Build a combined interview transcript from the user's finished sessions, used
// as the highest-weight evidence source. Accumulating across sessions is what
// makes confidence rise over repeated interviews (v4 continuous loop).
export async function loadInterviewText(userId: any): Promise<string> {
  try {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId, status: "finished" },
      orderBy: { finishedAt: "desc" },
      take: 5,
      select: { turns: true, summary: true, strengths: true },
    });
    const blocks: string[] = [];
    for (const s of sessions) {
      const turns = Array.isArray(s.turns) ? (s.turns as any[]) : [];
      for (const t of turns) {
        if (t?.question) blocks.push(`Q: ${t.question}`);
        if (t?.answer) blocks.push(`A: ${t.answer}`);
      }
      if (s.summary) blocks.push(String(s.summary));
      if (Array.isArray(s.strengths) && s.strengths.length)
        blocks.push(`Demonstrated strengths: ${s.strengths.join(", ")}`);
    }
    return blocks.join("\n").slice(0, 12000);
  } catch {
    return "";
  }
}

// Canonical "recompute the full readiness pipeline for a user" path. Loads every
// evidence source (resume, projects, certs, roadmap, interview transcripts),
// re-runs Semantic Evidence Matching, and persists the result. Called after an
// interview finishes so demonstrated skills reshape the score — not a flat shift.
export async function recomputeUserAnalysis(userId: any) {
  const fullUser: any = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: true, aiAnalysis: true },
  });
  if (!fullUser) return null;

  const { manualSkills, weeklyProgress } = await loadManualProgress(userId);
  const interviewText = await loadInterviewText(userId);

  const analysisResult = await runAnalysis({
    user: fullUser,
    skills: fullUser.skills.map((s: any) => s.name),
    careerGoal: fullUser.careerGoal,
    resumePath: fullUser.resume,
    githubUrl: fullUser.github,
    linkedinUrl: fullUser.linkedin,
    manualSkills,
    weeklyProgress,
    projects: projectsFromAnalysis(fullUser.aiAnalysis),
    certifications: fullUser.aiAnalysis?.certifications || [],
    interviewText,
    cachedRoleIntelligence: {
      goalSnapshot: fullUser.aiAnalysis?.roleGoalSnapshot,
      requiredSkills: fullUser.aiAnalysis?.requiredSkills,
      roleIntelligence: fullUser.aiAnalysis?.roleIntelligence,
    },
  });

  await persistAnalysis(userId, analysisResult, Boolean(fullUser.resume));
  return analysisResult;
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
      portfolio,
      phone,
      careerGoal,
    } = req.body;

    const skills = parseSkills(req.body.skills);

    const data: any = {
      college: college || null,
      age: age ? Number(age) : null,
      bio: bio || null,
      github: github || null,
      linkedin: linkedin || null,
      portfolio: portfolio || null,
      phone: phone || null,
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
      include: { skills: true, aiAnalysis: true },
    });

    const { manualSkills, weeklyProgress } = await loadManualProgress(userId);

    const confirmedCertifications = parseJsonField(req.body.certifications).map(
      (c: any) => (typeof c === "string" ? c : c?.name)
    ).filter(Boolean);

    // Project evidence: onboarding-confirmed projects (Review step) merged with
    // any already saved on the analysis row, so the 0.25 projects weight is real.
    const confirmedProjects = parseJsonField(req.body.projects)
      .filter((p: any) => p && (p.title || p.description))
      .map((p: any) => ({
        title: p.title || "",
        description: p.description || "",
        technologies: parseSkills(p.technologies),
      }));
    const projectEvidence = confirmedProjects.length
      ? confirmedProjects
      : projectsFromAnalysis(fullUser.aiAnalysis);

    const analysisResult = await runAnalysis({
      user: fullUser,
      skills: fullUser.skills.map((s: any) => s.name),
      careerGoal: fullUser.careerGoal,
      resumePath: fullUser.resume,
      githubUrl: fullUser.github,
      linkedinUrl: fullUser.linkedin,
      manualSkills,
      weeklyProgress,
      projects: projectEvidence,
      interviewText: await loadInterviewText(userId),
      certifications: confirmedCertifications.length
        ? confirmedCertifications
        : fullUser.aiAnalysis?.certifications || [],
      cachedRoleIntelligence: {
        goalSnapshot: fullUser.aiAnalysis?.roleGoalSnapshot,
        requiredSkills: fullUser.aiAnalysis?.requiredSkills,
        roleIntelligence: fullUser.aiAnalysis?.roleIntelligence,
      },
    });

    await persistAnalysis(userId, analysisResult, Boolean(fullUser.resume));

    // Patch confirmed structured fields from the onboarding "Review" step onto
    // the AIAnalysis row. Additive — only touches fields the analysis pipeline
    // doesn't own (education + certifications + phone), and only when provided.
    await patchConfirmedProfile(userId, req.body);

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

    // Re-run the full pipeline (includes any past interview evidence).
    const analysisResult = await recomputeUserAnalysis(userId);

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

// ---------------------------------------------------------------------------
// POST /api/profile/resume/extract  — resume-first onboarding (Step 2 → 3)
//
// Saves the uploaded resume and returns a structured ResumeExtraction for the
// "Review Your Profile" screen. Deliberately does NOT persist profile fields or
// run the full analysis — that happens only after the user confirms (POST /).
// ---------------------------------------------------------------------------
export const extractResume = async (req: any, res: any) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No resume file provided" });

    const userId = req.user.id;
    const relPath = `uploads/resumes/${req.file.filename}`;

    // Persist only the resume pointer so the confirm step doesn't need to
    // re-upload the file. Profile fields stay untouched until confirmed.
    await prisma.user.update({
      where: { id: userId },
      data: { resume: relPath, resumeName: req.file.originalname },
    });

    const resumeText = await extractResumeText(relPath);
    const extraction = await extractResumeProfile(resumeText);

    res.status(200).json({
      message: "Resume parsed",
      resume: relPath,
      resumeName: req.file.originalname,
      extraction,
    });
  } catch (error: any) {
    console.error("extractResume error:", error);
    res.status(500).json({ message: error.message });
  }
};
