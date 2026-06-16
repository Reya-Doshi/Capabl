import {
  extractResumeText,
  analyzeResumeText,
} from "./resumeService.js";
import {
  fetchGithubProfile,
  scoreGithub,
  scoreLinkedIn,
} from "./socialService.js";
import { resourcesForSkill, conceptsForSkill } from "./skillResources.js";
import {
  computeSemanticAlignment,
  computeSemanticSkillMatrix,
  buildRoleProfileText,
  tierFromScore,
  SEMANTIC_CREDIT,
  type MatchTier,
} from "./semanticMatchService.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

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

interface SkillSets {
  resumeSet: Set<string>;
  profileSet: Set<string>;
  manualSet: Set<string>;
}

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
  topLanguages?: { name: string; count: number }[];
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

type ProficiencyLevel =
  | "Not started"
  | "Beginner"
  | "Practicing"
  | "Proficient"
  | "Advanced";

type ConfidenceLevel = "Low" | "Medium" | "High";

interface SkillRecommendation {
  title: string;
  url: string;
  type: string;
}

// The five weighted evidence sources (each 0-100). These feed the readiness
// formula directly and are surfaced verbatim so every score is auditable.
// GitHub/LinkedIn are intentionally absent — they are optional enrichment that
// only adjusts confidence, never the core readiness score (v4 principle).
interface EvidenceScores {
  interview: number;
  project: number; // resume projects
  resume: number; // resume skills/body
  certification: number;
  roadmap: number;
}

interface SkillProficiencyEntry {
  name: string;
  weight: number; // role-importance weight, as a percentage (sums to ~100)
  readiness: number; // 0-100, mathematically derived from evidence
  contribution: number; // points this skill adds to the overall score
  lostPoints: number; // points this skill costs the overall score (the gap)
  currentLevel: ProficiencyLevel;
  targetLevel: ProficiencyLevel;
  confidence: ConfidenceLevel;
  matchTier: MatchTier; // Strong / Partial / Gap from semantic similarity
  semanticScore: number; // 0-100 peak embedding similarity for this skill
  evidenceScores: EvidenceScores; // raw 0-100 per source (final blended)
  evidenceFound: string[]; // e.g. ["Resume", "Projects", "Interview"]
  evidenceMissing: string[]; // e.g. ["Certifications", "GitHub"]
  profileBaselineApplied: boolean; // readiness floored by a self-reported skill
  missingConcepts: string[];
  recommendations: SkillRecommendation[];
  reason: string; // explanation generated from the actual evidence found
  known: boolean;
}

interface SkillContribution {
  name: string;
  weight: number;
  readiness: number;
  points: number; // weight% × readiness (rounded) — sums to the overall score
}

interface SkillGapContribution {
  name: string;
  weight: number;
  readiness: number;
  lostPoints: number; // weight% × (100 − readiness) — sums to (100 − overall)
}

// The fully auditable breakdown behind the overall match score.
interface ScoreExplanation {
  overall: number;
  formula: string;
  contributions: SkillContribution[]; // every skill, sorted by points desc
  largestGaps: SkillGapContribution[]; // every gap, sorted by lostPoints desc
  evidenceSummary: {
    interview: number;
    project: number;
    resume: number;
    certification: number;
    roadmap: number;
    profile: number; // self-reported baseline portion
  };
}

// What Gemini returns for role intelligence
interface RoleIntelligence {
  normalizedTitle: string;         // clean job title e.g. "AI Applications Developer"
  requiredSkills: string[];        // 10-14 skills this role actually needs
  roadmapStages: {
    title: string;                 // stage name e.g. "Foundations"
    skills: string[];              // 3-4 skills in this stage
  }[];
  // Importance weight per skill (integers, roughly summing to 100). Optional:
  // older cached payloads won't have it, so the engine derives equal weights
  // as a fallback. The weights are an *input* the user can see — the overall
  // score is computed by our own formula, never returned by Gemini.
  skillWeights?: Record<string, number>;
}

// A project the user has built, used as an independent evidence source.
interface ProjectEvidence {
  title?: string;
  description?: string;
  technologies?: string[];
}

interface CachedRoleIntelligence {
  goalSnapshot?: string | null;
  requiredSkills?: string[] | null;
  roleIntelligence?: unknown;
}

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
  resumeText?: string; // optional pre-extracted text (avoids double extraction)
  projects?: ProjectEvidence[]; // user's projects, used as evidence
  certifications?: string[]; // certification names/titles, used as evidence
  interviewText?: string; // interview transcript, high-weight evidence (Phase 3)
  cachedRoleIntelligence?: CachedRoleIntelligence;
}

interface RunAnalysisResult {
  careerFit: string;
  readinessScore: number;
  matchScore: number;
  confidence: ConfidenceLevel;
  evidenceSummary: ScoreExplanation["evidenceSummary"];
  semanticScore: number;
  semanticMethod: string;
  profileCompleteness: number;
  skillCountScore: number;
  skillStrengths: string[];
  skillGaps: string[];
  recommendedSkills: string[];
  extractedSkills: string[];
  requiredSkills: string[];
  skillWeights: Record<string, number>;
  scoreExplanation: ScoreExplanation;
  roleIntelligence: RoleIntelligence;
  roleGoalSnapshot: string;
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
  profileStatus: {
    resume: ProfileConnectionStatus;
    github: ProfileConnectionStatus;
    linkedin: ProfileConnectionStatus;
  };
}

interface ProfileConnectionStatus {
  key: "resume" | "github" | "linkedin";
  label: string;
  status: "connected" | "missing" | "validated";
  detail: string;
  url?: string | null;
}

// ---------------------------------------------------------------------------
// Skill normalisation
// ---------------------------------------------------------------------------

const SKILL_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  reactjs: "react",
  "react.js": "react",
  nodejs: "node.js",
  "node js": "node.js",
  expressjs: "express",
  "express.js": "express",
  postgres: "postgresql",
  psql: "postgresql",
  mongo: "mongodb",
  rest: "rest api",
  "restful api": "rest api",
  "restful apis": "rest api",
  ml: "machine learning",
  tf: "tensorflow",
  tw: "tailwind",
  tailwindcss: "tailwind css",
  k8s: "kubernetes",
  cicd: "ci/cd",
  "ci cd": "ci/cd",
  llm: "llm integration",
  gpt: "openai api",
  "gpt-4": "openai api",
  "socket.io": "websockets",
  socketio: "websockets",
  "next.js": "next.js",
  nextjs: "next.js",
  "react native": "react native",
  dsa: "data structures & algorithms",
};

function normaliseSkill(raw: unknown): string {
  if (!raw) return "";
  const s = String(raw).toLowerCase().trim();
  return SKILL_ALIASES[s] ?? s;
}

function skillsMatch(a: string, b: string): boolean {
  const na = normaliseSkill(a);
  const nb = normaliseSkill(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

function userHasSkill(skill: string, userSkills: Set<string>): boolean {
  const ns = normaliseSkill(skill);
  for (const us of userSkills) {
    if (skillsMatch(ns, us)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Gemini: dynamically determine role requirements from career goal + resume
// ---------------------------------------------------------------------------

async function getRoleIntelligence(
  careerGoal: string,
  resumeText: string,
  existingSkills: string[],
  cached?: CachedRoleIntelligence
): Promise<RoleIntelligence> {
  if (
    cached?.goalSnapshot === careerGoal &&
    cached?.requiredSkills?.length &&
    cached?.roleIntelligence
  ) {
    const cachedRole = cached.roleIntelligence as RoleIntelligence;
    if (
      cachedRole.normalizedTitle &&
      Array.isArray(cachedRole.roadmapStages) &&
      Array.isArray(cachedRole.requiredSkills)
    ) {
      return {
        ...cachedRole,
        requiredSkills: cached.requiredSkills,
      };
    }
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a senior technical recruiter and career coach.

A student has the following career goal: "${careerGoal}"

Their resume content (first 2000 chars):
${resumeText.slice(0, 2000)}

Their listed skills: ${existingSkills.slice(0, 20).join(", ")}

Based on their ACTUAL career goal and resume context, determine:
1. The normalised job title for their goal (be specific, e.g. "AI Applications Developer" not just "Developer")
2. Exactly 12 skills that are ACTUALLY required for this specific role in the current job market (2024-2026)
   - Match skills to the REAL role, not a generic template
   - If they want to build AI-powered apps with LLMs: include llm integration, prompt engineering, etc.
   - If they want ML/data science: include python, pytorch, etc.
   - Be realistic about what companies hiring for this role actually test
3. A 5-stage learning roadmap for this specific role, each stage with 3-4 skills
4. An importance weight (integer) for EACH of the 12 skills, reflecting how heavily
   employers weight that skill for this role. The 12 weights MUST sum to exactly 100.
   Core/defining skills get higher weights; peripheral skills get lower weights.

Respond ONLY with valid JSON (no markdown, no backticks, no explanation):
{
  "normalizedTitle": "string",
  "requiredSkills": ["skill1", "skill2", ...12 skills],
  "skillWeights": { "skill1": 15, "skill2": 15, "skill3": 10, "...": "(all 12 skills, integers summing to 100)" },
  "roadmapStages": [
    { "title": "Foundations", "skills": ["skill1", "skill2", "skill3"] },
    { "title": "Core Skills", "skills": ["skill1", "skill2", "skill3"] },
    { "title": "Advanced Skills", "skills": ["skill1", "skill2", "skill3"] },
    { "title": "Real World Projects", "skills": ["skill1", "skill2", "skill3"] },
    { "title": "Placement Ready", "skills": ["system design", "interview prep", "portfolio"] }
  ]
}

Rules:
- Use lowercase skill names consistently (skillWeights keys must match requiredSkills exactly)
- Skills must reflect the actual 2024-2026 job market for this exact role
- Do NOT use generic templates — analyse the career goal carefully
- requiredSkills must total exactly 12
- skillWeights must contain all 12 skills and the values must sum to 100
`;

  try {
    const response = await model.generateContent(prompt);
    const raw = response.response.text().trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as RoleIntelligence;

    // Validate shape — fall back gracefully if Gemini returns unexpected format
    if (
      !parsed.normalizedTitle ||
      !Array.isArray(parsed.requiredSkills) ||
      parsed.requiredSkills.length < 5 ||
      !Array.isArray(parsed.roadmapStages)
    ) {
      throw new Error("Invalid shape from Gemini");
    }

    return parsed;
  } catch (err) {
    // Graceful fallback: derive from careerGoal string only
    console.warn("getRoleIntelligence fallback triggered:", err);
    return getFallbackRoleIntelligence(careerGoal);
  }
}

// ---------------------------------------------------------------------------
// Fallback if Gemini fails (no hardcoded role map — derives from goal text)
// ---------------------------------------------------------------------------

function getFallbackRoleIntelligence(careerGoal: string): RoleIntelligence {
  const goal = careerGoal.toLowerCase();

  // Detect broad category from goal text only
  const isAIApps =
    goal.includes("llm") ||
    goal.includes("ai app") ||
    goal.includes("ai application") ||
    goal.includes("ai product") ||
    goal.includes("generative");

  const isMLEngineer =
    !isAIApps &&
    (goal.includes("machine learning") ||
      goal.includes("ml engineer") ||
      goal.includes("deep learning") ||
      goal.includes("data scientist"));

  const isDevOps =
    goal.includes("devops") ||
    goal.includes("cloud") ||
    goal.includes("platform engineer") ||
    goal.includes("sre");

  const isMobile =
    goal.includes("mobile") ||
    goal.includes("android") ||
    goal.includes("ios") ||
    goal.includes("flutter");

  const isData =
    !isMLEngineer &&
    (goal.includes("data analyst") ||
      goal.includes("data engineer") ||
      goal.includes("analytics"));

  const isFrontend =
    !isAIApps &&
    !isMLEngineer &&
    (goal.includes("frontend") || goal.includes("front-end") || goal.includes("ui "));

  const isBackend =
    !isAIApps &&
    !isMLEngineer &&
    (goal.includes("backend") || goal.includes("back-end") || goal.includes("server"));

  if (isAIApps) {
    return {
      normalizedTitle: "AI Applications Developer",
      requiredSkills: [
        "javascript", "typescript", "react", "node.js", "express",
        "rest api", "llm integration", "prompt engineering",
        "openai api", "websockets", "docker", "git",
      ],
      roadmapStages: [
        { title: "Foundations", skills: ["javascript", "typescript", "git"] },
        { title: "Backend & APIs", skills: ["node.js", "express", "rest api"] },
        { title: "LLM Integration", skills: ["llm integration", "prompt engineering", "openai api"] },
        { title: "Real-Time & Deployment", skills: ["websockets", "docker"] },
        { title: "Placement Ready", skills: ["system design", "interview prep", "portfolio"] },
      ],
    };
  }

  if (isMLEngineer) {
    return {
      normalizedTitle: "Machine Learning Engineer",
      requiredSkills: [
        "python", "numpy", "pandas", "scikit-learn", "machine learning",
        "deep learning", "tensorflow", "pytorch", "statistics", "sql",
        "data visualization", "git",
      ],
      roadmapStages: [
        { title: "Foundations", skills: ["python", "statistics", "git"] },
        { title: "Data Stack", skills: ["numpy", "pandas", "sql"] },
        { title: "Machine Learning", skills: ["scikit-learn", "machine learning"] },
        { title: "Deep Learning", skills: ["tensorflow", "pytorch", "deep learning"] },
        { title: "Placement Ready", skills: ["system design", "interview prep", "portfolio"] },
      ],
    };
  }

  if (isDevOps) {
    return {
      normalizedTitle: "DevOps Engineer",
      requiredSkills: [
        "linux", "bash", "docker", "kubernetes", "aws",
        "terraform", "ci/cd", "git", "monitoring", "python",
        "networking", "security",
      ],
      roadmapStages: [
        { title: "Foundations", skills: ["linux", "bash", "git"] },
        { title: "Containers", skills: ["docker", "kubernetes"] },
        { title: "Cloud", skills: ["aws", "terraform"] },
        { title: "Automation", skills: ["ci/cd", "monitoring", "python"] },
        { title: "Placement Ready", skills: ["system design", "interview prep", "portfolio"] },
      ],
    };
  }

  if (isMobile) {
    return {
      normalizedTitle: "Mobile Developer",
      requiredSkills: [
        "javascript", "react native", "flutter", "dart",
        "swift", "kotlin", "rest api", "git",
        "state management", "firebase", "app deployment", "ui/ux basics",
      ],
      roadmapStages: [
        { title: "Foundations", skills: ["javascript", "git"] },
        { title: "Cross-Platform", skills: ["react native", "flutter", "dart"] },
        { title: "Native", skills: ["swift", "kotlin"] },
        { title: "Integration", skills: ["rest api", "firebase", "state management"] },
        { title: "Placement Ready", skills: ["system design", "interview prep", "portfolio"] },
      ],
    };
  }

  if (isData) {
    return {
      normalizedTitle: "Data Analyst",
      requiredSkills: [
        "sql", "python", "pandas", "excel",
        "power bi", "tableau", "statistics", "data visualization",
        "numpy", "git", "storytelling with data", "business intelligence",
      ],
      roadmapStages: [
        { title: "Foundations", skills: ["sql", "excel", "git"] },
        { title: "Programming", skills: ["python", "pandas", "numpy"] },
        { title: "Visualization", skills: ["power bi", "tableau", "data visualization"] },
        { title: "Analysis", skills: ["statistics", "storytelling with data"] },
        { title: "Placement Ready", skills: ["interview prep", "portfolio"] },
      ],
    };
  }

  if (isFrontend) {
    return {
      normalizedTitle: "Frontend Developer",
      requiredSkills: [
        "html", "css", "javascript", "typescript", "react",
        "next.js", "tailwind css", "git", "rest api",
        "responsive design", "state management", "testing",
      ],
      roadmapStages: [
        { title: "Foundations", skills: ["html", "css", "git"] },
        { title: "Core Skills", skills: ["javascript", "react", "responsive design"] },
        { title: "Modern Stack", skills: ["typescript", "tailwind css", "next.js"] },
        { title: "Advanced", skills: ["state management", "rest api", "testing"] },
        { title: "Placement Ready", skills: ["system design", "interview prep", "portfolio"] },
      ],
    };
  }

  if (isBackend) {
    return {
      normalizedTitle: "Backend Developer",
      requiredSkills: [
        "node.js", "express", "postgresql", "mongodb", "redis",
        "rest api", "docker", "git", "authentication",
        "typescript", "system design", "testing",
      ],
      roadmapStages: [
        { title: "Foundations", skills: ["git", "rest api", "authentication"] },
        { title: "Core Skills", skills: ["node.js", "express", "typescript"] },
        { title: "Databases", skills: ["postgresql", "mongodb", "redis"] },
        { title: "DevOps Basics", skills: ["docker", "testing"] },
        { title: "Placement Ready", skills: ["system design", "interview prep", "portfolio"] },
      ],
    };
  }

  // Default: Full Stack
  return {
    normalizedTitle: "Full Stack Developer",
    requiredSkills: [
      "html", "css", "javascript", "typescript", "react",
      "node.js", "express", "postgresql", "mongodb",
      "rest api", "git", "docker",
    ],
    roadmapStages: [
      { title: "Foundations", skills: ["html", "css", "git"] },
      { title: "Frontend", skills: ["javascript", "typescript", "react"] },
      { title: "Backend", skills: ["node.js", "express", "rest api"] },
      { title: "Databases & DevOps", skills: ["postgresql", "mongodb", "docker"] },
      { title: "Placement Ready", skills: ["system design", "interview prep", "portfolio"] },
    ],
  };
}

// ---------------------------------------------------------------------------
// Roadmap builder (no hardcoded role map — uses dynamic RoleIntelligence)
// ---------------------------------------------------------------------------

function buildRoadmap(
  careerFit: string,
  roleIntelligence: RoleIntelligence,
  options: {
    resumeSkills: string[];
    profileSkills: string[];
    manualSkills: string[];
    weeklyDone: WeeklyDoneEntry[];
  }
): { weeks: WeeklyPlan[]; stages: RoadmapStage[] } {
  const { resumeSkills, profileSkills, manualSkills, weeklyDone } = options;

  const resumeSet = new Set(resumeSkills.map(normaliseSkill));
  const profileSet = new Set(profileSkills.map(normaliseSkill));
  const manualSet = new Set(manualSkills.map(normaliseSkill));

  const allUserSkills = new Set([...resumeSet, ...profileSet, ...manualSet]);

  function sourceFor(skill: string): SkillSource | null {
    const ns = normaliseSkill(skill);
    if (manualSet.has(ns)) return "manual";
    if (resumeSet.has(ns)) return "resume";
    if (profileSet.has(ns)) return "profile";
    return null;
  }

  // Build stages from Gemini's dynamic roadmap template
  const stages: RoadmapStage[] = roleIntelligence.roadmapStages.map((s, i) => {
    const skills: RoadmapSkill[] = s.skills.map((name) => {
      const known = userHasSkill(name, allUserSkills);
      return {
        name,
        known,
        source: known ? sourceFor(name) : null,
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
      status: "locked" as StageStatus,
    };
  });

  // Sequential gating: each stage unlocks only after previous is completed
  let prevCompleted = true;
  for (const stage of stages) {
    if (!prevCompleted) {
      stage.status = "locked";
      continue;
    }
    if (stage.total > 0 && stage.knownCount === stage.total) {
      stage.status = "completed";
    } else {
      stage.status = "active";
      prevCompleted = false;
    }
  }

  // Weekly plan: 2 gap-skills per week across all stages in order
  const allGaps = stages.flatMap((s) => s.gapSkills);
  const uniqueGaps = Array.from(new Set(allGaps));

  const doneKeys = new Set(
    (weeklyDone || []).map((w) => `${w.week}::${w.taskKey}`)
  );

  const weeks: WeeklyPlan[] = [];
  let week = 1;
  for (let i = 0; i < uniqueGaps.length; i += 2) {
    const focusNames = uniqueGaps.slice(i, i + 2);
    const tasks: WeeklyTask[] = focusNames.map((name) => ({
      key: name,
      label: `Study and build a small project with ${name}`,
      done:
        doneKeys.has(`${week}::${name}`) || userHasSkill(name, allUserSkills),
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

  // If user already knows everything, give them a polish week
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
// Explainable, evidence-driven scoring engine
//
// Every number below is derived from documented constants and real evidence —
// no clamping to flatter, no arbitrary boosts, and no Gemini-generated final
// score. Skill weights are an input (from Role Intelligence); the overall score
// is the weighted average of per-skill readiness computed here.
// ---------------------------------------------------------------------------

// v4 spec-aligned evidence weights (sum to 1.0). Interview performance is the
// highest-weight signal (demonstrated > claimed). GitHub/LinkedIn are NOT here:
// they are optional enrichment that only adjusts confidence, never readiness.
// readiness = 0.35·interview + 0.25·projects + 0.20·resume + 0.12·certs + 0.08·roadmap
const EVIDENCE_WEIGHTS = {
  interview: 0.35,
  project: 0.25,
  resume: 0.2,
  certification: 0.12,
  roadmap: 0.08,
};

// A skill only *listed* in the profile (self-reported, unverified) floors
// readiness here so the card reads "Beginner / Low confidence" instead of 0%.
const PROFILE_BASELINE = 18;

// All raw spellings that normalise to a skill, so resume/project text saying
// "reactjs" or "node" still counts toward "react" / "node.js".
function skillVariants(skill: string): string[] {
  const canonical = normaliseSkill(skill);
  const variants = new Set<string>([canonical]);
  for (const [alias, target] of Object.entries(SKILL_ALIASES)) {
    if (target === canonical) variants.add(alias);
  }
  return [...variants].filter(Boolean);
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

// Graded 0-100 from a count using documented thresholds (auditable, not magic).
function gradeFromCount(count: number, one: number, two: number, many: number): number {
  if (count <= 0) return 0;
  if (count === 1) return one;
  if (count === 2) return two;
  return many;
}

function resumeEvidenceScore(skill: string, resumeLower: string): number {
  if (!resumeLower) return 0;
  const total = skillVariants(skill).reduce(
    (sum, v) => sum + countOccurrences(resumeLower, v),
    0
  );
  return gradeFromCount(total, 60, 80, 100);
}

function projectEvidenceScore(skill: string, projects: ProjectEvidence[]): number {
  if (!projects.length) return 0;
  const variants = skillVariants(skill);
  let matches = 0;
  for (const p of projects) {
    const hay = [p.title || "", p.description || "", ...(p.technologies || [])]
      .join(" ")
      .toLowerCase();
    if (variants.some((v) => hay.includes(v))) matches++;
  }
  return gradeFromCount(matches, 70, 85, 100);
}

// Certifications evidence — keyword/variant hits across certification titles.
function certEvidenceScore(skill: string, certsLower: string): number {
  if (!certsLower) return 0;
  const total = skillVariants(skill).reduce(
    (sum, v) => sum + countOccurrences(certsLower, v),
    0
  );
  return gradeFromCount(total, 70, 85, 100);
}

// Interview evidence — keyword/variant hits across the interview transcript.
// Demonstrated discussion of a skill counts higher than a passing resume mention.
function interviewEvidenceScore(skill: string, interviewLower: string): number {
  if (!interviewLower) return 0;
  const total = skillVariants(skill).reduce(
    (sum, v) => sum + countOccurrences(interviewLower, v),
    0
  );
  return gradeFromCount(total, 75, 90, 100);
}

function githubEvidenceScore(
  skill: string,
  langCounts: Map<string, number>,
  topics: Set<string>
): number {
  let repoCount = 0;
  for (const [lang, count] of langCounts) {
    if (skillsMatch(lang, skill)) repoCount += count;
  }
  if (repoCount === 0) {
    // Not a primary language — fall back to repo topics (e.g. "docker", "rest-api").
    for (const topic of topics) {
      if (skillsMatch(topic, skill)) return 60;
    }
  }
  return gradeFromCount(repoCount, 60, 80, 100);
}

// Confidence reflects how many independent sources corroborate the skill, the
// diversity of those sources, and whether the skill was *demonstrated* in an
// interview. Optional enrichment (GitHub/LinkedIn) can lift Low→Medium but never
// gates the score. Mirrors the v4 confidence table (interview ⇒ High).
function confidenceFor(opts: {
  coreSourceCount: number; // distinct core sources with evidence
  interviewPresent: boolean;
  enrichmentCount: number; // github/linkedin present
}): ConfidenceLevel {
  const { coreSourceCount, interviewPresent, enrichmentCount } = opts;
  if (interviewPresent && coreSourceCount >= 2) return "High";
  if (coreSourceCount >= 3) return "High";
  if (coreSourceCount === 2) return "Medium";
  if (coreSourceCount === 1 && enrichmentCount >= 1) return "Medium";
  return "Low";
}

function overallConfidence(skills: SkillProficiencyEntry[]): ConfidenceLevel {
  if (skills.length === 0) return "Low";
  const score = skills.reduce((sum, skill) => {
    if (skill.confidence === "High") return sum + 2;
    if (skill.confidence === "Medium") return sum + 1;
    return sum;
  }, 0);
  const pct = score / (skills.length * 2);
  if (pct >= 0.67) return "High";
  if (pct >= 0.34) return "Medium";
  return "Low";
}

function buildProfileStatus(params: {
  resumePath?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  githubProfile: GithubProfile;
  linkedin: LinkedInScoreResult;
}) {
  const resumeConnected = Boolean(params.resumePath);
  const githubConnected = Boolean(params.githubUrl);
  const linkedinConnected = Boolean(params.linkedinUrl);

  return {
    resume: {
      key: "resume" as const,
      label: "Resume",
      status: resumeConnected ? ("validated" as const) : ("missing" as const),
      detail: resumeConnected ? "Resume on file" : "Resume missing",
      url: params.resumePath || null,
    },
    github: {
      key: "github" as const,
      label: "GitHub",
      status: githubConnected
        ? params.githubProfile.ok
          ? ("validated" as const)
          : ("connected" as const)
        : ("missing" as const),
      detail: githubConnected
        ? params.githubProfile.ok
          ? `${params.githubProfile.ownRepoCount ?? 0} repos validated`
          : params.githubProfile.reason || "GitHub URL connected"
        : "GitHub missing",
      url: params.githubUrl || null,
    },
    linkedin: {
      key: "linkedin" as const,
      label: "LinkedIn",
      status: linkedinConnected
        ? params.linkedin.ok
          ? ("validated" as const)
          : ("connected" as const)
        : ("missing" as const),
      detail: linkedinConnected
        ? params.linkedin.reason || "LinkedIn URL validated"
        : "LinkedIn missing",
      url: params.linkedinUrl || null,
    },
  };
}

function levelForReadiness(readiness: number): ProficiencyLevel {
  if (readiness >= 85) return "Advanced";
  if (readiness >= 70) return "Proficient";
  if (readiness >= 45) return "Practicing";
  if (readiness >= 20) return "Beginner";
  return "Not started";
}

// Plain-language explanation built ONLY from the evidence actually found.
function buildSkillReason(
  skill: string,
  found: string[],
  missing: string[],
  profileOnly: boolean
): string {
  const Skill = skill.charAt(0).toUpperCase() + skill.slice(1);
  if (found.length === 0) {
    return `No evidence found yet for ${skill} in your resume, projects, GitHub, or completed roadmap work.`;
  }
  if (profileOnly) {
    return `${Skill} is listed in your profile but lacks supporting evidence from resume content, projects, GitHub repositories, or roadmap completion.`;
  }
  const foundText = found.join(", ");
  const missingText = missing.length
    ? ` Still missing: ${missing.join(", ")}.`
    : " Evidence found across every tracked source.";
  return `${Skill} is supported by ${foundText}.${missingText}`;
}

// Per-skill importance weights (percentages summing to 100) from Role
// Intelligence. Falls back to equal weighting (1/N each) — still fully
// explainable — when Gemini didn't supply valid weights (e.g. cached payloads).
function deriveSkillWeights(
  required: string[],
  roleIntelligence: RoleIntelligence
): Record<string, number> {
  const raw = roleIntelligence.skillWeights;
  const weights: Record<string, number> = {};

  if (raw && typeof raw === "object") {
    const normalisedRaw = new Map<string, number>();
    for (const [key, value] of Object.entries(raw)) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) normalisedRaw.set(normaliseSkill(key), n);
    }
    const allPresent = required.every((s) => normalisedRaw.has(s));
    if (allPresent && required.length > 0) {
      for (const skill of required) weights[skill] = normalisedRaw.get(skill)!;
    }
  }

  // Equal-weight fallback when Gemini weights are absent or incomplete.
  if (Object.keys(weights).length !== required.length) {
    const equal = required.length ? 100 / required.length : 0;
    for (const skill of required) weights[skill] = equal;
  }

  // Normalise to sum exactly 100 so contributions are interpretable as points.
  const sum = required.reduce((s, sk) => s + (weights[sk] || 0), 0) || 1;
  const normalized: Record<string, number> = {};
  for (const skill of required) normalized[skill] = (weights[skill] || 0) * (100 / sum);
  return normalized;
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
  resumeText: preExtractedText,
  projects = [],
  certifications = [],
  interviewText = "",
  cachedRoleIntelligence,
}: RunAnalysisInput): Promise<RunAnalysisResult> {

  const goal = careerGoal || user?.careerGoal || "Full Stack Developer";

  // ── 1. Extract resume text ──────────────────────────────────────────────
  let resumeText = preExtractedText || "";
  if (!resumeText && resumePath) {
    resumeText = await extractResumeText(resumePath);
  }

  const profileSkills = (skills || []).map(normaliseSkill).filter(Boolean);
  const manualSkillList = (manualSkills || []).map(normaliseSkill).filter(Boolean);

  // ── 2. Ask Gemini what this role actually requires ──────────────────────
  const roleIntelligence = await getRoleIntelligence(
    goal,
    resumeText,
    [...profileSkills, ...manualSkillList],
    cachedRoleIntelligence
  );

  const required = roleIntelligence.requiredSkills.map(normaliseSkill);
  // Single source of truth for the displayed target role: the goal the user
  // actually selected. Only fall back to Gemini's normalized title when no goal
  // is set, so every page (Dashboard/Roadmap/Skill Gap/Analyzer) shows exactly
  // what Onboarding/Resume show instead of a renamed or defaulted role.
  const careerFit =
    careerGoal || user?.careerGoal || roleIntelligence.normalizedTitle;

  // ── 3. Analyse resume against dynamic required skills ──────────────────
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

  if (resumeText) {
    resumeAnalysis = analyzeResumeText(resumeText, required) as ResumeAnalysis;
  }

  const resumeSkillList = (resumeAnalysis.foundSkills || []).map(normaliseSkill);

  // ── 4. Build unified skill set ──────────────────────────────────────────
  const allUserSkills = new Set<string>([
    ...profileSkills,
    ...resumeSkillList,
    ...manualSkillList,
  ]);

  // ── 5. Role skill weights (from Role Intelligence) ──────────────────────
  // Each required skill carries an importance weight (summing to 100). The
  // overall score is the weighted average of per-skill readiness — see §8.
  const skillWeights = deriveSkillWeights(required, roleIntelligence);

  // A rough binary skill-overlap %, used ONLY as the semantic-match last-resort
  // baseline (§9). The real, weighted match score is computed by the engine (§8).
  const skillOverlapBaseline = required.length
    ? Math.round(
        (required.filter((s) => userHasSkill(s, allUserSkills)).length /
          required.length) *
          100
      )
    : 0;

  // ── 6. Profile completeness ─────────────────────────────────────────────
  const profileFields = [
    user?.college,
    user?.bio,
    user?.github,
    user?.linkedin,
    user?.age,
    goal,
    resumePath || resumeText,
  ];
  const profileCompleteness = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  // ── 7. GitHub & LinkedIn ────────────────────────────────────────────────
  const githubProfile: GithubProfile = githubUrl
    ? await fetchGithubProfile(githubUrl)
    : { ok: false, reason: "No GitHub URL" };

  const githubScoreResult: GithubScoreResult = scoreGithub(githubProfile, required);
  const linkedinScoreResult: LinkedInScoreResult = scoreLinkedIn(linkedinUrl);

  // ── 8. Semantic Evidence Matching — explainable scoring engine ──────────
  // For every required skill we score five weighted evidence sources (interview,
  // projects, resume, certifications, roadmap) on 0-100. Each source score is
  // the STRONGER of two signals (dual-layer, per spec):
  //   • structural: explicit keyword/variant mention in that source's text
  //   • semantic:   cosine similarity between that source's embedding and the
  //                 skill's concept-expanded embedding
  //   readiness = 0.35·interview + 0.25·projects + 0.20·resume + 0.12·certs + 0.08·roadmap
  // GitHub/LinkedIn are NOT scored here — they only enrich confidence below.
  // A skill only self-reported in the profile is floored at PROFILE_BASELINE.
  const resumeLower = resumeText.toLowerCase();
  const certsLower = (certifications || []).join(" \n ").toLowerCase();
  const interviewLower = (interviewText || "").toLowerCase();

  // GitHub language/topic evidence is retained ONLY for the optional enrichment
  // signal (confidence + recruiter visibility), never the core readiness score.
  const githubLangCounts = new Map<string, number>();
  for (const lang of githubProfile?.topLanguages || []) {
    const name = normaliseSkill((lang as any)?.name);
    if (name) githubLangCounts.set(name, (lang as any)?.count || 1);
  }
  const githubTopics = new Set<string>();
  for (const repo of (githubProfile as any)?.topRepos || []) {
    for (const t of repo?.topics || []) githubTopics.add(normaliseSkill(t));
    for (const l of repo?.languages || []) githubTopics.add(normaliseSkill(l));
  }
  const githubPresent = Boolean(githubProfile?.ok);
  const linkedinPresent = Boolean(linkedinUrl);
  const enrichmentCount = (githubPresent ? 1 : 0) + (linkedinPresent ? 1 : 0);

  const weeklyDoneSkills = new Set(
    (weeklyProgress || []).map((w) => normaliseSkill(w.taskKey))
  );

  // ── Step 1+2: embed evidence sources and concept-expanded role skills ────
  const projectsText = (projects || [])
    .map((p) => [p.title, p.description, ...(p.technologies || [])].filter(Boolean).join(" "))
    .join(" \n ");
  const roadmapText = [...manualSkillList, ...weeklyDoneSkills].join(", ");
  const evidenceSources = [
    { key: "interview", text: interviewLower },
    { key: "project", text: projectsText },
    { key: "resume", text: resumeText },
    { key: "certification", text: certsLower },
    { key: "roadmap", text: roadmapText },
  ];
  const semanticSkills = required.map((skill) => ({
    name: skill,
    concepts: conceptsForSkill(skill),
  }));
  // ── Step 3: per-skill × per-source cosine similarity (Strong/Partial/Gap) ─
  const semantic = await computeSemanticSkillMatrix(evidenceSources, semanticSkills);

  // Blend a structural score with its source's semantic similarity: a verified
  // explicit mention wins; otherwise semantic similarity earns partial credit.
  const blendSource = (skill: string, key: string, structural: number): number => {
    const sem = semantic.simBySkill[skill]?.[key] ?? 0;
    return Math.round(Math.max(structural, sem * SEMANTIC_CREDIT));
  };

  const skillProficiency: SkillProficiencyEntry[] = required.map((skill) => {
    // ── Step 4: structured extraction (explicit-mention confidence) ────────
    const interview = blendSource(skill, "interview", interviewEvidenceScore(skill, interviewLower));
    const project = blendSource(skill, "project", projectEvidenceScore(skill, projects));
    const resume = blendSource(skill, "resume", resumeEvidenceScore(skill, resumeLower));
    const certification = blendSource(skill, "certification", certEvidenceScore(skill, certsLower));
    const roadmapDone =
      manualSkillList.some((m) => skillsMatch(m, skill)) ||
      [...weeklyDoneSkills].some((w) => skillsMatch(w, skill));
    const roadmap = blendSource(skill, "roadmap", roadmapDone ? 100 : 0);
    const profilePresent = profileSkills.some((s) => skillsMatch(s, skill));

    // ── Step 5: evidence-weighted skill readiness ──────────────────────────
    const weightedEvidence =
      EVIDENCE_WEIGHTS.interview * interview +
      EVIDENCE_WEIGHTS.project * project +
      EVIDENCE_WEIGHTS.resume * resume +
      EVIDENCE_WEIGHTS.certification * certification +
      EVIDENCE_WEIGHTS.roadmap * roadmap;

    let readinessRaw = weightedEvidence;
    let profileBaselineApplied = false;
    if (profilePresent && readinessRaw < PROFILE_BASELINE) {
      readinessRaw = PROFILE_BASELINE;
      profileBaselineApplied = true;
    }
    const readiness = Math.round(readinessRaw);

    // Core sources drive readiness + confidence; enrichment + profile are shown
    // for traceability but never gate the score.
    const coreSources = [
      { label: "Interview", on: interview > 0 },
      { label: "Projects", on: project > 0 },
      { label: "Resume", on: resume > 0 },
      { label: "Certifications", on: certification > 0 },
      { label: "Roadmap", on: roadmap > 0 },
    ];
    const coreFound = coreSources.filter((s) => s.on).map((s) => s.label);
    const coreMissing = coreSources.filter((s) => !s.on).map((s) => s.label);

    const enrichment = [
      { label: "GitHub", on: githubPresent && githubEvidenceScore(skill, githubLangCounts, githubTopics) > 0 },
      { label: "LinkedIn", on: linkedinPresent },
    ];
    const enrichmentFound = enrichment.filter((s) => s.on).map((s) => s.label);
    const enrichmentMissing = enrichment.filter((s) => !s.on).map((s) => s.label);

    // Display chips include every source (core + enrichment + profile floor).
    const evidenceFound = [
      ...coreFound,
      ...enrichmentFound,
      ...(profilePresent ? ["Profile"] : []),
    ];
    const evidenceMissing = [...coreMissing, ...enrichmentMissing];
    const profileOnly = coreFound.length === 0 && profilePresent;

    const interviewPresent = interview > 0;
    const confidence = confidenceFor({
      coreSourceCount: coreFound.length,
      interviewPresent,
      enrichmentCount,
    });

    // semanticScore = raw peak embedding similarity (shown for transparency).
    // matchTier reflects overall evidence COVERAGE — the stronger of semantic
    // similarity and the best structural source — so a skill with an explicit
    // resume/project mention reads "Strong", not "Gap" on diluted whole-doc
    // cosine alone.
    const semanticScore = semantic.peakBySkill[skill] ?? 0;
    const peakStructural = Math.max(interview, project, resume, certification, roadmap);
    const matchTier: MatchTier = tierFromScore(Math.max(semanticScore, peakStructural));

    const weight = skillWeights[skill] || 0;
    const contribution = (weight * readiness) / 100;
    const lostPoints = (weight * (100 - readiness)) / 100;

    const conceptCount =
      readiness >= 85 ? 0 : readiness >= 70 ? 1 : readiness >= 45 ? 2 : 3;
    const missingConcepts = conceptsForSkill(skill).slice(0, conceptCount);
    const recommendations: SkillRecommendation[] = resourcesForSkill(skill).slice(0, 2);
    const reason = buildSkillReason(skill, coreFound, coreMissing, profileOnly);

    return {
      name: skill,
      weight,
      readiness,
      contribution,
      lostPoints,
      currentLevel: levelForReadiness(readiness),
      targetLevel: "Advanced" as ProficiencyLevel,
      confidence,
      matchTier,
      semanticScore,
      evidenceScores: { interview, project, resume, certification, roadmap },
      evidenceFound,
      evidenceMissing,
      profileBaselineApplied,
      missingConcepts,
      recommendations,
      reason,
      known: coreFound.length > 0,
    };
  });

  // Overall match = weighted average of readiness (Σ weight% × readiness / 100).
  const matchScore = Math.round(
    skillProficiency.reduce((sum, e) => sum + (e.weight * e.readiness) / 100, 0)
  );

  // "Skills you have" vs "missing" reflect actual detected evidence (resume,
  // projects, interview, certs, roadmap) via `known`, not an unreachable
  // readiness≥60 bar — a resume-only skill maxes ~20 readiness and would
  // otherwise never count, leaving the counts stuck at 0. have + missing now
  // always equals the required-skill total. Gaps stay ordered by points lost.
  const strengths = skillProficiency
    .filter((e) => e.known)
    .map((e) => e.name);
  const gaps = skillProficiency
    .filter((e) => !e.known)
    .sort((a, b) => b.lostPoints - a.lostPoints)
    .map((e) => e.name);

  // Auditable breakdown: contributions sum to the score, gaps to (100 − score).
  const contributions: SkillContribution[] = skillProficiency
    .map((e) => ({
      name: e.name,
      weight: Math.round(e.weight),
      readiness: e.readiness,
      points: Math.round(e.contribution),
    }))
    .sort((a, b) => b.points - a.points);

  const largestGaps: SkillGapContribution[] = skillProficiency
    .map((e) => ({
      name: e.name,
      weight: Math.round(e.weight),
      readiness: e.readiness,
      lostPoints: Math.round(e.lostPoints),
    }))
    .filter((e) => e.lostPoints > 0)
    .sort((a, b) => b.lostPoints - a.lostPoints);

  // Aggregate how many points each evidence source contributed to the overall
  // score. These numbers sum to the overall match (profile = the floor's extra
  // credit), making the score fully decomposable.
  let evInterview = 0, evProject = 0, evResume = 0, evCert = 0, evRoadmap = 0, evProfile = 0;
  for (const e of skillProficiency) {
    const wf = e.weight / 100;
    evInterview += wf * EVIDENCE_WEIGHTS.interview * e.evidenceScores.interview;
    evProject += wf * EVIDENCE_WEIGHTS.project * e.evidenceScores.project;
    evResume += wf * EVIDENCE_WEIGHTS.resume * e.evidenceScores.resume;
    evCert += wf * EVIDENCE_WEIGHTS.certification * e.evidenceScores.certification;
    evRoadmap += wf * EVIDENCE_WEIGHTS.roadmap * e.evidenceScores.roadmap;
    const weighted =
      EVIDENCE_WEIGHTS.interview * e.evidenceScores.interview +
      EVIDENCE_WEIGHTS.project * e.evidenceScores.project +
      EVIDENCE_WEIGHTS.resume * e.evidenceScores.resume +
      EVIDENCE_WEIGHTS.certification * e.evidenceScores.certification +
      EVIDENCE_WEIGHTS.roadmap * e.evidenceScores.roadmap;
    evProfile += wf * Math.max(0, e.readiness - weighted);
  }

  const semanticEngineNote =
    semantic.method === "embeddings"
      ? "Each source score is the stronger of explicit-mention (structural) and embedding cosine-similarity (semantic) evidence."
      : "Embeddings unavailable — scored from explicit-mention (structural) evidence only.";

  const scoreExplanation: ScoreExplanation = {
    overall: matchScore,
    formula:
      "Overall Match = Σ (role skill weight × skill readiness). Each readiness = 0.35·interview + 0.25·projects + 0.20·resume + 0.12·certifications + 0.08·roadmap. " +
      semanticEngineNote +
      " GitHub/LinkedIn enrich confidence only — never the score.",
    contributions,
    largestGaps,
    evidenceSummary: {
      interview: Math.round(evInterview),
      project: Math.round(evProject),
      resume: Math.round(evResume),
      certification: Math.round(evCert),
      roadmap: Math.round(evRoadmap),
      profile: Math.round(evProfile),
    },
  };
  const evidenceSummary = scoreExplanation.evidenceSummary;

  // ── 9. Semantic alignment (resume vs dynamic role profile) ──────────────
  // Compares the resume against a profile *generated from Role Intelligence* —
  // never a manually pasted job description. Degrades gracefully (embeddings →
  // skill-overlap baseline) and never throws.
  const roleProfileText = buildRoleProfileText({
    normalizedTitle: careerFit,
    requiredSkills: required,
    roadmapStages: roleIntelligence.roadmapStages,
  });

  const { semanticScore, semanticMethod } = await computeSemanticAlignment({
    resumeText,
    roleProfileText,
    normalizedTitle: careerFit,
    requiredSkills: required,
    skillMatchBaseline: skillOverlapBaseline,
  }).then((r) => ({ semanticScore: r.semanticScore, semanticMethod: r.method }));

  // ── 10. Composite scores ────────────────────────────────────────────────
  const skillCountScore = Math.min(100, allUserSkills.size * 8);

  // GitHub/LinkedIn deliberately excluded — optional enrichment never feeds the
  // readiness score (their weight is redistributed to evidence-driven signals).
  const readinessScore = Math.round(
    matchScore * 0.30 +
    semanticScore * 0.22 +
    resumeAnalysis.resumeScore * 0.20 +
    profileCompleteness * 0.12 +
    skillCountScore * 0.08 +
    resumeAnalysis.atsScore * 0.08
  );

  const recruiterVisibility = Math.round(
    linkedinScoreResult.score * 0.40 +
    githubScoreResult.score * 0.40 +
    resumeAnalysis.atsScore * 0.20
  );
  const confidence = overallConfidence(skillProficiency);

  // ── 11. Roadmap ─────────────────────────────────────────────────────────
  const { weeks: roadmap, stages: roadmapStages } = buildRoadmap(
    careerFit,
    roleIntelligence,
    {
      resumeSkills: resumeSkillList,
      profileSkills,
      manualSkills: manualSkillList,
      weeklyDone: weeklyProgress,
    }
  );

  // ── 11. Strengths & suggestions text ───────────────────────────────────
  const strengthsText: StrengthEntry[] = [];

  if (strengths.length >= 4)
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

  if (gaps.length > 0)
    aiSuggestions.push({
      title: "Add missing role keywords",
      description: `Your resume is missing key terms for ${careerFit}: ${gaps.slice(0, 5).join(", ")}.`,
    });

  if (resumeAnalysis.sectionsFound.length < 4)
    aiSuggestions.push({
      title: "Add more standard resume sections",
      description: `Detected only ${resumeAnalysis.sectionsFound.length} sections. Add: education, experience, projects, skills.`,
    });

  if (githubScoreResult.score < 50)
    aiSuggestions.push({
      title: "Strengthen your GitHub",
      description: githubProfile.ok
        ? `Only ${githubProfile.ownRepoCount} repos. Pin 4-6 projects and add READMEs to boost recruiter discovery.`
        : `We couldn't read your GitHub profile (${githubProfile.reason}). Make sure the URL is correct and public.`,
    });

  if (linkedinScoreResult.score < 60)
    aiSuggestions.push({
      title: "Improve LinkedIn",
      description: linkedinScoreResult.ok
        ? "Add a headline that mentions your target role and update your About section."
        : linkedinScoreResult.reason ?? "Add your LinkedIn URL to your profile.",
    });

  if (resumeAnalysis.wordCount < 200)
    aiSuggestions.push({
      title: "Expand your resume",
      description: `Resume is only ${resumeAnalysis.wordCount} words — add measurable bullet points to projects/experience.`,
    });

  return {
    careerFit,
    readinessScore,
    matchScore,
    confidence,
    evidenceSummary,
    semanticScore,
    semanticMethod,
    profileCompleteness,
    skillCountScore,
    skillStrengths: strengths,
    skillGaps: gaps,
    recommendedSkills: gaps.slice(0, 5),
    extractedSkills: Array.from(allUserSkills),
    requiredSkills: required,
    skillWeights,
    scoreExplanation,
    roleIntelligence: {
      ...roleIntelligence,
      requiredSkills: required,
    },
    roleGoalSnapshot: goal,
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
    profileStatus: buildProfileStatus({
      resumePath,
      githubUrl,
      linkedinUrl,
      githubProfile,
      linkedin: linkedinScoreResult,
    }),
  };
}
