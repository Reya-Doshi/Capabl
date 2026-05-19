import {
  extractResumeText,
  analyzeResumeText,
} from "./resumeService.js";
import {
  fetchGithubProfile,
  scoreGithub,
  scoreLinkedIn,
} from "./socialService.js";

const ROLE_SKILLS = {
  "full stack": [
    "html",
    "css",
    "javascript",
    "react",
    "node",
    "express",
    "mongodb",
    "postgresql",
    "git",
    "rest api",
    "typescript",
    "dsa",
  ],
  frontend: [
    "html",
    "css",
    "javascript",
    "react",
    "tailwind",
    "redux",
    "typescript",
    "git",
    "responsive design",
    "next.js",
  ],
  backend: [
    "node",
    "express",
    "postgresql",
    "mongodb",
    "rest api",
    "git",
    "docker",
    "redis",
    "authentication",
    "typescript",
  ],
  "ai engineer": [
    "python",
    "numpy",
    "pandas",
    "machine learning",
    "tensorflow",
    "pytorch",
    "math",
    "statistics",
    "deep learning",
    "nlp",
  ],
  "data scientist": [
    "python",
    "pandas",
    "numpy",
    "sql",
    "statistics",
    "machine learning",
    "matplotlib",
    "tableau",
    "excel",
    "math",
  ],
  "data analyst": [
    "sql",
    "excel",
    "power bi",
    "tableau",
    "python",
    "statistics",
    "pandas",
    "data visualization",
  ],
  devops: [
    "linux",
    "docker",
    "kubernetes",
    "aws",
    "ci/cd",
    "git",
    "terraform",
    "bash",
    "monitoring",
  ],
  mobile: [
    "react native",
    "javascript",
    "swift",
    "kotlin",
    "flutter",
    "dart",
    "rest api",
    "git",
  ],
};

const DEFAULT_ROLE = "full stack";

const SKILL_ALIASES = {
  js: "javascript",
  ts: "typescript",
  reactjs: "react",
  "react.js": "react",
  nodejs: "node",
  "node.js": "node",
  expressjs: "express",
  "express.js": "express",
  postgres: "postgresql",
  psql: "postgresql",
  mongo: "mongodb",
  rest: "rest api",
  "restful api": "rest api",
  ml: "machine learning",
  tf: "tensorflow",
  tw: "tailwind",
  tailwindcss: "tailwind",
  k8s: "kubernetes",
  cicd: "ci/cd",
  "ci cd": "ci/cd",
};

function normaliseSkill(raw) {
  if (!raw) return "";
  const s = String(raw).toLowerCase().trim();
  return SKILL_ALIASES[s] || s;
}

function resolveRoleKey(careerGoal) {
  if (!careerGoal) return DEFAULT_ROLE;
  const goal = careerGoal.toLowerCase();
  const exact = Object.keys(ROLE_SKILLS).find((k) => goal.includes(k));
  if (exact) return exact;
  if (goal.includes("front")) return "frontend";
  if (goal.includes("back")) return "backend";
  if (goal.includes("ai") || goal.includes("ml")) return "ai engineer";
  if (goal.includes("data")) return "data analyst";
  if (goal.includes("devops") || goal.includes("cloud")) return "devops";
  if (
    goal.includes("mobile") ||
    goal.includes("android") ||
    goal.includes("ios")
  )
    return "mobile";
  return DEFAULT_ROLE;
}

function buildRoadmap(skillGaps, careerFit) {
  const stagesTemplate = [
    {
      stage: "Stage 1",
      title: "Foundations",
      core: ["git", "html", "css"],
    },
    {
      stage: "Stage 2",
      title: "Core Skills",
      core: ["javascript", "react", "node", "express", "python"],
    },
    {
      stage: "Stage 3",
      title: "Advanced Concepts",
      core: ["typescript", "rest api", "postgresql", "mongodb", "authentication"],
    },
    {
      stage: "Stage 4",
      title: "Real World Projects",
      core: ["docker", "aws", "ci/cd", "dsa"],
    },
    {
      stage: "Stage 5",
      title: "Placement Ready",
      core: ["system design", "interview prep", "portfolio"],
    },
  ];

  const stages = stagesTemplate.map((s) => {
    const gapSkills = s.core.filter((k) => skillGaps.includes(k));
    const knownInStage = s.core.filter((k) => !skillGaps.includes(k));
    let status = "locked";
    if (gapSkills.length === 0 && knownInStage.length > 0) status = "completed";
    else if (gapSkills.length > 0 && knownInStage.length > 0) status = "active";
    else if (s.title === "Foundations") status = "active";

    const progress = s.core.length
      ? Math.round((knownInStage.length / s.core.length) * 100)
      : 0;

    return {
      ...s,
      skills: s.core,
      knownSkills: knownInStage,
      gapSkills,
      progress,
      status,
    };
  });

  let activated = false;
  for (const s of stages) {
    if (s.status === "completed") continue;
    if (!activated) {
      s.status = "active";
      activated = true;
    } else {
      s.status = "locked";
    }
  }

  const weeks = [];
  const fundamentals = ["git", "html", "css", "javascript", "dsa"];
  const ordered = [
    ...fundamentals.filter((s) => skillGaps.includes(s)),
    ...skillGaps.filter((s) => !fundamentals.includes(s)),
  ];
  const target = ordered.length > 0 ? ordered : skillGaps;

  let week = 1;
  for (let i = 0; i < target.length; i += 2) {
    const focus = target.slice(i, i + 2);
    weeks.push({
      week,
      title: `Week ${week}`,
      focus,
      goal:
        focus.length > 1
          ? `Learn ${focus[0]} and ${focus[1]}`
          : `Master ${focus[0]}`,
    });
    week += 1;
    if (week > 8) break;
  }

  if (weeks.length === 0) {
    weeks.push({
      week: 1,
      title: "Week 1",
      focus: ["portfolio polish"],
      goal: `Build a portfolio project showcasing ${careerFit}`,
    });
  }

  return { weeks, stages };
}

export async function runAnalysis({
  user,
  skills,
  careerGoal,
  resumePath,
  githubUrl,
  linkedinUrl,
}) {
  const roleKey = resolveRoleKey(careerGoal || user?.careerGoal);
  const required = ROLE_SKILLS[roleKey];

  const userSkills = new Set(
    (skills || []).map(normaliseSkill).filter(Boolean)
  );

  let resumeAnalysis = {
    ok: false,
    resumeScore: 0,
    atsScore: 0,
    foundSkills: [],
    missingKeywords: required,
    sectionsFound: [],
    wordCount: 0,
    contact: {},
  };

  if (resumePath) {
    const resumeText = await extractResumeText(resumePath);
    resumeAnalysis = analyzeResumeText(resumeText, required);
    for (const fs of resumeAnalysis.foundSkills) {
      userSkills.add(normaliseSkill(fs));
    }
  }

  const userSkillList = Array.from(userSkills);

  const strengths = required.filter((s) => userSkills.has(s));
  const gaps = required.filter((s) => !userSkills.has(s));

  const matchScore = required.length
    ? Math.round((strengths.length / required.length) * 100)
    : 0;

  const profileFields = [
    user?.college,
    user?.bio,
    user?.github,
    user?.linkedin,
    user?.age,
    careerGoal || user?.careerGoal,
    resumePath,
  ];
  const profileFilled = profileFields.filter(Boolean).length;
  const profileCompleteness = Math.round(
    (profileFilled / profileFields.length) * 100
  );

  const githubProfile = githubUrl
    ? await fetchGithubProfile(githubUrl)
    : { ok: false, reason: "No GitHub URL" };
  const githubScoreResult = scoreGithub(githubProfile, required);

  const linkedinScoreResult = scoreLinkedIn(linkedinUrl);

  const skillCountScore = Math.min(100, userSkillList.length * 10);

  const readinessScore = Math.round(
    matchScore * 0.35 +
      resumeAnalysis.resumeScore * 0.2 +
      profileCompleteness * 0.15 +
      skillCountScore * 0.1 +
      githubScoreResult.score * 0.1 +
      linkedinScoreResult.score * 0.05 +
      resumeAnalysis.atsScore * 0.05
  );

  const recruiterVisibility = Math.round(
    linkedinScoreResult.score * 0.4 +
      githubScoreResult.score * 0.4 +
      resumeAnalysis.atsScore * 0.2
  );

  const recommendedSkills = gaps.slice(0, 5);

  const careerFit =
    roleKey
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") + " Developer";

  const { weeks: roadmap, stages: roadmapStages } = buildRoadmap(
    gaps,
    careerFit
  );

  const strengthsText = [];
  if (strengths.length >= 5)
    strengthsText.push({
      title: "Strong technical skill coverage",
      description: `You match ${strengths.length} of ${required.length} required skills for ${careerFit}.`,
      status: "Good",
      color: "bg-[#e7f7ea] text-green-700",
    });
  if (resumeAnalysis.sectionsFound.length >= 4)
    strengthsText.push({
      title: "Resume sections well-structured",
      description: `Detected ${resumeAnalysis.sectionsFound.length} key sections (${resumeAnalysis.sectionsFound.join(", ")}).`,
      status: "Strong",
      color: "bg-[#e7f7ea] text-green-700",
    });
  if (githubScoreResult.score >= 50)
    strengthsText.push({
      title: "Active GitHub presence",
      description: `${githubProfile.ownRepoCount ?? 0} public repos, ${githubProfile.totalStars ?? 0} total stars.`,
      status: "Good",
      color: "bg-[#e7f7ea] text-green-700",
    });
  if (resumeAnalysis.wordCount > 250)
    strengthsText.push({
      title: "Resume has sufficient detail",
      description: `Word count ${resumeAnalysis.wordCount} — within the recommended range.`,
      status: "Good",
      color: "bg-[#e7f7ea] text-green-700",
    });

  const aiSuggestions = [];
  if (resumeAnalysis.missingKeywords.length)
    aiSuggestions.push({
      title: "Add missing role keywords",
      description: `Your resume is missing key terms for ${careerFit}: ${resumeAnalysis.missingKeywords
        .slice(0, 5)
        .join(", ")}.`,
    });
  if (resumeAnalysis.sectionsFound.length < 4)
    aiSuggestions.push({
      title: "Add more standard resume sections",
      description: `Detected only ${resumeAnalysis.sectionsFound.length} sections. Add: education, experience, projects, skills.`,
    });
  if (githubScoreResult.score < 50)
    aiSuggestions.push({
      title: "Strengthen your GitHub",
      description:
        githubProfile.ok
          ? `Only ${githubProfile.ownRepoCount} repos. Pin 4-6 projects and add READMEs to boost recruiter discovery.`
          : `We couldn't read your GitHub profile (${githubProfile.reason}). Make sure the URL is correct and public.`,
    });
  if (linkedinScoreResult.score < 60)
    aiSuggestions.push({
      title: "Improve LinkedIn",
      description: linkedinScoreResult.ok
        ? "Add a headline that mentions your target role and update your About section."
        : linkedinScoreResult.reason,
    });
  if (resumeAnalysis.wordCount < 200)
    aiSuggestions.push({
      title: "Expand your resume",
      description: `Resume is only ${resumeAnalysis.wordCount} words — add measurable bullet points to projects/experience.`,
    });

  return {
    careerFit,
    targetRole: roleKey,
    readinessScore,
    matchScore,
    profileCompleteness,
    skillCountScore,
    skillStrengths: strengths,
    skillGaps: gaps,
    recommendedSkills,
    extractedSkills: userSkillList,
    requiredSkills: required,
    roadmap,
    roadmapStages,
    resume: {
      score: resumeAnalysis.resumeScore,
      atsScore: resumeAnalysis.atsScore,
      foundSkills: resumeAnalysis.foundSkills,
      missingKeywords: resumeAnalysis.missingKeywords,
      sectionsFound: resumeAnalysis.sectionsFound,
      wordCount: resumeAnalysis.wordCount,
      contact: resumeAnalysis.contact,
      ok: resumeAnalysis.ok,
      breakdown: resumeAnalysis.breakdown,
    },
    github: {
      score: githubScoreResult.score,
      breakdown: githubScoreResult.breakdown,
      languagesMatched: githubScoreResult.languagesMatched,
      profile: githubProfile,
    },
    linkedin: linkedinScoreResult,
    recruiterVisibility,
    strengthsText,
    aiSuggestions,
  };
}
