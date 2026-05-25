// interviewTypes.js
// -----------------------------------------------------------------------------
// Catalog of interview types across the 5 axes the product surfaces:
//   purpose × role × stage × medium × format
//
// Each axis contributes a `promptOverlay` (extra system-prompt text), and
// `purpose` is the only axis that also overrides the 6-dimension evaluation
// weights — e.g. a "stress" interview cares much more about confidence than
// technical depth.
//
// The default rubric (sum = 100) is the spec the product asked for:
//   technical 30 · communication 25 · problemSolving 20 ·
//   confidence 10 · clarity 10 · culturalFit 5
// -----------------------------------------------------------------------------

export const DEFAULT_WEIGHTS = {
  technical: 30,
  communication: 25,
  problemSolving: 20,
  confidence: 10,
  clarity: 10,
  culturalFit: 5,
};

// ----- PURPOSE ---------------------------------------------------------------
export const PURPOSES = [
  {
    key: "screening",
    label: "Screening Interview",
    description:
      "Light-touch first filter — verify the basics on the candidate's resume.",
    promptOverlay: `This is a SCREENING interview. Verify the candidate's resume claims, confirm interest in ${
      "{{careerFit}}"
    }, and probe for any blocking red flags. Stay conversational — short answers are fine.`,
    weights: { ...DEFAULT_WEIGHTS, technical: 20, culturalFit: 15 },
  },
  {
    key: "technical",
    label: "Technical Interview",
    description: "Deep dive into role-specific technical knowledge.",
    promptOverlay: `This is a TECHNICAL interview. Probe depth on the candidate's listed skills and projects. Ask follow-ups that force them to explain *why*, not just *what*.`,
    weights: { ...DEFAULT_WEIGHTS },
  },
  {
    key: "behavioral",
    label: "Behavioral Interview",
    description:
      "STAR-style stories about teamwork, ownership, and learning from failure.",
    promptOverlay: `This is a BEHAVIORAL interview. Ask STAR-style questions ("tell me about a time…"). Push for specifics — what they did vs. what their team did.`,
    weights: { ...DEFAULT_WEIGHTS, technical: 10, communication: 35, culturalFit: 15 },
  },
  {
    key: "situational",
    label: "Situational Interview",
    description: "How they would handle hypothetical job scenarios.",
    promptOverlay: `This is a SITUATIONAL interview. Pose realistic job scenarios ("imagine you are…") and watch how they reason through ambiguity.`,
    weights: { ...DEFAULT_WEIGHTS, problemSolving: 30, technical: 20 },
  },
  {
    key: "case",
    label: "Case Interview",
    description: "Open-ended business / product / technical case to walk through.",
    promptOverlay: `This is a CASE interview. Give them one open-ended case and let them drive — structure, assumptions, calculations, recommendation.`,
    weights: { ...DEFAULT_WEIGHTS, problemSolving: 35, technical: 20, communication: 20 },
  },
  {
    key: "cultural-fit",
    label: "Cultural Fit Interview",
    description: "Values, working style, motivation alignment.",
    promptOverlay: `This is a CULTURAL-FIT interview. Explore values, motivation, and how they like to work. There are no wrong answers — listen for self-awareness.`,
    weights: { ...DEFAULT_WEIGHTS, technical: 5, communication: 30, culturalFit: 30 },
  },
  {
    key: "competency",
    label: "Competency-Based Interview",
    description: "Map each answer to a specific competency the role requires.",
    promptOverlay: `This is a COMPETENCY-BASED interview. Each question should target a single competency (e.g. "ownership", "debugging", "stakeholder communication") and probe for evidence.`,
    weights: { ...DEFAULT_WEIGHTS, communication: 30, problemSolving: 25 },
  },
  {
    key: "stress",
    label: "Stress Interview",
    description: "Pressure-test how the candidate handles tough or rapid questions.",
    promptOverlay: `This is a STRESS interview. Ask rapid follow-ups, gently challenge their answers, and watch how they handle pressure. Never insult — pressure is intellectual, not personal.`,
    weights: { ...DEFAULT_WEIGHTS, confidence: 25, problemSolving: 25, technical: 20 },
  },
];

// ----- ROLE-SHAPED INTERVIEWS -----------------------------------------------
export const ROLES = [
  {
    key: "standard",
    label: "Standard",
    description: "No special role overlay — drive by purpose alone.",
    promptOverlay: "",
  },
  {
    key: "coding",
    label: "Coding Interview",
    description: "Live-style coding problem walked through verbally.",
    promptOverlay: `Frame at least one question as a coding problem the candidate can talk through (no live code needed — pseudo-code and reasoning are fine). Always ask for time/space complexity.`,
  },
  {
    key: "dsa",
    label: "DSA Interview",
    description: "Data-structures-and-algorithms reasoning.",
    promptOverlay: `Focus on DSA reasoning. Ask the candidate to talk through approach, optimal data structures, edge cases, and Big-O — no live coding required.`,
  },
  {
    key: "portfolio",
    label: "Portfolio Review",
    description: "Walk through the candidate's projects in depth.",
    promptOverlay: `Lead with the candidate's projects (use the PROJECTS block in their profile). Ask about decisions, trade-offs, what would they do differently, and what they personally built vs. what was off-the-shelf.`,
  },
  {
    key: "presentation",
    label: "Presentation Interview",
    description: "Candidate presents a topic; we ask follow-ups.",
    promptOverlay: `Ask the candidate to present a topic from their resume or a recent project (5 min). Then ask 2-3 probing follow-ups on the content.`,
  },
  {
    key: "working",
    label: "Working Interview",
    description: "Simulate a slice of the actual job.",
    promptOverlay: `Simulate a real on-the-job task for the target role (e.g., debugging a broken API for a backend candidate). Talk through the work together.`,
  },
  {
    key: "resume-discussion",
    label: "Resume Discussion",
    description: "Walk through each line of the resume.",
    promptOverlay: `Walk through the candidate's resume / projects line-by-line. For every claim, ask "what did *you* do" and "what was the outcome".`,
  },
];

// ----- STAGE ----------------------------------------------------------------
export const STAGES = [
  {
    key: "first",
    label: "First Round",
    promptOverlay: `This is a FIRST-ROUND interview — be welcoming, set the tone, and cover breadth over depth.`,
  },
  {
    key: "second",
    label: "Second Round",
    promptOverlay: `This is a SECOND-ROUND interview — go deeper on areas of doubt from a hypothetical earlier round, and probe how they think.`,
  },
  {
    key: "final",
    label: "Final Round",
    promptOverlay: `This is a FINAL-ROUND interview — assume basic fit is already established. Focus on senior-level judgement, leadership, and the hiring decision.`,
  },
];

// ----- MEDIUM ---------------------------------------------------------------
export const MEDIUMS = [
  {
    key: "ai",
    label: "AI Interview",
    description: "AI interviewer (Rexa) via in-browser voice — no human on the line.",
    promptOverlay: `You are an AI interviewer; be transparent about that if asked, but stay professional and warm.`,
  },
  {
    key: "phone",
    label: "Phone Interview",
    description: "AI dials the candidate's phone via Retell + Twilio.",
    promptOverlay: `Treat this as a phone screen — no whiteboard, no video. Keep questions verbal-friendly and avoid asking the candidate to "show" anything.`,
  },
  {
    key: "video",
    label: "Video Interview",
    description: "Browser-based voice + visible interviewer card.",
    promptOverlay: `Treat this as a video call — you can suggest the candidate share their screen for code or diagrams.`,
  },
];

// ----- FORMAT ---------------------------------------------------------------
export const FORMATS = [
  {
    key: "one-on-one",
    label: "One-on-One",
    promptOverlay: "",
  },
  {
    key: "panel",
    label: "Panel",
    promptOverlay: `Simulate a panel of 2-3 interviewers — vary your tone and the angle of each question (e.g., one technical, one cultural, one product). Sign each question with the panellist persona, e.g. "[Tech lead]: ...".`,
  },
  {
    key: "sequential",
    label: "Sequential",
    promptOverlay: `Simulate a sequence of focused mini-interviews — group questions by theme (technical → behavioral → product) and announce each transition briefly.`,
  },
];

export const LEVELS = ["easy", "medium", "hard"];

// Default question budgets per purpose, used when the UI doesn't override.
export const DEFAULT_QUESTION_BUDGET = {
  screening: 5,
  technical: 6,
  behavioral: 5,
  situational: 4,
  case: 3,
  "cultural-fit": 4,
  competency: 6,
  stress: 5,
};

// ----- Lookups --------------------------------------------------------------
const byKey = (arr) => Object.fromEntries(arr.map((x) => [x.key, x]));
export const PURPOSE_MAP = byKey(PURPOSES);
export const ROLE_MAP = byKey(ROLES);
export const STAGE_MAP = byKey(STAGES);
export const MEDIUM_MAP = byKey(MEDIUMS);
export const FORMAT_MAP = byKey(FORMATS);

export function resolveTypeSelection({
  purpose,
  role,
  stage,
  medium,
  format,
  level,
}) {
  return {
    purpose: PURPOSE_MAP[purpose] ? purpose : "technical",
    role: ROLE_MAP[role] ? role : "standard",
    stage: STAGE_MAP[stage] ? stage : "first",
    medium: MEDIUM_MAP[medium] ? medium : "ai",
    format: FORMAT_MAP[format] ? format : "one-on-one",
    level: LEVELS.includes(level) ? level : "medium",
  };
}

export function resolveWeights(purposeKey) {
  return PURPOSE_MAP[purposeKey]?.weights || DEFAULT_WEIGHTS;
}

export function getCatalog() {
  // Strip prompt overlays from the wire payload — they're internal.
  const strip = (arr) =>
    arr.map(({ promptOverlay, weights, ...rest }) => rest);
  return {
    purposes: strip(PURPOSES),
    roles: strip(ROLES),
    stages: strip(STAGES),
    mediums: strip(MEDIUMS),
    formats: strip(FORMATS),
    levels: LEVELS,
    weights: DEFAULT_WEIGHTS,
  };
}
