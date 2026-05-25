// candidateContext.js
// -----------------------------------------------------------------------------
// Single source of truth for "everything we know about this candidate" — used
// to turn a generic interview into a personalised one.
//
// We deliberately re-use `runAnalysis` (the same engine the Analyzer / Skill
// Gap / Roadmap pages consume) so the interviewer sees the SAME picture the
// rest of the app shows the user. That includes:
//   - profile + listed skills
//   - resume parse (ATS score, found skills, missing keywords, sections)
//   - GitHub analysis (score, top languages, repo count)
//   - LinkedIn presence
//   - role-specific required skills + gaps + strengths
//   - roadmap stages + which weeks the user has completed
//   - AI suggestions + readiness score
//
// The output is a *flat, prompt-friendly* object — every field is either a
// short string or a small array, so we can drop it straight into a Gemini /
// Retell system prompt without prompt-bloat.
// -----------------------------------------------------------------------------

import prisma from "../config/db.js";
import { runAnalysis } from "./analysisService.js";

async function loadManualProgress(userId) {
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
      manualSkills: skills.map((s) => s.skillName),
      weeklyProgress: weekly,
    };
  } catch {
    return { manualSkills: [], weeklyProgress: [] };
  }
}

// Build the projects array from whichever AIAnalysis fields the user has
// populated. We accept either parallel arrays (titles/descs/tech) OR the
// `savedProjects` JSON-string array that the Projects page writes.
function buildProjects(ai) {
  if (!ai) return [];

  // Modern shape: parallel arrays per project.
  const titles = ai.projectTitles || [];
  if (titles.length > 0) {
    return titles.map((title, i) => ({
      title,
      status: ai.projectStatuses?.[i] || null,
      description: ai.projectDescriptions?.[i] || null,
      technologies: parseTechTags(ai.projectTechnologies?.[i]),
    }));
  }

  // Fallback: a single JSON blob per project saved to `savedProjects`.
  return (ai.savedProjects || [])
    .map((raw) => {
      try {
        const j = JSON.parse(raw);
        return {
          title: j.title || j.name || "Untitled project",
          status: j.status || null,
          description: j.description || j.summary || null,
          technologies: parseTechTags(j.tags || j.technologies),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function parseTechTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  // Could be "react, node, mongodb" or "react,node" — split on comma/pipe.
  return String(value)
    .split(/[,|·•]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickStrengths(analysis, ai) {
  const list = [
    ...(ai?.strengths || []),
    ...(analysis?.skillStrengths || []),
    ...((analysis?.strengthsText || []).map((s) => s.title) || []),
  ];
  return Array.from(new Set(list)).slice(0, 8);
}

function pickWeaknesses(analysis, ai) {
  const list = [
    ...(ai?.weaknesses || []),
    ...(analysis?.skillGaps || []),
  ];
  return Array.from(new Set(list)).slice(0, 8);
}

function pickRoadmapSnapshot(analysis) {
  const stages = analysis?.roadmapStages || [];
  const active = stages.find((s) => s.status === "active");
  const completed = stages.filter((s) => s.status === "completed").length;
  return {
    totalStages: stages.length,
    completedStages: completed,
    activeStage: active
      ? { title: active.title, progress: active.progress, gapSkills: active.gapSkills }
      : null,
    overallProgress: stages.length
      ? Math.round(
          stages.reduce((acc, s) => acc + (s.progress || 0), 0) / stages.length
        )
      : 0,
  };
}

export async function buildCandidateContext(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: true, aiAnalysis: true },
  });
  if (!user) throw new Error("User not found");

  const { manualSkills, weeklyProgress } = await loadManualProgress(userId);

  let analysis;
  try {
    analysis = await runAnalysis({
      user,
      skills: user.skills.map((s) => s.name),
      careerGoal: user.careerGoal,
      resumePath: user.resume,
      githubUrl: user.github,
      linkedinUrl: user.linkedin,
      manualSkills,
      weeklyProgress,
    });
  } catch (e) {
    // Resume parse can fail on weird PDFs — keep going with a minimal context.
    console.warn("[candidateContext] runAnalysis failed:", e.message);
    analysis = null;
  }

  const ai = user.aiAnalysis;

  const projects = buildProjects(ai);
  const profileSkills = user.skills.map((s) => s.name);

  return {
    userId,

    identity: {
      name: user.name,
      college: user.college || null,
      degree: ai?.degree || null,
      specialization: ai?.specialization || null,
      bio: user.bio || ai?.bio || null,
      careerGoal: user.careerGoal || null,
    },

    careerFit: analysis?.careerFit || ai?.careerFit || "Software Engineer",
    targetRole: analysis?.targetRole || null,

    readinessScore: ai?.readinessScore ?? analysis?.readinessScore ?? null,
    atsScore: ai?.atsScore ?? analysis?.resume?.atsScore ?? null,
    resumeScore: ai?.resumeScore ?? analysis?.resume?.score ?? null,
    matchScore: analysis?.matchScore ?? null,

    skills: {
      profile: profileSkills,
      extracted: analysis?.extractedSkills || ai?.extractedSkills || [],
      required: analysis?.requiredSkills || [],
      strengths: pickStrengths(analysis, ai),
    },

    skillGaps: pickWeaknesses(analysis, ai),

    projects,

    github: analysis?.github
      ? {
          score: analysis.github.score,
          repos: analysis.github.profile?.ownRepoCount ?? null,
          stars: analysis.github.profile?.totalStars ?? null,
          languages: analysis.github.languagesMatched || [],
          topLanguages: Object.keys(
            analysis.github.profile?.languageBytes || {}
          ).slice(0, 5),
        }
      : null,

    linkedin: analysis?.linkedin
      ? { score: analysis.linkedin.score, ok: analysis.linkedin.ok }
      : null,

    resume: analysis?.resume
      ? {
          ok: analysis.resume.ok,
          score: analysis.resume.score,
          atsScore: analysis.resume.atsScore,
          foundSkills: analysis.resume.foundSkills,
          missingKeywords: analysis.resume.missingKeywords,
          sectionsFound: analysis.resume.sectionsFound,
          wordCount: analysis.resume.wordCount,
        }
      : null,

    roadmap: pickRoadmapSnapshot(analysis),

    aiSummary: ai?.aiSummary || null,
    aiSuggestions: (analysis?.aiSuggestions || []).map((s) =>
      typeof s === "string" ? s : `${s.title}: ${s.description}`
    ),
  };
}

// Compact, prompt-ready text version of the context. Used inside system
// prompts where token budgets matter — drop only the headline facts so the
// interviewer can reason about them.
export function contextToPromptBlock(ctx) {
  const lines = [];
  lines.push(`CANDIDATE: ${ctx.identity.name}`);
  if (ctx.identity.careerGoal)
    lines.push(`CAREER GOAL: ${ctx.identity.careerGoal}`);
  lines.push(`TARGET ROLE: ${ctx.careerFit}`);
  if (ctx.identity.degree || ctx.identity.specialization || ctx.identity.college) {
    const edu = [
      ctx.identity.degree,
      ctx.identity.specialization,
      ctx.identity.college,
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(`EDUCATION: ${edu}`);
  }
  if (ctx.identity.bio) lines.push(`BIO: ${ctx.identity.bio}`);

  if (ctx.skills.profile.length || ctx.skills.extracted.length) {
    const all = Array.from(
      new Set([...(ctx.skills.profile || []), ...(ctx.skills.extracted || [])])
    ).slice(0, 20);
    lines.push(`SKILLS: ${all.join(", ")}`);
  }
  if (ctx.skills.strengths.length)
    lines.push(`STRENGTHS: ${ctx.skills.strengths.slice(0, 6).join(", ")}`);
  if (ctx.skillGaps.length)
    lines.push(`SKILL GAPS: ${ctx.skillGaps.slice(0, 6).join(", ")}`);

  if (ctx.projects.length) {
    lines.push("PROJECTS:");
    for (const p of ctx.projects.slice(0, 5)) {
      const tech = p.technologies?.length ? ` [${p.technologies.join(", ")}]` : "";
      const desc = p.description ? ` — ${truncate(p.description, 120)}` : "";
      lines.push(`  • ${p.title}${tech}${desc}`);
    }
  }

  if (ctx.github) {
    const lang = ctx.github.topLanguages.length
      ? `, top langs: ${ctx.github.topLanguages.join("/")}`
      : "";
    lines.push(
      `GITHUB: ${ctx.github.repos ?? 0} repos, ${ctx.github.stars ?? 0} stars${lang}`
    );
  }

  if (ctx.resume?.ok) {
    lines.push(
      `RESUME: ATS ${ctx.resume.atsScore}/100, sections [${(
        ctx.resume.sectionsFound || []
      ).join(", ")}]`
    );
  }

  if (ctx.roadmap?.activeStage) {
    lines.push(
      `ROADMAP: currently in "${ctx.roadmap.activeStage.title}" (${
        ctx.roadmap.activeStage.progress
      }% done) — gaps: ${(ctx.roadmap.activeStage.gapSkills || []).join(", ")}`
    );
  }

  if (ctx.readinessScore != null)
    lines.push(`AI READINESS SCORE: ${ctx.readinessScore}/100`);

  return lines.join("\n");
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
