import {
  extractResumeText,
  analyzeResumeText,
} from "./resumeService.js";
import {
  fetchGithubProfile,
  scoreGithub,
  scoreLinkedIn,
} from "./socialService.js";
import { resourcesForSkill } from "./skillResources.js";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

type RoleKey =
  | "full stack"
  | "frontend"
  | "backend"
  | "ai engineer"
  | "data scientist"
  | "data analyst"
  | "devops"
  | "mobile";

type SkillSource = "manual" | "resume" | "profile";

type StageStatus = "locked" | "active" | "completed";

interface RoadmapSkill {
  name: string;
  known: boolean;
  source: SkillSource | null;
  resources: ReturnType<typeof resourcesForSkill>;
}

interface RoadmapStage {
  stage: string;
  title: string;
  skills: RoadmapSkill[];
  knownSkills: string[];
  gapSkills: string[];
  knownCount: number;
  total: number;
  progress: number;
  status: StageStatus;
}

interface WeeklyTask {
  key: string;
  label: string;
  done: boolean;
}

interface WeeklyPlan {
  week: number;
  title: string;
  focus: string[];
  tasks: WeeklyTask[];
  goal: string;
}

interface WeeklyDoneEntry {
  week: number;
  taskKey: string;
}

interface BuildRoadmapOptions {
  resumeSkills: string[];
  profileSkills: string[];
  manualSkills: string[];
  weeklyDone: WeeklyDoneEntry[];
}

interface SkillSets {
  resumeSet: Set<string>;
  profileSet: Set<string>;
  manualSet: Set<string>;
}

// Shapes returned by the imported service modules
// (adjust if you have stricter definitions in those files)
interface ResumeAnalysis {
  ok: boolean;
  resumeScore: number;
  atsScore: number;
  foundSkills: string[];
  missingKeywords: string[];
  sectionsFound: string[];
  wordCount: number;
  contact: Record<string, string>;
  breakdown?: unknown;
}

interface GithubProfile {
  ok: boolean;
  reason?: string;
  ownRepoCount?: number;
  totalStars?: number;
  languageBytes?: Record<string, number>;
}

interface GithubScoreResult {
  score: number;
  breakdown?: unknown;
  languagesMatched?: string[];
}

interface LinkedInScoreResult {
  score: number;
  ok?: boolean;
  reason?: string;
}

interface StrengthEntry {
  title: string;
  description: string;
  status: string;
  color: string;
}

interface SuggestionEntry {
  title: string;
  description: string;
}

interface SkillProficiencyEntry {
  name: string;
  level: "Confident" | "Practising" | "Beginner";
  currentPct: number;
  targetPct: number;
  gapPct: number;
  evidence: string[];
  known: boolean;
}

// Input / output types for runAnalysis
interface RunAnalysisInput {
  user?: {
    college?: string;
    bio?: string;
    github?: string;
    linkedin?: string;
    age?: number | string;
    careerGoal?: string;
  };
  skills?: string[];
  careerGoal?: string;
  resumePath?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  manualSkills?: string[];
  weeklyProgress?: WeeklyDoneEntry[];
}

interface RunAnalysisResult {
  careerFit: string;
  targetRole: RoleKey;
  readinessScore: number;
  matchScore: number;
  profileCompleteness: number;
  skillCountScore: number;
  skillStrengths: string[];
  skillGaps: string[];
  recommendedSkills: string[];
  extractedSkills: string[];
  requiredSkills: string[];
  skillProficiency: SkillProficiencyEntry[];
  roadmap: WeeklyPlan[];
  roadmapStages: RoadmapStage[];
  resume: {
    score: number;
    atsScore: number;
    foundSkills: string[];
    missingKeywords: string[];
    sectionsFound: string[];
    wordCount: number;
    contact: Record<string, string>;
    ok: boolean;
    breakdown?: unknown;
  };
  github: {
    score: number;
    breakdown?: unknown;
    languagesMatched?: string[];
    profile: GithubProfile;
  };
  linkedin: LinkedInScoreResult;
  recruiterVisibility: number;
  strengthsText: StrengthEntry[];
  aiSuggestions: SuggestionEntry[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLE_SKILLS: Record<RoleKey, string[]> = {
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

const DEFAULT_ROLE: RoleKey = "full stack";

const SKILL_ALIASES: Record<string, string> = {
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

// ---------------------------------------------------------------------------
// Roadmap templates
// ---------------------------------------------------------------------------

interface RoadmapTemplateStage {
  title: string;
  core: string[];
}

const ROADMAP_TEMPLATES: Record<RoleKey, RoadmapTemplateStage[]> = {
  "full stack": [
    { title: "Foundations", core: ["git", "html", "css"] },
    { title: "Core Skills", core: ["javascript", "react", "node", "express"] },
    { title: "Data & APIs", core: ["rest api", "mongodb", "postgresql", "typescript"] },
    { title: "Real World Projects", core: ["dsa", "git", "rest api"] },
    { title: "Placement Ready", core: ["system design", "interview prep", "portfolio"] },
  ],
  frontend: [
    { title: "Foundations", core: ["git", "html", "css"] },
    { title: "Core Skills", core: ["javascript", "react", "responsive design"] },
    { title: "Modern Stack", core: ["typescript", "tailwind", "redux", "next.js"] },
    { title: "Real World Projects", core: ["react", "rest api", "git"] },
    { title: "Placement Ready", core: ["system design", "interview prep", "portfolio"] },
  ],
  backend: [
    { title: "Foundations", core: ["git", "linux", "rest api"] },
    { title: "Core Skills", core: ["node", "express", "authentication"] },
    { title: "Databases & Caching", core: ["postgresql", "mongodb", "redis"] },
    { title: "DevOps Basics", core: ["docker", "typescript", "rest api"] },
    { title: "Placement Ready", core: ["system design", "interview prep", "portfolio"] },
  ],
  "ai engineer": [
    { title: "Foundations", core: ["python", "math", "statistics"] },
    { title: "Data Stack", core: ["numpy", "pandas"] },
    { title: "Machine Learning", core: ["machine learning", "deep learning"] },
    { title: "Advanced AI", core: ["tensorflow", "pytorch", "nlp"] },
    { title: "Placement Ready", core: ["system design", "interview prep", "portfolio"] },
  ],
  "data scientist": [
    { title: "Foundations", core: ["python", "statistics", "math"] },
    { title: "Data Stack", core: ["pandas", "numpy", "sql"] },
    { title: "Analysis & Viz", core: ["matplotlib", "tableau", "excel"] },
    { title: "Modeling", core: ["machine learning"] },
    { title: "Placement Ready", core: ["interview prep", "portfolio"] },
  ],
  "data analyst": [
    { title: "Foundations", core: ["excel", "sql"] },
    { title: "Programming", core: ["python", "pandas"] },
    { title: "Visualization", core: ["power bi", "tableau", "data visualization"] },
    { title: "Statistics", core: ["statistics"] },
    { title: "Placement Ready", core: ["interview prep", "portfolio"] },
  ],
  devops: [
    { title: "Foundations", core: ["linux", "bash", "git"] },
    { title: "Containers", core: ["docker", "kubernetes"] },
    { title: "Cloud", core: ["aws", "terraform"] },
    { title: "Automation", core: ["ci/cd", "monitoring"] },
    { title: "Placement Ready", core: ["system design", "interview prep", "portfolio"] },
  ],
  mobile: [
    { title: "Foundations", core: ["javascript", "git"] },
    { title: "Cross-Platform", core: ["react native", "flutter", "dart"] },
    { title: "Native", core: ["swift", "kotlin"] },
    { title: "Integration", core: ["rest api"] },
    { title: "Placement Ready", core: ["interview prep", "portfolio"] },
  ],
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function normaliseSkill(raw: unknown): string {
  if (!raw) return "";
  const s = String(raw).toLowerCase().trim();
  return SKILL_ALIASES[s] || s;
}

function resolveRoleKey(careerGoal?: string): RoleKey {
  if (!careerGoal) return DEFAULT_ROLE;
  const goal = careerGoal.toLowerCase();
  const exact = (Object.keys(ROLE_SKILLS) as RoleKey[]).find((k) =>
    goal.includes(k)
  );
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

function sourceFor(skill: string, { resumeSet, profileSet, manualSet }: SkillSets): SkillSource | null {
  if (manualSet.has(skill)) return "manual";
  if (resumeSet.has(skill)) return "resume";
  if (profileSet.has(skill)) return "profile";
  return null;
}

// ---------------------------------------------------------------------------
// Roadmap builder
// ---------------------------------------------------------------------------

function buildRoadmap(
  careerFit: string,
  roleKey: RoleKey,
  { resumeSkills, profileSkills, manualSkills, weeklyDone }: BuildRoadmapOptions
): { weeks: WeeklyPlan[]; stages: RoadmapStage[] } {
  const tpl: RoadmapTemplateStage[] =
    ROADMAP_TEMPLATES[roleKey] || ROADMAP_TEMPLATES["full stack"];

  const resumeSet = new Set((resumeSkills || []).map((s) => s.toLowerCase()));
  const profileSet = new Set((profileSkills || []).map((s) => s.toLowerCase()));
  const manualSet = new Set((manualSkills || []).map((s) => s.toLowerCase()));
  const knownSet = new Set([...resumeSet, ...profileSet, ...manualSet]);

  // First pass: shape stages with per-skill `known` + `source` + `resources`.
  const stages: RoadmapStage[] = tpl.map((s, i) => {
    const skills: RoadmapSkill[] = s.core.map((name) => {
      const known = knownSet.has(name);
      return {
        name,
        known,
        source: known
          ? sourceFor(name, { resumeSet, profileSet, manualSet })
          : null,
        resources: resourcesForSkill(name),
      };
    });
    const knownCount = skills.filter((x) => x.known).length;
    const total = skills.length;
    const progress = total ? Math.round((knownCount / total) * 100) : 0;

    return {
      stage: `Stage ${i + 1}`,
      title: s.title,
      skills,
      knownSkills: skills.filter((x) => x.known).map((x) => x.name),
      gapSkills: skills.filter((x) => !x.known).map((x) => x.name),
      knownCount,
      total,
      progress,
      status: "locked", // resolved in second pass
    };
  });

  // Sequential gating: Stage N is only ever `active` or `completed` if Stage
  // N-1 is `completed`.
  let prevCompleted = true; // first stage is always unlocked
  for (const stage of stages) {
    if (!prevCompleted) {
      stage.status = "locked";
      continue;
    }
    if (stage.total > 0 && stage.knownCount === stage.total) {
      stage.status = "completed";
      // prevCompleted stays true — next stage can unlock too
    } else {
      stage.status = "active";
      prevCompleted = false;
    }
  }

  // Weekly plan: 2 gap-skills per week, in priority order (fundamentals first).
  const allGaps = stages.flatMap((s) => s.gapSkills);
  const uniqueGaps = Array.from(new Set(allGaps));
  const fundamentals = ["git", "html", "css", "javascript", "dsa"];
  const ordered = [
    ...fundamentals.filter((s) => uniqueGaps.includes(s)),
    ...uniqueGaps.filter((s) => !fundamentals.includes(s)),
  ];

  const doneKeys = new Set(
    (weeklyDone || []).map((w) => `${w.week}::${w.taskKey}`)
  );

  const weeks: WeeklyPlan[] = [];
  let week = 1;
  for (let i = 0; i < ordered.length; i += 2) {
    const focusNames = ordered.slice(i, i + 2);
    const tasks: WeeklyTask[] = focusNames.map((name) => ({
      key: name,
      label: `Study and build a small project with ${name}`,
      done: doneKeys.has(`${week}::${name}`) || knownSet.has(name),
    }));
    weeks.push({
      week,
      title: `Week ${week}`,
      focus: focusNames,
      tasks,
      goal:
        focusNames.length > 1
          ? `Learn ${focusNames[0]} and ${focusNames[1]}`
          : `Master ${focusNames[0]}`,
    });
    week += 1;
    if (week > 8) break;
  }

  if (weeks.length === 0) {
    weeks.push({
      week: 1,
      title: "Week 1",
      focus: ["portfolio polish"],
      tasks: [
        {
          key: "portfolio polish",
          label: `Build a portfolio project showcasing ${careerFit}`,
          done: doneKeys.has(`1::portfolio polish`),
        },
      ],
      goal: `Build a portfolio project showcasing ${careerFit}`,
    });
  }

  return { weeks, stages };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function runAnalysis({
  user,
  skills,
  careerGoal,
  resumePath,
  githubUrl,
  linkedinUrl,
  manualSkills = [],
  weeklyProgress = [],
}: RunAnalysisInput): Promise<RunAnalysisResult> {
  const roleKey = resolveRoleKey(careerGoal || user?.careerGoal);
  const required = ROLE_SKILLS[roleKey];

  const profileSkills = (skills || [])
    .map(normaliseSkill)
    .filter(Boolean);
  const manualSkillList = (manualSkills || [])
    .map(normaliseSkill)
    .filter(Boolean);

  let resumeAnalysis: ResumeAnalysis = {
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
    resumeAnalysis = analyzeResumeText(resumeText, required) as ResumeAnalysis;
  }

  const resumeSkillList = (resumeAnalysis.foundSkills || []).map(
    normaliseSkill
  );

  const userSkills = new Set<string>([
    ...profileSkills,
    ...resumeSkillList,
    ...manualSkillList,
  ]);
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

  const githubProfile: GithubProfile = githubUrl
    ? await fetchGithubProfile(githubUrl)
    : { ok: false, reason: "No GitHub URL" };
  const githubScoreResult: GithubScoreResult = scoreGithub(githubProfile, required);

  const linkedinScoreResult: LinkedInScoreResult = scoreLinkedIn(linkedinUrl);

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
    careerFit,
    roleKey,
    {
      resumeSkills: resumeSkillList,
      profileSkills,
      manualSkills: manualSkillList,
      weeklyDone: weeklyProgress,
    }
  );

  const strengthsText: StrengthEntry[] = [];
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

  const aiSuggestions: SuggestionEntry[] = [];
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
        : linkedinScoreResult.reason ?? "",
    });
  if (resumeAnalysis.wordCount < 200)
    aiSuggestions.push({
      title: "Expand your resume",
      description: `Resume is only ${resumeAnalysis.wordCount} words — add measurable bullet points to projects/experience.`,
    });

  // Per-skill proficiency with evidence
  const githubLangs = new Set<string>(
    Object.keys(githubProfile?.languageBytes || {}).map((l) =>
      normaliseSkill(l)
    )
  );

  const skillProficiency: SkillProficiencyEntry[] = required.map((skill) => {
    const inProfile = profileSkills.includes(skill);
    const inResume = resumeSkillList.includes(skill);
    const inManual = manualSkillList.includes(skill);
    const inGithub = githubLangs.has(skill);

    const evidence: string[] = [];
    if (inResume) evidence.push("resume");
    if (inProfile) evidence.push("profile");
    if (inGithub) evidence.push("github");
    if (inManual) evidence.push("completed");

    let level: SkillProficiencyEntry["level"];
    let currentPct: number;
    let gapPct: number;

    if (evidence.length >= 3) {
      level = "Confident";
      currentPct = 95;
      gapPct = 0;
    } else if (evidence.length === 2) {
      level = "Confident";
      currentPct = 80;
      gapPct = 5;
    } else if (evidence.length === 1) {
      level = "Practising";
      currentPct = 55;
      gapPct = 35;
    } else {
      level = "Beginner";
      currentPct = 10;
      gapPct = 90;
    }

    return {
      name: skill,
      level,
      currentPct,
      targetPct: 100,
      gapPct,
      evidence,
      known: evidence.length > 0,
    };
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
    skillProficiency,
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