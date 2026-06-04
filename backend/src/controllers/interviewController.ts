import prisma from "../config/db.js";
import { buildCandidateContext } from "../services/candidateContext.js";
import {
  getCatalog,
  resolveTypeSelection,
  DEFAULT_QUESTION_BUDGET,
  PURPOSE_MAP,
  ROLE_MAP,
} from "../services/interviewTypes.js";
import {
  buildSystemPrompt,
  generateOpener,
  generateNextQuestion,
  evaluateTurn,
  generateScorecard,
  generateRecommendation,
} from "../services/interviewEngine.js";

// Combine the selected purpose + role flavor into one human label, e.g.
// purpose "Technical Interview" + role "Coding Interview" → "Technical Coding
// Interview". This is what we surface to Rexa as {{interview_purpose}}.
function combinedPurposeLabel(purposeKey: string, roleKey: string): string {
  const purposeLabel = PURPOSE_MAP[purposeKey]?.label || purposeKey;
  if (!roleKey || roleKey === "standard") return purposeLabel;
  const roleLabel = ROLE_MAP[roleKey]?.label || "";
  if (!roleLabel) return purposeLabel;
  return `${purposeLabel.replace(/\s*Interview$/i, "").trim()} ${roleLabel}`.trim();
}
import {
  isVoiceAvailable,
  getVoiceStatus,
  createWebCall,
  createPhoneCall,
  getCall,
  normaliseTranscript,
  pairTranscriptToTurns,
} from "../services/retellService.js";

// ---------------------------------------------------------------------------
// GET /api/interviews
//   → catalog of types + past sessions + aggregate performance + voice status
// ---------------------------------------------------------------------------
export const listInterviews = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    const finished = sessions.filter((s: any) => s.status === "finished");
    const scores = finished.map((s: any) => s.score || 0);
    const avg = scores.length
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;
    const best = scores.length ? Math.max(...scores) : 0;

    // -------- Dimension heatmap (averaged across finished sessions) --------
    const dimAvg = (key: any) => {
      const vals = finished.map((s: any) => s[key]).filter((v: any) => v != null);
      return vals.length
        ? Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length)
        : 0;
    };
    const dimensions = {
      technical: dimAvg("technicalScore"),
      communication: dimAvg("communicationScore"),
      problemSolving: dimAvg("problemSolvingScore"),
      confidence: dimAvg("confidenceScore"),
      clarity: dimAvg("clarityScore"),
      culturalFit: dimAvg("culturalFitScore"),
    };

    // -------- Strength / weakness frequency heatmaps -----------------------
    const tally = (key: any) => {
      const counts = new Map();
      for (const s of finished) {
        for (const item of (s as any)[key] || []) {
          const k = String(item).toLowerCase().trim();
          if (!k) continue;
          counts.set(k, (counts.get(k) || 0) + 1);
        }
      }
      return Array.from(counts.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 8);
    };

    // Trend line: last 12 finished sessions, oldest → newest.
    const trend = finished
      .slice()
      .reverse()
      .slice(-12)
      .map((s: any) => ({
        id: s.id,
        score: s.score || 0,
        startedAt: s.startedAt,
        purpose: s.purpose,
      }));

    res.json({
      sessions: sessions.map((s: any) => ({
        id: s.id,
        purpose: s.purpose,
        role: s.role,
        stage: s.stage,
        medium: s.medium,
        format: s.format,
        level: s.level,
        status: s.status,
        mode: s.mode,
        score: s.score,
        careerFit: s.careerFit,
        startedAt: s.startedAt,
        finishedAt: s.finishedAt,
        durationSeconds: s.durationSeconds,
      })),
      performance: {
        interviewsTaken: finished.length,
        avgScore: avg,
        bestScore: best,
        overallScore: avg,
        latestReadiness: (finished[0] as any)?.readinessScore ?? null,
        dimensions,
        strengthsHeatmap: tally("strengths"),
        weaknessesHeatmap: tally("weaknesses"),
        skillGapsHeatmap: tally("skillGaps"),
        trend,
      },
      catalog: getCatalog(),
      voice: getVoiceStatus(),
    });
  } catch (error: any) {
    console.error("listInterviews error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/interviews/start
//   body: { purpose, role, stage, medium, format, level, totalQuestions? }
// ---------------------------------------------------------------------------
export const startInterview = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const type: any = resolveTypeSelection(req.body || {});
    type.totalQuestions =
      Number(req.body?.totalQuestions) ||
      DEFAULT_QUESTION_BUDGET[type.purpose] ||
      6;

    const candidateContext = await buildCandidateContext(userId);

    const interviewerName = process.env.RETELL_AGENT_NAME || "Rexa";

    // Compose the personalised system prompt — this is what the voice agent
    // (or text-mode Gemini) consumes from turn 1.
    const systemPrompt = buildSystemPrompt({
      candidateContext,
      type,
      interviewerName,
    });

    // Voice mode is what the user picked; we only actually use Retell if the
    // server has credentials. Otherwise we silently fall back to text mode so
    // the UX still works.
    const wantsVoice = type.medium === "ai" || type.medium === "video";
    const voiceOk = wantsVoice && isVoiceAvailable();
    const mode = voiceOk ? "voice" : "text";

    // Build the session row up-front so we have an ID to thread into Retell.
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        purpose: type.purpose,
        role: type.role,
        stage: type.stage,
        medium: type.medium,
        format: type.format,
        level: type.level,
        totalQuestions: type.totalQuestions,
        status: "in_progress",
        mode,
        contextSnapshot: candidateContext,
        agentPrompt: systemPrompt,
        careerFit: candidateContext.careerFit,
        interviewerName,
      },
    });

    if (mode === "voice") {
      const dynamicVariables = {
        candidate_name: candidateContext.identity.name || "the candidate",
        // {{career_fit}} → the candidate's saved career goal (falls back to the
        // analysed target role when no explicit goal is set).
        career_fit:
          candidateContext.identity.careerGoal ||
          candidateContext.careerFit ||
          "this role",
        // {{interview_purpose}} → purpose + role flavor combined.
        interview_purpose: combinedPurposeLabel(type.purpose, type.role),
        // {{level}} → selected difficulty.
        level: type.level,
        // {{total_questions}} → selected question budget.
        total_questions: String(type.totalQuestions),
        // {{system_prompt}} → the fully assembled candidate-context prompt.
        // Retell injects these via {{var}} substitution inside the agent's
        // system prompt (configured in their dashboard) — see SETUP guide.
        system_prompt: systemPrompt.slice(0, 8000),
      };

      try {
        const call = await createWebCall({ systemPrompt, dynamicVariables });
        await prisma.interviewSession.update({
          where: { id: session.id },
          data: {
            retellCallId: call.call_id,
            retellAgentId: call.agent_id || process.env.RETELL_AGENT_ID,
            voiceProvider: call.provider,
          },
        });
        return res.status(201).json({
          sessionId: session.id,
          mode: "voice",
          provider: call.provider,
          callId: call.call_id,
          accessToken: call.access_token,
          interviewerName,
          totalQuestions: type.totalQuestions,
          careerFit: candidateContext.careerFit,
          type,
        });
      } catch (e: any) {
        console.error("Retell call failed, falling back to text:", e.message);
        // fall through to text mode
        await prisma.interviewSession.update({
          where: { id: session.id },
          data: { mode: "text" },
        });
      }
    }

    // ----- TEXT MODE ------------------------------------------------------
    const opener = await generateOpener({ candidateContext, type });

    const initialTurns = [{ question: opener.question, answer: null }];
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: { turns: initialTurns },
    });

    res.status(201).json({
      sessionId: session.id,
      mode: "text",
      interviewerName,
      totalQuestions: type.totalQuestions,
      careerFit: candidateContext.careerFit,
      type,
      greeting: opener.greeting,
      firstQuestion: opener.question,
      voiceUnavailableReason: wantsVoice
        ? "RETELL_API_KEY / RETELL_AGENT_ID not configured on the server. See backend/SETUP_VOICE_INTERVIEW.md."
        : null,
    });
  } catch (error: any) {
    console.error("startInterview error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/interviews/:id/turn   (text mode)
//   body: { answer }
// ---------------------------------------------------------------------------
export const submitTurn = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const sessionId = Number(req.params.id);
    const answer = String(req.body?.answer || "").trim();
    if (!answer) return res.status(400).json({ message: "Answer is required" });

    const session: any = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return res.status(404).json({ message: "Not found" });
    if (session.status !== "in_progress")
      return res.status(400).json({ message: "Interview is not active" });
    if (session.mode !== "text")
      return res
        .status(400)
        .json({ message: "Use the voice channel for this session" });

    const turns: any[] = Array.isArray(session.turns) ? [...session.turns] : [];
    const lastIdx = turns.length - 1;
    if (lastIdx < 0 || turns[lastIdx].answer != null)
      return res.status(400).json({ message: "No open question to answer" });

    turns[lastIdx] = { ...turns[lastIdx], answer };

    const candidateContext = session.contextSnapshot;
    const type = {
      purpose: session.purpose,
      role: session.role,
      stage: session.stage,
      medium: session.medium,
      format: session.format,
      level: session.level,
      totalQuestions: session.totalQuestions,
    };

    // Evaluate THIS answer in parallel with generating the next question —
    // they're independent calls so we save ~1 round-trip per turn.
    const answered = turns.filter((t: any) => t.answer != null).length;
    const isLast = answered >= session.totalQuestions;

    const [turnEval, nextQ] = await Promise.all([
      evaluateTurn({ candidateContext, type }, turns[lastIdx]),
      isLast
        ? Promise.resolve(null)
        : generateNextQuestion({ candidateContext, type }, turns),
    ]);

    turns[lastIdx] = {
      ...turns[lastIdx],
      feedback: turnEval.feedback,
      dims: turnEval.dims,
    };

    if (!isLast && nextQ?.question) {
      turns.push({
        question: nextQ.question,
        answer: null,
        rationale: nextQ.rationale,
      });
    }

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { turns },
    });

    res.json({
      sessionId,
      feedback: turnEval.feedback,
      dims: turnEval.dims,
      nextQuestion: isLast ? null : nextQ?.question || null,
      questionIndex: turns.filter((t: any) => t.answer != null).length + (isLast ? 0 : 1),
      totalQuestions: session.totalQuestions,
      isLast,
    });
  } catch (error: any) {
    console.error("submitTurn error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/interviews/:id/voice-end  (voice mode)
//
// Called by the frontend when the Retell WebRTC session disconnects — we
// pull the finished call transcript from Retell, store it, and finalise.
// ---------------------------------------------------------------------------
export const endVoiceCall = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const sessionId = Number(req.params.id);
    const session: any = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return res.status(404).json({ message: "Not found" });
    if (session.mode !== "voice")
      return res.status(400).json({ message: "Not a voice session" });

    let retellRawTranscript: any = [];
    let transcript: any = [];
    let durationSeconds: any = null;

    if (session.retellCallId && isVoiceAvailable()) {
      try {
        const call = await getCall(session.retellCallId);
        retellRawTranscript = call?.transcript_object || call?.transcript || [];
        transcript = normaliseTranscript(call);
        durationSeconds =
          typeof call?.end_timestamp === "number" &&
          typeof call?.start_timestamp === "number"
            ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
            : null;
      } catch (e: any) {
        console.warn("Failed to fetch Retell call:", e.message);
      }
    }

    // The voice agent often says its greeting ("Hi <name>!") as its own turn,
    // which pairs up as a pseudo-question. Drop any opener that isn't a genuine
    // question (no "?") BEFORE the budget cap — otherwise the greeting eats a
    // slot and pushes a real question out of the window.
    const pairedTurns = pairTranscriptToTurns(transcript);
    const questionFilteredTurns = pairedTurns.filter(
      (t: any) => t.question && /\?/.test(t.question)
    );

    console.log("[endVoiceCall] Retell raw transcript:", retellRawTranscript);
    console.log("[endVoiceCall] paired turns before question filter:", pairedTurns);
    console.log(
      "[endVoiceCall] paired turns after question filter:",
      questionFilteredTurns
    );

    // Safety net: cap turns to the session's question budget. Even if the
    // frontend auto-stop and the prompt-level hard-limit both fail and the
    // Retell agent asks extra questions, those overflow Q/As never reach
    // the scorecard.
    const turns = session.totalQuestions
      ? questionFilteredTurns.slice(0, session.totalQuestions)
      : questionFilteredTurns;

    await prisma.interviewSession.update({
  where: { id: sessionId },
  data: {
    transcript,
    turns: turns as any,
    durationSeconds,
  },
});

    // Auto-finalise voice sessions right after the call ends.
    return finalise(session.id, userId, res);
  } catch (error: any) {
    console.error("endVoiceCall error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/interviews/webhook  (Retell webhook)
//
// Retell expects a fast 2xx response. Acknowledge immediately, then process
// the payload asynchronously so retries do not create duplicate work.
// ---------------------------------------------------------------------------
export const retellWebhook = (req: any, res: any) => {
  console.log("[retellWebhook] full payload:", req.body);
  res.sendStatus(200);

  void (async () => {
    try {
      const payload = req.body || {};
      const call = payload.call || payload;
      const callId = call?.call_id;
      if (!callId) {
        console.warn("[retellWebhook] missing call_id");
        return;
      }

      const transcript = normaliseTranscript(call);
      const pairedTurns = pairTranscriptToTurns(transcript);
      const questionFilteredTurns = pairedTurns.filter(
        (t: any) => t.question && /\?/.test(t.question)
      );

      console.log("[retellWebhook] event:", payload.event || null);
      console.log("[retellWebhook] call_id:", callId);
      console.log(
        "[retellWebhook] raw transcript:",
        call?.transcript_object || call?.transcript || []
      );
      console.log("[retellWebhook] paired turns before question filter:", pairedTurns);
      console.log(
        "[retellWebhook] paired turns after question filter:",
        questionFilteredTurns
      );

      const session: any = await prisma.interviewSession.findUnique({
        where: { retellCallId: callId },
      });
      if (!session) {
        console.warn("[retellWebhook] no interview session for call_id:", callId);
        return;
      }

      const turns = session.totalQuestions
        ? questionFilteredTurns.slice(0, session.totalQuestions)
        : questionFilteredTurns;
      const durationSeconds =
        typeof call?.end_timestamp === "number" &&
        typeof call?.start_timestamp === "number"
          ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
          : session.durationSeconds;

      await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          transcript: transcript as any,
          turns: turns as any,
          durationSeconds,
        },
      });
    } catch (error: any) {
      console.error("[retellWebhook] async processing error:", error);
    }
  })();
};

// ---------------------------------------------------------------------------
// POST /api/interviews/:id/finish   (text mode)
// ---------------------------------------------------------------------------
export const finishInterview = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const sessionId = Number(req.params.id);
    return finalise(sessionId, userId, res);
  } catch (error: any) {
    console.error("finishInterview error:", error);
    res.status(500).json({ message: error.message });
  }
};

async function finalise(sessionId: any, userId: any, res: any) {
  const session: any = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) return res.status(404).json({ message: "Not found" });

  const turns = (Array.isArray(session.turns) ? session.turns : []).filter(
    (t: any) => t.answer != null && t.answer !== ""
  );

  if (turns.length === 0) {
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: "abandoned", finishedAt: new Date() },
    });
    return res.json({
      sessionId,
      status: "abandoned",
      message: "No answers recorded",
    });
  }

  const candidateContext = session.contextSnapshot;
  const type = {
    purpose: session.purpose,
    role: session.role,
    stage: session.stage,
    medium: session.medium,
    format: session.format,
    level: session.level,
    totalQuestions: session.totalQuestions,
  };

  const card = await generateScorecard({ candidateContext, type }, turns);

  // Fold the per-question breakdown (answerQuality + one-line feedback) back
  // into the stored turns so the Past-interview review shows it. Additive —
  // existing fields on each turn are preserved.
  const enrichedTurns = turns.map((t: any, i: number) => {
    const qb = card.questionBreakdown?.[i];
    return qb
      ? {
          ...t,
          answerQuality: qb.answerQuality,
          feedback: qb.feedback || t.feedback || null,
        }
      : t;
  });

  // Apply the readinessShift to the candidate's overall dashboard readiness
  // (AIAnalysis.readinessScore). Only touch an existing analysis row so we
  // never create a partial one. The per-interview snapshot is also stored on
  // the session below.
  let dashboardReadiness: number | null = null;
  try {
    const ai = await prisma.aIAnalysis.findUnique({
      where: { userId },
      select: { readinessScore: true },
    });
    if (ai && ai.readinessScore != null && card.readinessShift) {
      dashboardReadiness = Math.max(
        0,
        Math.min(100, ai.readinessScore + card.readinessShift)
      );
      await prisma.aIAnalysis.update({
        where: { userId },
        data: { readinessScore: dashboardReadiness },
      });
    } else if (ai) {
      dashboardReadiness = ai.readinessScore ?? null;
    }
  } catch (e: any) {
    console.warn("[finalise] readinessShift apply failed:", e.message);
  }

  const updated = await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: "finished",
      finishedAt: new Date(),
      turns: enrichedTurns as any,
      score: Math.round(card.overall),
      technicalScore: card.scores.technical,
      communicationScore: card.scores.communication,
      problemSolvingScore: card.scores.problemSolving,
      confidenceScore: card.scores.confidence,
      clarityScore: card.scores.clarity,
      culturalFitScore: card.scores.culturalFit,
      strengths: card.strengths,
      weaknesses: card.weaknesses,
      skillGaps: card.skillGaps,
      advice: card.advice,
      improvementPlan: card.improvementPlan,
      summary: card.summary,
      readinessScore: card.readinessScore,
    },
  });

  res.json({
    sessionId,
    status: "finished",
    score: card.overall, // one-decimal precision for display
    scores: card.scores,
    summary: updated.summary,
    verdict: card.verdict,
    strengths: updated.strengths,
    weaknesses: updated.weaknesses,
    improvements: card.improvements,
    skillGaps: updated.skillGaps,
    advice: updated.advice,
    improvementPlan: updated.improvementPlan,
    nextSteps: card.nextSteps,
    questionBreakdown: card.questionBreakdown,
    readinessScore: updated.readinessScore,
    readinessShift: card.readinessShift,
    dashboardReadiness,
    nextAdaptiveQuestion: card.nextAdaptiveQuestion,
    durationSeconds: session.durationSeconds,
    turns: enrichedTurns,
    transcript: session.transcript,
  });
}

// ---------------------------------------------------------------------------
// POST /api/interviews/:id/abandon
// ---------------------------------------------------------------------------
export const abandonInterview = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const sessionId = Number(req.params.id);
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return res.status(404).json({ message: "Not found" });
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: "abandoned", finishedAt: new Date() },
    });
    res.json({ sessionId, status: "abandoned" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/interviews/:id
// ---------------------------------------------------------------------------
export const getInterview = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const sessionId = Number(req.params.id);
    const session: any = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) return res.status(404).json({ message: "Not found" });
    // Strip the heavy snapshot from the wire — frontend doesn't need it.
    const { contextSnapshot, agentPrompt, ...rest } = session;
    res.json(rest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/interviews/recommendation
//   → Gemini-picked interview config tailored to the candidate's profile.
//     Used by the "Recommended for you" banner. Best-effort: the frontend
//     applies its own 3s timeout and simply hides the banner on any failure.
// ---------------------------------------------------------------------------
export const recommendInterview = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { aiAnalysis: true },
    });
    if (!user) return res.status(404).json({ message: "Not found" });

    const ai = user.aiAnalysis;
    const skillGaps: string[] = ai?.weaknesses || ai?.missingSkills || [];
    const projectCount = (ai?.projectTitles || []).length;

    const rec = await generateRecommendation({
      careerGoal: user.careerGoal,
      careerFit: ai?.careerFit,
      readinessScore: ai?.readinessScore ?? null,
      skillGaps,
      projectCount,
    });

    res.json(rec);
  } catch (error: any) {
    console.error("recommendInterview error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/interviews/dial  (phone-call seam — leave wired for Phase 3)
// ---------------------------------------------------------------------------
export const dialCandidate = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const toNumber = String(req.body?.phone || "").trim();
    if (!toNumber) return res.status(400).json({ message: "Phone required" });
    if (!isVoiceAvailable() || !process.env.RETELL_PHONE_NUMBER)
      return res.status(503).json({
        message:
          "Phone-call mode requires RETELL_API_KEY + RETELL_AGENT_ID + RETELL_PHONE_NUMBER. See backend/SETUP_VOICE_INTERVIEW.md.",
      });

    const type: any = resolveTypeSelection({ ...(req.body || {}), medium: "phone" });
    type.totalQuestions =
      Number(req.body?.totalQuestions) ||
      DEFAULT_QUESTION_BUDGET[type.purpose] ||
      6;

    const candidateContext = await buildCandidateContext(userId);
    const systemPrompt = buildSystemPrompt({
      candidateContext,
      type,
      interviewerName: process.env.RETELL_AGENT_NAME || "Rexa",
    });

    const session = await prisma.interviewSession.create({
      data: {
        userId,
        purpose: type.purpose,
        role: type.role,
        stage: type.stage,
        medium: "phone",
        format: type.format,
        level: type.level,
        totalQuestions: type.totalQuestions,
        status: "in_progress",
        mode: "voice",
        contextSnapshot: candidateContext,
        agentPrompt: systemPrompt,
        careerFit: candidateContext.careerFit,
      },
    });

    const call = await createPhoneCall({
      toNumber,
      dynamicVariables: {
        candidate_name: candidateContext.identity.name,
        career_fit: candidateContext.careerFit,
        system_prompt: systemPrompt.slice(0, 8000),
      },
    });

    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        retellCallId: call.call_id,
        retellAgentId: process.env.RETELL_AGENT_ID,
        voiceProvider: call.provider,
      },
    });

    res.json({
      sessionId: session.id,
      callId: call.call_id,
      message: "Phone call queued — your phone will ring shortly.",
    });
  } catch (error: any) {
    console.error("dialCandidate error:", error);
    res.status(500).json({ message: error.message });
  }
};
