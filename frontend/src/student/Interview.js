import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { RetellWebClient } from "retell-client-js-sdk";

import {
  LayoutDashboard,
  Brain,
  Route,
  FileSearch,
  FileText,
  Video,
  FolderKanban,
  User,
  Settings,
  PlayCircle,
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  X,
  Send,
  Sparkles,
  History,
  LogOut,
  Zap,
  Volume2,
  Info,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import logout from "../utils/logout";
import { API_BASE_URL } from "../config/api";

const API = API_BASE_URL;

const SidebarLink = ({ href, icon: Icon, label, active }) => (
  <a
    href={href}
    className={
      active
        ? "flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
        : "flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
    }
  >
    <Icon className={active ? "w-5 h-5 text-white" : "w-5 h-5"} />
    {label}
  </a>
);

// Friendly fallback descriptors when the backend catalog hasn't loaded yet.
const FALLBACK_PURPOSES = [
  { key: "technical", label: "Technical Interview", description: "Role-specific technical depth" },
  { key: "screening", label: "Screening Interview", description: "Light-touch resume verification" },
];

const DIM_LABELS = {
  technical: "Technical",
  communication: "Communication",
  problemSolving: "Problem solving",
  confidence: "Confidence",
  clarity: "Clarity",
  culturalFit: "Cultural fit",
};

// Card-click explanations (Part 2). Keyed by catalog key — covers both Purpose
// cards and Role-flavor cards. Shown in an inline info box below the card row.
const INTERVIEW_INFO = {
  // ---- Purpose cards ----
  screening: {
    bestFor: "any early stage application",
    willAsk: "resume basics, role motivation, availability",
    recommendedWhen: "you have a first call coming up",
  },
  technical: {
    bestFor: "software engineering roles",
    willAsk: "system design, architecture decisions, debugging, coding concepts",
    recommendedWhen: "you have a technical round at a product company",
  },
  behavioral: {
    bestFor: "all roles",
    willAsk: "STAR format stories about teamwork, failure, ownership, conflict",
    recommendedWhen: "you have an HR or culture round",
  },
  situational: {
    bestFor: "product and leadership roles",
    willAsk: "hypothetical job scenarios and how you would handle them",
    recommendedWhen: "you are applying for roles with decision making responsibility",
  },
  case: {
    bestFor: "product, consulting, business roles",
    willAsk: "open ended business or technical cases to walk through",
    recommendedWhen: "you are targeting product manager or consulting roles",
  },
  "cultural-fit": {
    bestFor: "startups and product companies",
    willAsk: "values, motivation, working style, team alignment",
    recommendedWhen: "company culture is a big part of the role",
  },
  competency: {
    bestFor: "structured corporate hiring",
    willAsk: "specific competency mapped answers for each role requirement",
    recommendedWhen: "applying to large companies with structured hiring",
  },
  stress: {
    bestFor: "high pressure roles",
    willAsk: "rapid fire and tough questions to test composure",
    recommendedWhen: "you want to pressure test yourself before a hard interview",
  },
  // ---- Role-flavor cards ----
  coding: {
    bestFor: "engineering roles",
    willAsk:
      "live style coding problems explained verbally, time and space complexity, approach and tradeoffs",
    recommendedWhen: "you have a coding round coming up",
  },
  dsa: {
    bestFor: "big tech engineering roles",
    willAsk: "data structures and algorithm reasoning explained verbally",
    recommendedWhen: "targeting FAANG or product engineering companies",
  },
  portfolio: {
    bestFor: "designers, developers, AI engineers",
    willAsk: "deep dive into your actual projects, decisions made, outcomes",
    recommendedWhen: "your projects are your strongest asset",
  },
  presentation: {
    bestFor: "product and leadership roles",
    willAsk: "follow up questions on a topic you present",
    recommendedWhen: "role requires communication and structured thinking",
  },
  working: {
    bestFor: "any hands on role",
    willAsk: "simulate a slice of actual job tasks verbally",
    recommendedWhen: "you want the most realistic interview simulation",
  },
  "resume-discussion": {
    bestFor: "all roles",
    willAsk: "walk through every line of your resume, explain gaps, justify claims",
    recommendedWhen:
      "your resume has strong content but you struggle to talk about it",
  },
};

export default function Interview() {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null); // catalog + sessions + performance + voice
  const [view, setView] = useState("home"); // home | live-text | live-voice | scorecard | review

  // Type selection
  const [purpose, setPurpose] = useState("technical");
  const [role, setRole] = useState("standard");
  const [stage, setStage] = useState("first");
  const [medium, setMedium] = useState("ai");
  const [format, setFormat] = useState("one-on-one");
  const [level, setLevel] = useState("medium");
  const [totalQuestions, setTotalQuestions] = useState(6);

  // Profile-based recommended config (Part 3 banner)
  const [recommendation, setRecommendation] = useState(null);

  // Live session state
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [scorecard, setScorecard] = useState(null);
  const [reviewSession, setReviewSession] = useState(null);

  // Voice state (Retell)
  const retellRef = useRef(null);
  const [voiceState, setVoiceState] = useState("idle"); // idle | connecting | live | ended
  const [muted, setMuted] = useState(false);
  const [voiceTurns, setVoiceTurns] = useState([]); // [{role, text}]
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef(null);
  // Latches once we've programmatically ended the call because the agent
  // hit the question budget — prevents double-stopCall and lets later
  // transcript updates fall through cleanly.
  const budgetReachedRef = useRef(false);

  const textareaRef = useRef(null);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchMeta = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/interviews`, {
        headers: authHeaders(),
      });
      setMeta(data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeta();
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      retellRef.current?.stopCall?.();
    };
  }, [fetchMeta]);

  // Part 3 — fetch the profile-based recommendation on load. Hard 3s timeout;
  // on any failure or timeout we simply never show the banner (non-blocking).
  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API}/api/interviews/recommendation`, {
        headers: authHeaders(),
        timeout: 3000,
      })
      .then(({ data }) => {
        if (!cancelled && data?.reason) setRecommendation(data);
      })
      .catch(() => {
        /* silent — banner just doesn't appear */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyRecommendation = () => {
    if (!recommendation) return;
    if (recommendation.purpose) setPurpose(recommendation.purpose);
    if (recommendation.roleFlavor) setRole(recommendation.roleFlavor);
    if (recommendation.difficulty) setLevel(recommendation.difficulty);
    if (recommendation.questionBudget)
      setTotalQuestions(recommendation.questionBudget);
  };

  // -------------------- VOICE (Retell) plumbing ---------------------------
  const teardownRetell = () => {
    try {
      retellRef.current?.stopCall?.();
    } catch {}
    retellRef.current = null;
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const wireRetellEvents = (client, sessionId, totalQuestions) => {
    client.on("call_started", () => {
      setVoiceState("live");
      const start = Date.now();
      callTimerRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    });
    client.on("call_ended", async () => {
      teardownRetell();
      setVoiceState("ended");
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const { data } = await axios.post(
          `${API}/api/interviews/${sessionId}/voice-end`,
          {},
          { headers: authHeaders() }
        );
        if (data.status === "finished") {
          setScorecard(data);
          setView("scorecard");
          fetchMeta();
        } else if (data.status === "evaluation_unavailable") {
          // Recorded but unscored — show the retry card, not a fake scorecard.
          setScorecard(data);
          setView("scorecard");
        } else {
          toast.error(data.message || "Call ended without enough content");
          setView("home");
        }
      } catch (e) {
        toast.error(e.response?.data?.message || e.message);
        setView("home");
      }
    });
    client.on("agent_start_talking", () => setAgentSpeaking(true));
    client.on("agent_stop_talking", () => setAgentSpeaking(false));
    client.on("update", (update) => {
      // Live transcript stream. Retell emits the running transcript on every
      // update event — we just take the latest version.
      const transcript = update?.transcript || update?.transcript_object || [];
      if (!Array.isArray(transcript) || !transcript.length) return;

      const mapped = transcript.map((t) => ({
        role:
          t.role === "agent" || t.role === "assistant" ? "ai" : "candidate",
        text:
          t.content ||
          (Array.isArray(t.words)
            ? t.words.map((w) => w.word).join(" ")
            : ""),
      }));
      setVoiceTurns(mapped);

      // Hard cap — Retell's LLM does not reliably count its own questions,
      // so we count actual interview questions (agent turns containing "?")
      // and end the call once the budget is reached AND the candidate has
      // finished responding to the final question.
      if (totalQuestions && !budgetReachedRef.current) {
        const agentQuestions = mapped.filter(
          (t) => t.role === "ai" && /\?/.test(t.text || "")
        ).length;
        const lastTurn = mapped[mapped.length - 1];
        const candidateAnswered =
          lastTurn?.role === "candidate" &&
          (lastTurn.text || "").trim().length > 3;
        if (agentQuestions >= totalQuestions && candidateAnswered) {
          budgetReachedRef.current = true;
          try {
            retellRef.current?.stopCall?.();
          } catch {
            /* call_ended handler will fire and clean up */
          }
        }
      }
    });
    client.on("error", (err) => {
      console.error("Retell error:", err);
      toast.error("Voice connection error");
    });
  };

  // -------------------- Session lifecycle ---------------------------------
  const startInterview = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${API}/api/interviews/start`,
        {
          purpose,
          role,
          stage,
          medium,
          format,
          level,
          totalQuestions,
        },
        { headers: authHeaders() }
      );

      setSession({
        id: data.sessionId,
        mode: data.mode,
        type: data.type,
        interviewerName: data.interviewerName,
        careerFit: data.careerFit,
        totalQuestions: data.totalQuestions,
        turns: [],
        current: data.firstQuestion || null,
        currentIndex: 1,
      });
      setScorecard(null);
      setAnswer("");
      setVoiceTurns([]);
      setCallDuration(0);
      budgetReachedRef.current = false;

      if (data.mode === "voice" && data.accessToken) {
        // Voice path — kick off Retell web call
        setView("live-voice");
        setVoiceState("connecting");

        const client = new RetellWebClient();
        retellRef.current = client;
        wireRetellEvents(client, data.sessionId, data.totalQuestions);

        try {
          await client.startCall({
            accessToken: data.accessToken,
            sampleRate: 24000,
            captureDeviceId: "default",
            playbackDeviceId: "default",
            emitRawAudioSamples: false,
          });
        } catch (e) {
          teardownRetell();
          setVoiceState("idle");
          toast.error("Couldn't access microphone: " + e.message);
          setView("home");
        }
      } else {
        // Text fallback
        if (data.voiceUnavailableReason) {
          toast(
            "Voice mode unavailable — running in text mode. " +
              data.voiceUnavailableReason,
            { duration: 6000 }
          );
        }
        setView("live-text");
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  const submitTextAnswer = async () => {
    if (!session || !answer.trim() || busy) return;
    const sentAnswer = answer.trim();
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${API}/api/interviews/${session.id}/turn`,
        { answer: sentAnswer },
        { headers: authHeaders() }
      );
      setSession((s) => ({
        ...s,
        turns: [
          ...s.turns,
          {
            question: s.current,
            answer: sentAnswer,
            feedback: data.feedback,
            dims: data.dims,
          },
        ],
        current: data.nextQuestion,
        currentIndex: data.questionIndex,
      }));
      setAnswer("");

      if (data.isLast) {
        const { data: card } = await axios.post(
          `${API}/api/interviews/${session.id}/finish`,
          {},
          { headers: authHeaders() }
        );
        setScorecard(card);
        setView("scorecard");
        // Only refresh history/meta once a real scored card exists.
        if (card.status !== "evaluation_unavailable") fetchMeta();
      } else {
        textareaRef.current?.focus();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  const endVoiceCall = async () => {
    try {
      retellRef.current?.stopCall?.();
    } catch {
      /* the call_ended handler will run regardless */
    }
  };

  const toggleMute = () => {
    if (!retellRef.current) return;
    if (muted) retellRef.current.unmute();
    else retellRef.current.mute();
    setMuted(!muted);
  };

  const abandonInterview = async () => {
    if (!session) return;
    try {
      await axios.post(
        `${API}/api/interviews/${session.id}/abandon`,
        {},
        { headers: authHeaders() }
      );
    } catch {
      /* best effort */
    }
    teardownRetell();
    setSession(null);
    setScorecard(null);
    setAnswer("");
    setView("home");
    fetchMeta();
  };

  const openReview = async (id) => {
    try {
      const { data } = await axios.get(`${API}/api/interviews/${id}`, {
        headers: authHeaders(),
      });
      setReviewSession(data);
      setView("review");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  // Ctrl/Cmd+Enter → submit (text mode)
  useEffect(() => {
    const onKey = (e) => {
      if (view !== "live-text") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submitTextAnswer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const closeScorecard = () => {
    setScorecard(null);
    setSession(null);
    setView("home");
  };

  // Re-run AI scoring for a session whose evaluation was temporarily
  // unavailable (e.g. a Gemini 429). Answers are already saved server-side, so
  // /finish simply re-evaluates the same transcript.
  const [retrying, setRetrying] = useState(false);
  const retryScoring = async (sessionId) => {
    if (!sessionId) return;
    try {
      setRetrying(true);
      const { data } = await axios.post(
        `${API}/api/interviews/${sessionId}/finish`,
        {},
        { headers: authHeaders() }
      );
      setScorecard(data);
      if (data.status !== "evaluation_unavailable") fetchMeta();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b89968]" />
      </div>
    );
  }

  const catalog = meta?.catalog;
  const purposes = catalog?.purposes || FALLBACK_PURPOSES;
  const roles = catalog?.roles || [];
  const stages = catalog?.stages || [];
  const mediums = catalog?.mediums || [];
  const formats = catalog?.formats || [];
  const levels = catalog?.levels || ["easy", "medium", "hard"];

  const voiceStatus = meta?.voice || { available: false };

  // -------------------- LIVE VOICE VIEW -----------------------------------
  if (view === "live-voice") {
    return (
      <VoiceCallStage
        interviewerName={session?.interviewerName || "Rexa"}
        careerFit={session?.careerFit}
        type={session?.type}
        voiceState={voiceState}
        muted={muted}
        agentSpeaking={agentSpeaking}
        callDuration={callDuration}
        voiceTurns={voiceTurns}
        onToggleMute={toggleMute}
        onEnd={endVoiceCall}
        onAbandon={abandonInterview}
      />
    );
  }

  // -------------------- LIVE TEXT VIEW ------------------------------------
  if (view === "live-text" && session) {
    const progress = Math.round(
      ((session.currentIndex - 1) / session.totalQuestions) * 100
    );
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a1f] via-[#2a2520] to-[#1a1a1f] text-white z-50 flex flex-col">
        <div className="px-6 sm:px-10 pt-6 pb-3 flex items-center justify-between gap-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#c89a2b] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-[#c89a2b]">
                Text-mode interview · {session.interviewerName}
              </p>
              <h2 className="font-bold truncate">
                {session.careerFit} · {session.type?.purpose} · {session.type?.level}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-white/70">
              Q {Math.min(session.currentIndex, session.totalQuestions)} /{" "}
              {session.totalQuestions}
            </span>
            <button
              onClick={abandonInterview}
              className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              End
            </button>
          </div>
        </div>

        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-[#c89a2b] transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 sm:py-10">
          <div className="max-w-3xl mx-auto space-y-8">
            {session.turns.map((t, i) => (
              <div key={i} className="space-y-3 opacity-80">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-[#c89a2b] mb-2">
                    Q{i + 1}
                  </p>
                  <p className="text-base">{t.question}</p>
                </div>
                <div className="bg-[#c89a2b]/10 border border-[#c89a2b]/30 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-[#c89a2b] mb-2">
                    Your answer
                  </p>
                  <p className="text-base whitespace-pre-wrap">{t.answer}</p>
                </div>
                {t.feedback && (
                  <div className="text-sm text-white/60 italic px-3">
                    Coach: {t.feedback}
                  </div>
                )}
              </div>
            ))}
            {session.current && (
              <div className="bg-white text-[#1d1d1f] rounded-3xl p-7 shadow-2xl">
                <p className="text-xs uppercase tracking-wider text-[#c89a2b] mb-2">
                  Question {session.currentIndex} of {session.totalQuestions}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">
                  {session.current}
                </h3>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-10 py-5 border-t border-white/10 bg-black/30 backdrop-blur">
          <div className="max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              placeholder="Type your answer... (Ctrl+Enter to submit)"
              disabled={busy}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-white/40 focus:outline-none focus:border-[#c89a2b] resize-none disabled:opacity-60"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-white/40">
                {answer.length} characters · Ctrl+Enter to submit
              </p>
              <button
                onClick={submitTextAnswer}
                disabled={busy || !answer.trim()}
                className="h-11 px-6 rounded-xl bg-[#c89a2b] hover:bg-[#b88a1b] disabled:opacity-50 font-semibold flex items-center gap-2"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {busy ? "Evaluating..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ HOME VIEW (picker + analytics + history) ============
  return (
    <div className="min-h-screen bg-[#f7f5f2] flex">
      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">
        <a href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full"></div>
          </div>
          <span className="text-xl font-bold">Capabl</span>
        </a>
        <div className="space-y-2 flex-1">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink href="/analyzer" icon={Brain} label="AI Analyzer" />
          <SidebarLink href="/road-map" icon={Route} label="Roadmap" />
          <SidebarLink href="/skill-gap" icon={FileSearch} label="Skill Gap" />
          <SidebarLink href="/resume" icon={FileText} label="Resume" />
          <SidebarLink href="/interview" icon={Video} label="AI Interview" active />
          <SidebarLink href="/projects" icon={FolderKanban} label="Projects" />
                    <SidebarLink href="/profile" icon={User} label="Profile" />
          <SidebarLink href="/settings" icon={Settings} label="Settings" />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 font-semibold mt-4"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      <main className="flex-1 lg:ml-[270px] p-6 sm:p-8 lg:p-12 max-w-[1400px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-2">
              AI Voice Interview
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium">
              Meet <span className="font-semibold text-[#1d1d1f]">{voiceStatus.interviewerName || "Rexa"}</span> — an AI recruiter that runs a real personalised interview using your profile, resume, projects & roadmap.
            </p>
          </div>
        </div>

        {/* Voice availability banner */}
        {!voiceStatus.available && (
          <div className="bg-[#fff8ec] border border-[#f3e3bf] rounded-2xl p-4 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#c89a2b] shrink-0 mt-0.5" />
            <div className="text-sm text-[#7a5a16]">
              <strong>Voice mode is offline.</strong> Interviews will run in text mode until you set <code className="bg-white px-1 rounded">RETELL_API_KEY</code> and <code className="bg-white px-1 rounded">RETELL_AGENT_ID</code> in <code className="bg-white px-1 rounded">backend/.env</code>. See <code className="bg-white px-1 rounded">backend/SETUP_VOICE_INTERVIEW.md</code> for the 5-minute setup.
            </div>
          </div>
        )}

        {/* Picker */}
        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7 mb-8">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-1">Configure your interview</h2>
          <p className="text-sm text-slate-500 mb-6">
            Every selection changes how {voiceStatus.interviewerName || "Rexa"} prompts and grades you.
          </p>

          {/* Part 3 — profile-based recommendation banner */}
          {recommendation && (
            <div className="bg-gradient-to-r from-[#fff3df] to-[#fff8ec] border border-[#f3e3bf] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="flex-1 text-sm text-[#7a5a16] font-medium">
                <span className="font-bold">⚡ Recommended for you</span> —{" "}
                {recommendation.reason}
              </p>
              <button
                onClick={applyRecommendation}
                className="shrink-0 h-10 px-4 rounded-xl bg-[#1d1d1f] text-white text-sm font-semibold hover:opacity-90"
              >
                Apply this config
              </button>
            </div>
          )}

          <Section title="Purpose" subtitle="What kind of interview is this?">
            <ChipGrid
              items={purposes}
              value={purpose}
              onChange={setPurpose}
              infoMap={INTERVIEW_INFO}
            />
          </Section>

          <Section title="Role flavor" subtitle="Layer in a role-specific style">
            <ChipGrid
              items={roles}
              value={role}
              onChange={setRole}
              compact
              infoMap={INTERVIEW_INFO}
            />
          </Section>

          <div className="grid md:grid-cols-3 gap-5 mb-6">
            <SmallPicker label="Stage" items={stages} value={stage} onChange={setStage} />
            <SmallPicker label="Medium" items={mediums} value={medium} onChange={setMedium} />
            <SmallPicker label="Format" items={formats} value={format} onChange={setFormat} />
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-3">Difficulty</p>
              <div className="flex gap-2">
                {levels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex-1 h-11 rounded-xl border-2 font-semibold capitalize transition-all ${
                      level === l
                        ? "border-[#c89a2b] bg-[#fff8ec] text-[#c89a2b]"
                        : "border-[#ece4d4] bg-white text-slate-600 hover:border-[#c89a2b]/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-3">Question budget</p>
              <div className="flex gap-2">
                {[4, 6, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTotalQuestions(n)}
                    className={`flex-1 h-11 rounded-xl border-2 font-semibold transition-all ${
                      totalQuestions === n
                        ? "border-[#c89a2b] bg-[#fff8ec] text-[#c89a2b]"
                        : "border-[#ece4d4] bg-white text-slate-600 hover:border-[#c89a2b]/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startInterview}
            disabled={busy}
            className="w-full h-14 rounded-2xl bg-[#1d1d1f] text-white font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : medium === "ai" || medium === "video" ? (
              <Mic className="w-6 h-6" />
            ) : (
              <PlayCircle className="w-6 h-6" />
            )}
            {busy
              ? "Starting..."
              : medium === "ai" || medium === "video"
              ? voiceStatus.available
                ? `Start voice call with ${voiceStatus.interviewerName || "Rexa"}`
                : "Start interview (text-mode fallback)"
              : "Start interview"}
          </button>
        </div>

        {/* History */}
        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-slate-500" />
            <h2 className="text-2xl font-bold text-[#1d1d1f]">Past interviews</h2>
          </div>
          {!meta?.sessions?.length ? (
            <p className="text-slate-400 text-sm">No interviews yet — configure one above.</p>
          ) : (
            <div className="space-y-3">
              {meta.sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => s.status === "finished" && openReview(s.id)}
                  className="w-full flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-[#f1ede5] hover:bg-[#fffaf0] transition-all text-left"
                >
                  <div className="flex-1 min-w-[150px]">
                    <h3 className="font-semibold text-[#1d1d1f] capitalize">
                      {s.purpose}{s.role !== "standard" ? ` · ${s.role}` : ""} · {s.level}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(s.startedAt).toLocaleString()} · {s.mode === "voice" ? "voice" : "text"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      s.status === "finished"
                        ? "bg-[#e7f7ea] text-green-700"
                        : s.status === "abandoned"
                        ? "bg-[#fff0ed] text-red-600"
                        : "bg-[#fff3df] text-[#c89a2b]"
                    }`}
                  >
                    {s.status}
                  </span>
                  {s.score != null && (
                    <span className="font-bold text-[#1d1d1f]">{s.score}/100</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Scorecard modal */}
      {view === "scorecard" && scorecard && (
        <ScorecardModal
          scorecard={scorecard}
          onClose={closeScorecard}
          onRetry={retryScoring}
          retrying={retrying}
        />
      )}

      {/* Review modal */}
      {view === "review" && reviewSession && (
        <ReviewModal
          session={reviewSession}
          onClose={() => {
            setReviewSession(null);
            setView("home");
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function Section({ title, subtitle, children }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-400 mb-3">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

function ChipGrid({ items, value, onChange, compact, infoMap }) {
  // Which card's inline explanation is expanded (Part 2). Clicking a card both
  // selects it and toggles its info box; clicking the same card again hides it.
  const [openKey, setOpenKey] = useState(null);

  const handleClick = (key) => {
    onChange(key);
    if (infoMap) setOpenKey((prev) => (prev === key ? null : key));
  };

  const openItem = openKey ? items.find((it) => it.key === openKey) : null;

  return (
    <div>
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {items.map((it) => {
          const active = value === it.key;
          return (
            <button
              key={it.key}
              onClick={() => handleClick(it.key)}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                active
                  ? "border-[#c89a2b] bg-[#fff8ec]"
                  : "border-[#ece4d4] hover:border-[#c89a2b]/40 bg-white"
              }`}
            >
              <h3 className="font-semibold text-[#1d1d1f] text-sm capitalize">
                {it.label}
              </h3>
              {it.description && (
                <p className="text-xs text-slate-500 mt-1">{it.description}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Inline explanation directly below the card row (Part 2) */}
      {infoMap && openItem && infoMap[openItem.key] && (
        <InfoBox label={openItem.label} data={infoMap[openItem.key]} />
      )}
    </div>
  );
}

function InfoBox({ label, data }) {
  return (
    <div className="mt-3 bg-[#fff8ec] border border-[#f3e3bf] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-[#c89a2b]" />
        <span className="text-sm font-bold text-[#1d1d1f] capitalize">{label}</span>
      </div>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-semibold text-[#7a5a16]">Best for:</span>{" "}
          <span className="text-slate-600">{data.bestFor}</span>
        </p>
        <p>
          <span className="font-semibold text-[#7a5a16]">Rexa will ask:</span>{" "}
          <span className="text-slate-600">{data.willAsk}</span>
        </p>
        <p>
          <span className="font-semibold text-[#7a5a16]">Recommended when:</span>{" "}
          <span className="text-slate-600">{data.recommendedWhen}</span>
        </p>
      </div>
    </div>
  );
}

function SmallPicker({ label, items, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-3">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`px-3 h-10 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
              value === it.key
                ? "border-[#c89a2b] bg-[#fff8ec] text-[#c89a2b]"
                : "border-[#ece4d4] bg-white text-slate-600 hover:border-[#c89a2b]/40"
            }`}
            title={it.description || ""}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScorecardModal({ scorecard, onClose, onRetry, retrying }) {
  // Log exactly what the backend returned so we can see the real data shape.
  useEffect(() => {
    console.log("[Scorecard] questionBreakdown:", scorecard?.questionBreakdown);
  }, [scorecard]);

  // Evaluation unavailable (e.g. Gemini 429). Surface an honest "couldn't score
  // yet" state with a retry — never a fabricated 70/100 scorecard.
  if (scorecard.status === "evaluation_unavailable") {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-[2rem] max-w-md w-full p-8 my-8 text-center">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3">
            Evaluation unavailable
          </h2>
          <p className="text-slate-600 mb-6">
            {scorecard.message ||
              "AI scoring is temporarily unavailable due to high service load. Your answers are saved — please retry in a moment."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border border-[#e8e6e1] text-[#1d1d1f] font-semibold hover:bg-[#f5f1ea] transition-all"
            >
              Close
            </button>
            <button
              onClick={() => onRetry?.(scorecard.sessionId)}
              disabled={retrying}
              className="flex-1 h-12 rounded-2xl bg-[#1d1d1f] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {retrying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Retrying…
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Retry scoring
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render every question the backend sends — no slicing. We only drop entries
  // that aren't genuine questions (e.g. the opening greeting, which has no "?").
  const questionBreakdown = (scorecard.questionBreakdown || []).filter(
    (q) => q?.question && q.question.includes("?")
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] max-w-3xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#c89a2b] mb-1">
              Interview complete
            </p>
            <h2 className="text-3xl font-bold text-[#1d1d1f]">
              Your scorecard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#c89a2b] to-[#77410e] flex items-center justify-center text-white">
            <div className="text-center">
              <h2 className="text-6xl font-bold">{scorecard.score ?? scorecard.overall ?? 0}</h2>
              <p className="text-xs opacity-80">out of 100</p>
            </div>
          </div>
        </div>

        {scorecard.summary && (
          <p className="text-center text-slate-600 mb-6">{scorecard.summary}</p>
        )}

        {scorecard.scores && (
          <div className="bg-[#faf8f4] border border-[#ece4d4] rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-[#1d1d1f] mb-3">Dimension scores</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(DIM_LABELS).map((k) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-600">{DIM_LABELS[k]}</span>
                  <span className="font-bold text-[#1d1d1f]">{scorecard.scores[k] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <ListCard title="Strengths" tone="green" items={scorecard.strengths || []} />
          <ListCard title="Areas to improve" tone="red" items={scorecard.weaknesses || []} />
        </div>

        {(scorecard.skillGaps || []).length > 0 && (
          <ListCard title="Specific skill gaps" tone="orange" items={scorecard.skillGaps} />
        )}

        {(scorecard.nextSteps || scorecard.improvementPlan || []).length > 0 && (
          <div className="mt-4">
            <ListCard
              title="Next steps before your next interview"
              tone="purple"
              items={scorecard.nextSteps || scorecard.improvementPlan}
            />
          </div>
        )}

        {questionBreakdown.length > 0 && (
          <div className="mt-4 bg-[#faf8f4] border border-[#ece4d4] rounded-2xl p-5">
            <h3 className="font-semibold text-[#1d1d1f] mb-3">
              Question-by-question
            </h3>
            <div className="space-y-3">
              {questionBreakdown.map((q, i) => (
                <div key={i} className="border-b border-[#ece4d4] last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-medium text-[#1d1d1f] flex-1">
                      Q{i + 1}. {q.question}
                    </p>
                    {q.answerQuality && (
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${qualityTone(q.answerQuality)}`}>
                        {q.answerQuality}
                      </span>
                    )}
                  </div>
                  {q.feedback && (
                    <p className="text-xs text-slate-500">{q.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {scorecard.nextAdaptiveQuestion && (
          <div className="mt-4 bg-[#f4efff] border border-purple-200 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-purple-700 mb-2">
              Predicted next question
            </p>
            <p className="text-sm text-slate-700">{scorecard.nextAdaptiveQuestion}</p>
          </div>
        )}

        {scorecard.readinessScore != null && (
          <div className="mt-4 flex items-center justify-between bg-[#fff8ec] border border-[#f3e3bf] rounded-2xl p-4">
            <div>
              <span className="text-sm text-[#7a5a16] font-semibold">
                Updated interview readiness
              </span>
              {scorecard.readinessShift != null && scorecard.readinessShift !== 0 && (
                <span
                  className={`ml-2 text-sm font-bold ${
                    scorecard.readinessShift > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {scorecard.readinessShift > 0 ? "+" : ""}
                  {scorecard.readinessShift} from this interview
                </span>
              )}
            </div>
            <span className="text-2xl font-bold text-[#c89a2b]">
              {scorecard.readinessScore}/100
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl bg-[#1d1d1f] text-white font-semibold mt-6"
        >
          Back to interviews
        </button>
      </div>
    </div>
  );
}

function qualityTone(quality) {
  switch (String(quality).toLowerCase()) {
    case "excellent":
      return "bg-[#e7f7ea] text-green-700";
    case "good":
      return "bg-[#eaf3ff] text-blue-700";
    case "average":
      return "bg-[#fff3df] text-orange-700";
    case "weak":
      return "bg-[#fff0ed] text-red-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function ListCard({ title, tone, items }) {
  const toneMap = {
    green: "bg-[#f4fbf6] border-green-200 text-green-700",
    red: "bg-[#fff0ed] border-red-200 text-red-700",
    orange: "bg-[#fff3df] border-orange-200 text-orange-700",
    purple: "bg-[#f4efff] border-purple-200 text-purple-700",
  };
  return (
    <div className={`border rounded-2xl p-4 ${toneMap[tone]}`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}

function ReviewModal({ session, onClose }) {
  const turns = useMemo(() => {
    if (Array.isArray(session?.turns) && session.turns.length) {
      return session.turns.filter((t) => t.question && /\?/.test(t.question));
    }
    return (session?.transcript || [])
      .filter((t) => t.answer)
      .filter((t) => t.question && /\?/.test(t.question))
      .map((t) => ({ question: t.question, answer: t.answer, feedback: t.feedback }));
  }, [session]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] max-w-3xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#c89a2b] mb-1">
              Past interview · {session.purpose} · {session.level}
            </p>
            <h2 className="text-2xl font-bold text-[#1d1d1f]">
              Score: {session.score ?? "—"}/100
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {session.summary && <p className="text-slate-600 mb-5">{session.summary}</p>}

        <div className="space-y-4 mb-6">
          {turns.map((t, i) => (
            <div key={i} className="border border-[#f1ede5] rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-xs uppercase tracking-wider text-[#c89a2b]">
                  Q{i + 1}
                </p>
                {t.answerQuality && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${qualityTone(t.answerQuality)}`}>
                    {t.answerQuality}
                  </span>
                )}
              </div>
              <p className="font-semibold text-[#1d1d1f] mb-2">{t.question}</p>
              <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">{t.answer}</p>
              {t.feedback && (
                <p className="text-xs text-slate-500 italic">Coach: {t.feedback}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl bg-[#1d1d1f] text-white font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// VOICE CALL STAGE
// ----------------------------------------------------------------------------
function VoiceCallStage({
  interviewerName,
  careerFit,
  type,
  voiceState,
  muted,
  agentSpeaking,
  callDuration,
  voiceTurns,
  onToggleMute,
  onEnd,
  onAbandon,
}) {
  const transcriptEndRef = useRef(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [voiceTurns]);

  const mm = String(Math.floor(callDuration / 60)).padStart(2, "0");
  const ss = String(callDuration % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f0f12] via-[#1a1216] to-[#0f0f12] text-white z-50 flex flex-col">
      <div className="px-6 sm:px-10 pt-6 pb-3 flex items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${agentSpeaking ? "bg-[#c89a2b] animate-pulse" : "bg-white/10"}`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-[#c89a2b]">
              Voice call · {interviewerName}
            </p>
            <h2 className="font-bold truncate">
              {careerFit} · {type?.purpose} · {type?.level}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-mono px-3 py-1 rounded-full ${voiceState === "live" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/70"}`}>
            {voiceState === "connecting" ? "Connecting…" : voiceState === "live" ? `LIVE  ${mm}:${ss}` : "Ending…"}
          </span>
          <button
            onClick={onAbandon}
            className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Abandon
          </button>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-[1fr,1.2fr] overflow-hidden">
        {/* Left: interviewer avatar + status */}
        <div className="flex flex-col items-center justify-center p-8 border-r border-white/10">
          <div className={`w-56 h-56 rounded-full bg-gradient-to-br from-[#c89a2b] to-[#77410e] flex items-center justify-center text-white shadow-2xl transition-all ${agentSpeaking ? "scale-110" : "scale-100"}`}>
            <div className="text-center">
              <h2 className="text-6xl font-bold">{interviewerName?.[0] || "R"}</h2>
              <p className="text-sm opacity-80 mt-1">{interviewerName}</p>
            </div>
          </div>
          <p className="mt-6 text-lg text-white/80">
            {voiceState === "connecting" && "Connecting to your interviewer…"}
            {voiceState === "live" && (agentSpeaking ? `${interviewerName} is speaking…` : "Your turn — speak naturally.")}
            {voiceState === "ended" && "Wrapping up — generating your scorecard…"}
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onToggleMute}
              disabled={voiceState !== "live"}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                muted ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"
              } disabled:opacity-50`}
            >
              {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button
              onClick={onEnd}
              disabled={voiceState === "ended"}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center disabled:opacity-50"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right: live transcript */}
        <div className="flex flex-col">
          <div className="px-6 py-3 border-b border-white/10 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#c89a2b]" />
            <span className="text-sm uppercase tracking-wider text-white/60">
              Live transcript
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {voiceTurns.length === 0 ? (
              <p className="text-white/40 text-sm italic">
                Transcript will appear here once {interviewerName} starts speaking.
              </p>
            ) : (
              voiceTurns.map((t, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    t.role === "ai"
                      ? "bg-white/5 border border-white/10 text-white"
                      : "bg-[#c89a2b]/15 border border-[#c89a2b]/30 text-white ml-auto"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                    {t.role === "ai" ? interviewerName : "You"}
                  </p>
                  {t.text}
                </div>
              ))
            )}
            <div ref={transcriptEndRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
