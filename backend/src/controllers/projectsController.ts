import prisma from "../config/db.js";
import { fetchGithubProfile } from "../services/socialService.js";

function uniqueStrings(values: any[] = []): string[] {
  return [...new Set(
    values
      .filter(Boolean)
      .map((v: any) => String(v).trim())
  )];
}

function extractGithubUsername(value: any) {
  if (!value) return null;

  return String(value)
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^www\.github\.com\//i, "")
    .replace(/\/$/, "")
    .trim()
    .replace(/^@/, "") || null;
}

function normalizeKey(value: any) {
  return String(value || "").toLowerCase().trim();
}

function clampScore(score: any) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function parseTechList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String).map((s: string) => s.trim()).filter(Boolean);
  }
  return String(value)
    .split(/[,|·•]/g)
    .map((s: string) => s.trim())
    .filter(Boolean);
}

function toTitleCase(value: any) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
    .trim();
}

function githubHeaders() {
  return {
    "User-Agent": "Capabl-Project-Scorer",
    Accept: "application/vnd.github+json",
  };
}

async function fetchJson(url: any, extraHeaders: any = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        ...githubHeaders(),
        ...extraHeaders,
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchText(url: any, extraHeaders: any = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        ...githubHeaders(),
        ...extraHeaders,
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function wordSet(value: any) {
  return new Set(
    String(value || "")
      .toLowerCase()
      .split(/[^a-z0-9+.#/-]+/i)
      .map((s: string) => s.trim())
      .filter(Boolean)
  );
}

function countMatches(text: any, keywords: any[]) {
  const haystack = normalizeKey(text);
  return keywords.reduce((count: number, keyword: any) => {
    if (!keyword) return count;
    return haystack.includes(keyword) ? count + 1 : count;
  }, 0);
}

function readmeQualityScore(readmeText: any) {
  if (!readmeText) return 0;

  const text = String(readmeText);
  let score = 0;

  if (text.length >= 120) score += 15;
  if (text.length >= 300) score += 15;
  if (text.length >= 800) score += 10;
  if ((text.match(/^#{1,3}\s+/gm) || []).length >= 2) score += 15;
  if ((text.match(/```/g) || []).length >= 2) score += 10;
  if ((text.match(/\]\(/g) || []).length >= 2) score += 10;
  if (/install|setup|usage|run|docker|environment|deploy|getting started|npm|pip/i.test(text)) {
    score += 15;
  }
  if (/license|contributing|architecture|features|screenshots?/i.test(text)) {
    score += 10;
  }

  return clampScore(score);
}

function buildSignalText(project: any, repoContext: any, careerFit: any, aiAnalysis: any) {
  const parts = [
    project.title,
    project.description,
    project.tech,
    repoContext?.description,
    repoContext?.readme,
    ...(repoContext?.languages || []),
    ...(repoContext?.topics || []),
    careerFit,
    ...(aiAnalysis?.extractedSkills || []),
    ...(aiAnalysis?.strengths || []),
    ...(aiAnalysis?.recommendedProjects || []),
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function collectCareerKeywords(careerFit: any, aiAnalysis: any) {
  return new Set(
    [
      careerFit,
      ...(String(careerFit || "")
        .toLowerCase()
        .split(/[^a-z0-9+.#/-]+/i)
        .filter(Boolean)),
      ...(aiAnalysis?.extractedSkills || []),
      ...(aiAnalysis?.strengths || []),
      ...(aiAnalysis?.recommendedProjects || []),
      ...(aiAnalysis?.careerFit ? [aiAnalysis.careerFit] : []),
    ]
      .map(normalizeKey)
      .filter(Boolean)
  );
}

function scoreProject({ project, repoContext, careerFit, aiAnalysis }: any) {
  const signalText = buildSignalText(project, repoContext, careerFit, aiAnalysis);
  const repoLanguages = Array.isArray(repoContext?.languages) ? repoContext.languages : [];
  const techTokens = new Set(
    [
      ...parseTechList(project.tech),
      ...repoLanguages,
      ...(repoContext?.topics || []),
    ]
      .map(normalizeKey)
      .filter(Boolean)
  );

  const careerKeywords = collectCareerKeywords(careerFit, aiAnalysis);
  const techWords = [
    "react",
    "next.js",
    "node",
    "express",
    "python",
    "typescript",
    "mongodb",
    "postgresql",
    "tailwind",
    "docker",
    "redis",
    "graphql",
    "rest",
    "api",
    "aws",
    "ml",
    "ai",
  ];
  const innovationWords = [
    "ai",
    "ml",
    "machine learning",
    "deep learning",
    "llm",
    "rag",
    "chatbot",
    "voice",
    "automation",
    "realtime",
    "real-time",
    "analytics",
    "recommendation",
    "personalized",
    "prediction",
    "vision",
    "assistant",
    "workflow",
  ];
  const complexityWords = [
    "microservice",
    "microservices",
    "auth",
    "authentication",
    "authorization",
    "websocket",
    "streaming",
    "queue",
    "cache",
    "pipeline",
    "orchestration",
    "multi-step",
    "multi tenant",
    "scalable",
    "distributed",
    "scheduling",
    "scheduler",
    "etl",
    "data pipeline",
    "devops",
  ];
  const completenessWords = [
    "readme",
    "documentation",
    "demo",
    "setup",
    "install",
    "test",
    "tests",
    "deployment",
    "license",
    "contributing",
    "screenshot",
    "architecture",
    "usage",
    "examples",
  ];

  const languageCount = repoLanguages.length;
  const repoSize = Number(repoContext?.size || 0);
  const stars = Number(repoContext?.stars || 0);
  const forks = Number(repoContext?.forks || 0);
  const openIssues = Number(repoContext?.openIssues || 0);
  const pushedAt = repoContext?.pushedAt ? new Date(repoContext.pushedAt) : null;
  const daysSinceUpdate = pushedAt
    ? Math.max(0, (Date.now() - pushedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const descriptionText = `${project.description || ""} ${repoContext?.description || ""}`.toLowerCase();
  const hasGitHubRepo = Boolean(repoContext);
  const hasReadme = Boolean(repoContext?.readme?.trim());
  const hasHomepage = Boolean(repoContext?.homepage);
  const hasLicense = Boolean(repoContext?.license);
  const hasTopics = Boolean(repoContext?.topics?.length);
  const hasDetails = Boolean(descriptionText.trim());
  const hasTech = techTokens.size > 0;
  const hasCompletionHints = countMatches(signalText, completenessWords) > 0;
  const hasInnovationHints = countMatches(signalText, innovationWords) > 0;
  const hasComplexityHints = countMatches(signalText, complexityWords) > 0;
  const techMatches = countMatches(signalText, techWords) + [...careerKeywords].filter((k: any) => techTokens.has(k)).length;
  const relevanceMatches = [...careerKeywords].filter((keyword: any) => signalText.includes(keyword)).length;
  const languageHits = languageCount >= 1 ? 1 : 0;

  const complexity = clampScore(
    Math.min(30, languageCount * 7) +
      Math.min(20, Math.log2(repoSize + 1) * 2.5) +
      Math.min(15, forks * 3) +
      Math.min(10, openIssues * 2) +
      (hasComplexityHints ? 15 : 0) +
      (hasGitHubRepo ? 10 : 0)
  );

  const technologies = clampScore(
    Math.min(30, techTokens.size * 7) +
      Math.min(25, techMatches * 8) +
      (languageHits ? 15 : 0) +
      (hasGitHubRepo ? 10 : 0) +
      (hasDetails ? 10 : 0) +
      (project.tech ? 10 : 0)
  );

  const documentation = clampScore(readmeQualityScore(repoContext?.readme));

  const innovation = clampScore(
    Math.min(35, countMatches(signalText, innovationWords) * 12) +
      (hasInnovationHints ? 20 : 0) +
      (hasReadme ? 10 : 0) +
      (project.description && project.description.length > 80 ? 10 : 0)
  );

  const completeness = clampScore(
    (hasDetails ? 20 : 0) +
      (hasTech ? 15 : 0) +
      (hasReadme ? 25 : 0) +
      (hasHomepage ? 10 : 0) +
      (hasLicense ? 10 : 0) +
      (hasTopics ? 5 : 0) +
      (hasCompletionHints ? 15 : 0)
  );

  const githubActivity = clampScore(
    Math.min(35, stars * 5) +
      Math.min(20, forks * 4) +
      (daysSinceUpdate == null
        ? 0
        : daysSinceUpdate <= 30
        ? 35
        : daysSinceUpdate <= 90
        ? 28
        : daysSinceUpdate <= 180
        ? 20
        : daysSinceUpdate <= 365
        ? 12
        : 5)
  );

  const relevance = clampScore(
    Math.min(40, relevanceMatches * 12) +
      Math.min(20, [...careerKeywords].filter((keyword: any) => techTokens.has(keyword)).length * 8) +
      (careerFit && signalText.includes(normalizeKey(careerFit)) ? 20 : 0) +
      (hasGitHubRepo ? 10 : 0)
  );

  const roleLabel = careerFit || "your target role";
  const breakdown: { reason: string; points: number }[] = [];

  if (countMatches(signalText, innovationWords) > 0) {
    breakdown.push({ reason: "AI keywords", points: 10 });
  }

  if (relevance >= 60) {
    breakdown.push({ reason: `Relevant to ${roleLabel}`, points: 15 });
  }

  const strongStackHit = technologies >= 75 || techTokens.size >= 3 || languageCount >= 2;
  if (strongStackHit) {
    breakdown.push({ reason: "Strong technical stack", points: 15 });
  }

  const docsHit = readmeQualityScore(repoContext?.readme) >= 60;
  if (docsHit) {
    breakdown.push({ reason: "Well documented", points: 10 });
  }

  const complexHit = complexity >= 70;
  if (complexHit) {
    breakdown.push({ reason: "High project complexity", points: 20 });
  }

  if (completeness >= 70) {
    breakdown.push({ reason: "Looks production-ready", points: 10 });
  }

  if (githubActivity >= 60 || (daysSinceUpdate != null && daysSinceUpdate <= 90)) {
    breakdown.push({ reason: "Recently active on GitHub", points: 10 });
  }

  if (stars > 0) {
    breakdown.push({ reason: "GitHub traction", points: 5 });
  }

  if ((hasDetails && hasTech) || (hasReadme && hasDetails)) {
    breakdown.push({ reason: "Project completeness", points: 5 });
  }

  const score = clampScore(
    breakdown.reduce((total, entry) => total + entry.points, 0)
  );

  const reasons = breakdown.map((entry) => entry.reason);

  return {
    score,
    reasons,
    breakdown,
  };
}

function buildStoredProjects(aiAnalysis: any, careerFit: any) {
  if (!aiAnalysis) return [];

  const titles = aiAnalysis.projectTitles || [];
  if (titles.length > 0) {
    return titles.map((title: any, index: number) => {
      const tech = parseTechList(aiAnalysis.projectTechnologies?.[index]);
      const description = aiAnalysis.projectDescriptions?.[index] || "";
      const status = aiAnalysis.projectStatuses?.[index] || "Completed";
      const project = {
        title,
        description: description || "Portfolio project from your profile analysis.",
        tech: tech.length ? tech.join(", ") : "Portfolio",
        image: "/github.jpg",
        status,
      };
      const scored = scoreProject({
        project,
        repoContext: null,
        careerFit,
        aiAnalysis,
      });
      return {
        ...project,
        score: scored.score,
        reasons: scored.reasons,
        breakdown: scored.breakdown,
        source: "profile",
      };
    });
  }

  return (aiAnalysis.savedProjects || [])
    .map((raw: any) => {
      try {
        const project = JSON.parse(raw);
        const title = project.title || project.name || "Untitled project";
        const description = project.description || project.summary || "";
        const tech = parseTechList(project.tags || project.technologies);
        const status = project.status || "Completed";
        const baseProject = {
          title,
          description: description || "Portfolio project from your profile analysis.",
          tech: tech.length ? tech.join(", ") : "Portfolio",
          image: project.image || "/github.jpg",
          status,
        };
        const scored = scoreProject({
          project: baseProject,
          repoContext: null,
          careerFit,
          aiAnalysis,
        });
        return {
          ...baseProject,
          score: scored.score,
          reasons: scored.reasons,
          breakdown: scored.breakdown,
          source: "profile",
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function buildGithubProjects(githubProfile: any, aiAnalysis: any, careerFit: any) {
  if (!githubProfile?.ok || !githubProfile?.username) return [];

  const repos = githubProfile.topRepos || [];
  const usableRepos = repos.filter((repo: any) => {
    console.log("REPO BEFORE FILTER:", repo?.name);
    return Boolean(
      repo?.name ||
        repo?.description ||
        repo?.language ||
        repo?.stars ||
        repo?.url
    );
  });

  console.log("REPO AFTER FILTER:", usableRepos.map((repo: any) => repo?.name));

  const projectResults = await Promise.all(
    usableRepos.map(async (repoContext: any) => {
      const technologies = uniqueStrings([
        ...(repoContext.languages || []),
        repoContext.language,
      ]);
      const description =
        repoContext.description ||
        "GitHub repository imported from your profile.";
      const status =
        repoContext.size > 50 ? "Completed" : "In Progress";

      const baseProject = {
        title: toTitleCase(repoContext.name),
        description,
        tech: technologies.length ? technologies.join(", ") : repoContext.language || "GitHub",
        image: "/github.jpg",
        status,
        url: repoContext.url,
        stars: repoContext.stars || 0,
        forks: repoContext.forks || 0,
        openIssues: repoContext.openIssues || 0,
        pushedAt: repoContext.pushedAt || null,
        size: repoContext.size || 0,
        homepage: repoContext.homepage || null,
        license: repoContext.license || null,
        topics: uniqueStrings(repoContext.topics || []),
        languages: technologies,
        readme: repoContext.readme || "",
      };

      const scored = scoreProject({
        project: baseProject,
        repoContext,
        careerFit,
        aiAnalysis,
      });

      return {
        ...baseProject,
        score: scored.score,
        reasons: scored.reasons,
        breakdown: scored.breakdown,
        source: "github",
      };
    })
  );

  const filteredProjects = projectResults.filter(Boolean);
  console.log("GITHUB_PROJECTS FINAL:", filteredProjects);
  return filteredProjects;
}

function buildRecommendedProjects(aiAnalysis: any, careerFit: any, existingProjects: any) {
  const titles = aiAnalysis?.recommendedProjectTitles?.length
    ? aiAnalysis.recommendedProjectTitles
    : aiAnalysis?.recommendedProjects || [];
  const descs = aiAnalysis?.recommendedProjectDesc || [];
  const tags = aiAnalysis?.recommendedProjectTags || [];

  const explicit = titles
    .map((title: any, index: number) => ({
      title,
      desc:
        descs[index] ||
        `Build ${title} to strengthen your ${careerFit || "target role"} profile.`,
      tag: tags[index] || careerFit || "Portfolio",
    }))
    .filter((item: any) => normalizeKey(item.title));

  if (explicit.length > 0) {
    return explicit;
  }

  const role = normalizeKey(careerFit);
  const templates =
    ROLE_TEMPLATES[role] || ROLE_TEMPLATES.frontend || ROLE_TEMPLATES["full stack"];

  const existing = new Set(existingProjects.map((project: any) => normalizeKey(project.title)));

  return templates
    .filter((template: any) => !existing.has(normalizeKey(template.title)))
    .slice(0, 4)
    .map((template: any) => ({
      title: template.title,
      desc: template.desc(careerFit),
      tag: template.tag,
    }));
}

function parseStoredProject(raw: any) {
  try {
    const project = JSON.parse(raw);
    return {
      title: project.title || project.name || "Untitled project",
      description: project.description || project.summary || "",
      technologies: uniqueStrings(parseTechList(project.technologies || project.tags)),
      status: project.status || "In Progress",
      image: project.image || "/github.jpg",
      url: project.url || project.repoUrl || null,
      stars: project.stars || 0,
      forks: project.forks || 0,
      openIssues: project.openIssues || 0,
      pushedAt: project.pushedAt || null,
      size: project.size || 0,
      homepage: project.homepage || null,
      license: project.license || null,
      topics: uniqueStrings(project.topics || []),
      readme: project.readme || "",
      source: project.source || "profile",
    };
  } catch {
    return null;
  }
}

function collectStoredProjects(aiAnalysis: any) {
  const projects: any[] = [];

  const titles = aiAnalysis?.projectTitles || [];
  const descriptions = aiAnalysis?.projectDescriptions || [];
  const technologies = aiAnalysis?.projectTechnologies || [];
  const statuses = aiAnalysis?.projectStatuses || [];
  const images = aiAnalysis?.projectImages || [];

  titles.forEach((title: any, index: number) => {
    projects.push({
      title,
      description: descriptions[index] || "",
      technologies: uniqueStrings(parseTechList(technologies[index])),
      status: statuses[index] || "In Progress",
      image: images[index] || "/github.jpg",
      source: "profile",
    });
  });

  (aiAnalysis?.savedProjects || [])
    .map(parseStoredProject)
    .filter(Boolean)
    .forEach((project: any) => projects.push(project));

  return projects;
}

function buildProjectMemoryPayload(projects: any[]) {
  const completedProjects = projects.filter((project: any) => project.status === "Completed").length;
  const inProgressProjects = projects.filter((project: any) => project.status === "In Progress").length;

  return {
    projectTitles: projects.map((project: any) => project.title),
    projectDescriptions: projects.map((project: any) => project.description || ""),
    projectTechnologies: projects.map((project: any) => uniqueStrings(project.technologies || []).join(", ")),
    projectStatuses: projects.map((project: any) => project.status || "In Progress"),
    projectImages: projects.map((project: any) => project.image || "/github.jpg"),
    savedProjects: projects.map((project: any) =>
      JSON.stringify({
        title: project.title,
        description: project.description || "",
        technologies: uniqueStrings(project.technologies || []),
        status: project.status || "In Progress",
        image: project.image || "/github.jpg",
        url: project.url || null,
        stars: project.stars || 0,
        forks: project.forks || 0,
        openIssues: project.openIssues || 0,
        pushedAt: project.pushedAt || null,
        size: project.size || 0,
        homepage: project.homepage || null,
        license: project.license || null,
        topics: uniqueStrings(project.topics || []),
        readme: project.readme || "",
        source: project.source || "profile",
      })
    ),
    totalProjects: projects.length,
    completedProjects,
    inProgressProjects,
  };
}

const ROLE_TEMPLATES: Record<string, any[]> = {
  "full stack": [
    {
      title: "Job Tracker Dashboard",
      tag: "React + Node",
      desc: (careerFit: any) =>
        `Build a dashboard for tracking applications, interviews, and outcomes for ${careerFit || "your target role"}.`,
    },
    {
      title: "Auth-Backed Portfolio CMS",
      tag: "Next.js",
      desc: (careerFit: any) =>
        `Create a content-managed portfolio with login, project publishing, and SEO for ${careerFit || "recruiter visibility"}.`,
    },
    {
      title: "Interview Prep Workspace",
      tag: "Roadmap",
      desc: (careerFit: any) =>
        `Ship a study planner that links skills, notes, and mock interviews for ${careerFit || "your career path"}.`,
    },
  ],
  frontend: [
    {
      title: "Design System Showcase",
      tag: "UI",
      desc: (careerFit: any) =>
        `Build a polished component library and case-study page aimed at ${careerFit || "frontend hiring"}.`,
    },
    {
      title: "Analytics Dashboard Clone",
      tag: "React",
      desc: (careerFit: any) =>
        `Recreate a dashboard with filters, charts, and responsive layouts for ${careerFit || "frontend depth"}.`,
    },
    {
      title: "Product Landing Experience",
      tag: "Responsive UI",
      desc: (careerFit: any) =>
        `Launch a fast, accessible marketing site with motion and conversion-focused copy for ${careerFit || "your portfolio"}.`,
    },
  ],
  backend: [
    {
      title: "REST API with Auth",
      tag: "Node + Express",
      desc: (careerFit: any) =>
        `Build a secure API with validation, authentication, and pagination for ${careerFit || "backend practice"}.`,
    },
    {
      title: "Caching and Queue Service",
      tag: "Redis",
      desc: (careerFit: any) =>
        `Create a service that uses caching and async jobs to strengthen ${careerFit || "backend systems design"}.`,
    },
    {
      title: "Admin Analytics API",
      tag: "Postgres",
      desc: (careerFit: any) =>
        `Model reporting endpoints and role-based access for ${careerFit || "production backend work"}.`,
    },
  ],
  "ai engineer": [
    {
      title: "Resume Screener",
      tag: "Python + NLP",
      desc: (careerFit: any) =>
        `Create a resume ranking tool that maps closely to ${careerFit || "applied AI"}.`,
    },
    {
      title: "Interview Coach Bot",
      tag: "RAG",
      desc: (careerFit: any) =>
        `Build a question-answering assistant with retrieval and evaluation for ${careerFit || "LLM practice"}.`,
    },
    {
      title: "Skill Gap Predictor",
      tag: "ML",
      desc: (careerFit: any) =>
        `Predict learning gaps from resumes and project history for ${careerFit || "AI portfolio depth"}.`,
    },
  ],
  "data scientist": [
    {
      title: "Insights Dashboard",
      tag: "Python + SQL",
      desc: (careerFit: any) =>
        `Analyze data, expose insights, and present findings for ${careerFit || "data science hiring"}.`,
    },
    {
      title: "Cohort Retention Study",
      tag: "Analytics",
      desc: (careerFit: any) =>
        `Build an experiment analysis project showing retention and churn for ${careerFit || "data work"}.`,
    },
    {
      title: "Model Comparison Lab",
      tag: "ML",
      desc: (careerFit: any) =>
        `Compare multiple models and report metrics for ${careerFit || "portfolio differentiation"}.`,
    },
  ],
};

export const listProjects = async (req: any, res: any) => {
  try {
    const user: any = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { skills: true, aiAnalysis: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const aiAnalysis = user.aiAnalysis || null;
    const careerFit = aiAnalysis?.careerFit || user.careerGoal || "Software Engineer";
    const githubUsername = extractGithubUsername(user.github);

    console.log("USER GITHUB:", user.github);
    console.log("NORMALIZED:", githubUsername);

    const githubProfile = githubUsername ? await fetchGithubProfile(githubUsername) : null;

    console.log("GITHUB PROFILE:", githubProfile);

    const storedProjects = buildStoredProjects(aiAnalysis, careerFit);
    const githubProjects = await buildGithubProjects(githubProfile, aiAnalysis, careerFit);

    console.log("GITHUB PROJECTS:", githubProjects);

    if (!githubProfile?.ok) {
      console.error("GitHub sync failed:", githubProfile);
    }

    const mergedProjects = dedupeProjects([...storedProjects, ...githubProjects]).slice(0, 12);
    const recommendedProjects = buildRecommendedProjects(aiAnalysis, careerFit, mergedProjects).slice(0, 6);

    const completedProjects = mergedProjects.filter((project: any) => project.status === "Completed").length;
    const inProgressProjects = mergedProjects.filter((project: any) => project.status === "In Progress").length;
    const totalProjects = aiAnalysis?.totalProjects ?? mergedProjects.length;
    const completedProjectsTotal =
      aiAnalysis?.completedProjects ?? completedProjects;
    const inProgressProjectsTotal =
      aiAnalysis?.inProgressProjects ?? inProgressProjects;

    res.json({
      projects: mergedProjects,
      recommendedProjects,
      totalProjects,
      completedProjects: completedProjectsTotal,
      inProgressProjects: inProgressProjectsTotal,
      stats: {
        totalProjects,
        completedProjects: completedProjectsTotal,
        inProgressProjects: inProgressProjectsTotal,
        recommendedProjects: recommendedProjects.length,
      },
      github: githubProfile?.ok ? githubProfile : null,
    });
  } catch (error: any) {
    console.error("listProjects error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const saveProjectMemory = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const title = String(req.body.title || "").trim();

    if (!title) {
      return res.status(400).json({ message: "Project title is required" });
    }

    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { aiAnalysis: true },
    });

    if (!user?.aiAnalysis) {
      return res.status(404).json({ message: "Project analysis not found. Run profile analysis first." });
    }

    const existingProjects = collectStoredProjects(user.aiAnalysis);
    const nextProject = {
      title,
      description:
        String(req.body.description || "").trim() ||
        "Portfolio project added manually.",
      technologies: uniqueStrings(parseTechList(req.body.technologies)),
      status: ["Completed", "In Progress", "Planned"].includes(req.body.status)
        ? req.body.status
        : "In Progress",
      image: String(req.body.image || "").trim() || "/github.jpg",
      url: String(req.body.url || "").trim() || null,
      source: "profile",
    };

    const projectMap = new Map<string, any>();

    existingProjects.forEach((project: any) => {
      const key = normalizeKey(project.title);
      if (!key) return;
      projectMap.set(key, project);
    });

    projectMap.set(normalizeKey(nextProject.title), nextProject);

    const payload = buildProjectMemoryPayload(Array.from(projectMap.values()));

    await prisma.aIAnalysis.update({
      where: { userId },
      data: payload,
    });

    res.status(200).json({
      message: "Project memory saved successfully",
      project: nextProject,
    });
  } catch (error: any) {
    console.error("saveProjectMemory error:", error);
    res.status(500).json({ message: error.message });
  }
};

function dedupeProjects(projects: any[]) {
  const map = new Map();

  for (const project of projects) {
    const key = normalizeKey(project.title);
    if (!key) continue;

    const previous = map.get(key);
    if (!previous || (project.score || 0) > (previous.score || 0)) {
      map.set(key, project);
    }
  }

  return Array.from(map.values()).sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
}
