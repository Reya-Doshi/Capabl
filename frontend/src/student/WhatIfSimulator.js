import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { TrendingUp, Loader2, Target, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { apiUrl } from "../config/api";

const SOURCE_LABELS = {
  resume: "Resume",
  interview: "Interview",
  projects: "Projects",
  certs: "Certs",
  roadmap: "Roadmap",
};

const SOURCE_UNLOCK = {
  interview: 15,
  projects: 10,
  resume: 8,
  certs: 5,
  roadmap: 3,
};

// Impact label from role-importance weight.
const impactLabel = (weight) => (Number(weight) >= 10 ? "High impact" : "Medium impact");

export default function WhatIfSimulator({ targetRole, skills, initialScore }) {
  const [toggledSkills, setToggledSkills] = useState(new Set());
  const [simulationData, setSimulationData] = useState(null);
  const [activeReasoning, setActiveReasoning] = useState(null);
  const [isCommitted, setIsCommitted] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Candidate skills to toggle: every required skill for the role, sorted by
  // weight (highest impact first). No cap — the simulator reflects the full
  // role, so a user never sees a fixed 8-skill list regardless of their goal.
  const candidateSkills = useMemo(() => {
    const list = Array.isArray(skills) ? skills : [];
    return [...list]
      .filter((s) => s?.name)
      .sort((a, b) => (b?.weight ?? 0) - (a?.weight ?? 0));
  }, [skills]);

  const baseScore = simulationData?.currentScore ?? initialScore ?? 0;
  const projectedScore = simulationData?.projectedScore ?? baseScore;
  const delta = simulationData?.delta ?? 0;
  const confidenceBand = simulationData?.confidenceBand ?? 15;
  const dataCompleteness = simulationData?.dataCompleteness ?? {};

  const runSimulation = async (skillSet) => {
    try {
      setError(null);
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        apiUrl("/api/whatif/simulate"),
        { targetRole, skillsToComplete: Array.from(skillSet) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSimulationData(data);
    } catch (e) {
      setError("Couldn't update simulation. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch (empty toggles) to populate base score + data completeness.
  useEffect(() => {
    runSimulation(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced re-simulation on toggle changes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSimulation(toggledSkills);
    }, 400);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggledSkills]);

  const toggleSkill = (name) => {
    setActiveReasoning(name);
    setToggledSkills((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const reasoningFor = (name) =>
    simulationData?.skillReasonings?.find(
      (r) => r?.skill?.toLowerCase() === name?.toLowerCase()
    );

  const commitFocus = async () => {
    try {
      setError(null);
      setPlanLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        apiUrl("/api/goals/commit"),
        {
          targetRole,
          skillsToFocus: Array.from(toggledSkills),
          weekStartDate: new Date().toISOString().slice(0, 10),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWeeklyPlan(data);
      setIsCommitted(true);
    } catch (e) {
      setError("Couldn't build your weekly plan. Try again.");
    } finally {
      setPlanLoading(false);
    }
  };

  const restoreSnapshot = (snap) => {
    const names = (snap?.skillsToggled || []).map((s) => s?.skill).filter(Boolean);
    setToggledSkills(new Set(names));
  };

  const activeReason = activeReasoning ? reasoningFor(activeReasoning) : null;

  return (
    <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-5 sm:p-7">
      {/* 1. Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e8f8ef] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#1d1d1f]">What-if Simulator</h2>
            <p className="text-sm text-slate-500 truncate">{targetRole || "Your target role"}</p>
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <p className="text-xs font-semibold text-slate-500 mb-0.5">Role Match Score</p>
          <div className="flex items-center gap-2 justify-start sm:justify-end">
            <span className="text-4xl font-bold text-green-600">{projectedScore}%</span>
            {delta > 0 && (
              <span className="px-2 py-1 rounded-full bg-[#e8f8ef] text-green-700 text-sm font-semibold transition-opacity">
                +{delta}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ± {confidenceBand} — role-match readiness derived from skill evidence
          </p>
        </div>
      </div>

      {/* 2. Data completeness pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.keys(SOURCE_LABELS).map((key) => {
          const connected = !!dataCompleteness?.[key];
          return connected ? (
            <span
              key={key}
              className="px-3 py-1.5 rounded-full bg-[#e8f8ef] text-green-700 text-xs font-medium"
            >
              {SOURCE_LABELS[key]}
            </span>
          ) : (
            <span
              key={key}
              className="px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-slate-400 text-xs font-medium"
            >
              + {SOURCE_LABELS[key]} to unlock +{SOURCE_UNLOCK[key]}%
            </span>
          );
        })}
      </div>

      {/* 3. Animated progress bar */}
      <div className="w-full h-3 rounded-full bg-[#f5f1ea] overflow-hidden mb-2">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, projectedScore))}%` }}
        />
      </div>

      {/* 4. Instruction */}
      <p className="text-sm text-slate-500 mb-5 flex items-center gap-2">
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b89968]" />}
        Toggle skills you plan to complete — see your role-match score update
      </p>

      {/* 5. Skills grid */}
      {candidateSkills.length ? (
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {candidateSkills.map((s) => {
            const toggled = toggledSkills.has(s.name);
            const evidence = Math.max(0, Math.min(100, s?.readiness ?? 0));
            return (
              <button
                key={s.name}
                onClick={() => toggleSkill(s.name)}
                className={
                  toggled
                    ? "text-left border-2 border-green-500 bg-[#f0fbf5] rounded-2xl p-4 transition-all"
                    : "text-left border border-[#e8e6e1] rounded-2xl p-4 hover:border-[#b89968] transition-all"
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#1d1d1f] capitalize">{s.name}</span>
                  <span
                    className={
                      Number(s?.weight) >= 10
                        ? "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#fff2e4] text-orange-600"
                        : "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f5f1ea] text-slate-500"
                    }
                  >
                    {impactLabel(s?.weight)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f5f1ea] overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${toggled ? 100 : evidence}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {toggled ? "will complete" : "tap to add"}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-400 text-sm mb-5">
          No skills available to simulate yet. Run your AI analysis first.
        </p>
      )}

      {/* 6. Reasoning box */}
      <div className="border-l-4 border-green-500 bg-[#f7f5f2] rounded-r-2xl px-4 py-3 mb-5">
        {activeReason ? (
          <p className="text-sm text-[#1d1d1f]">
            <span className="font-semibold capitalize">Why {activeReasoning}: </span>
            {activeReason.reasoning}
            {activeReason.gainIfCompleted > 0 && (
              <span className="text-green-700 font-semibold">
                {"  ·  "}+{activeReason.gainIfCompleted}% if completed
              </span>
            )}
          </p>
        ) : (
          <p className="text-sm text-slate-400">Click a skill to see why it matters</p>
        )}
      </div>

      {/* 7. Simulation history strip */}
      {simulationData?.simulationHistory?.length ? (
        <div className="flex flex-wrap gap-2 mb-5">
          {simulationData.simulationHistory.map((snap, i) => {
            const names = (snap?.skillsToggled || []).map((s) => s?.skill).filter(Boolean);
            return (
              <button
                key={i}
                onClick={() => restoreSnapshot(snap)}
                className="px-3 py-1.5 rounded-full bg-[#f5f1ea] hover:bg-[#ece6db] text-xs font-medium text-[#1d1d1f] transition-all"
                title="Restore this simulation"
              >
                {names.join(" + ") || "—"} (+{snap?.delta ?? 0}%) → {snap?.projectedScore ?? 0}%
              </button>
            );
          })}
        </div>
      ) : null}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* 8. Commit button / weekly plan */}
      {!isCommitted ? (
        <button
          onClick={commitFocus}
          disabled={toggledSkills.size === 0 || planLoading}
          className={
            toggledSkills.size === 0 || planLoading
              ? "w-full h-12 rounded-2xl bg-slate-200 text-slate-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              : "w-full h-12 rounded-2xl bg-[#1d1d1f] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          }
        >
          {planLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Building your 7-day plan...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" /> Set as my focus this week
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <WeeklyPlanCard plan={weeklyPlan} />
          {/* Stay interactive after a plan is generated — let the user re-toggle
              skills and build a fresh plan without reloading the page. */}
          <button
            onClick={() => {
              setIsCommitted(false);
              setWeeklyPlan(null);
            }}
            className="w-full h-12 rounded-2xl border border-[#e8e6e1] text-[#1d1d1f] font-semibold flex items-center justify-center gap-2 hover:bg-[#f5f1ea] transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Adjust skills &amp; generate a new plan
          </button>
        </div>
      )}
    </div>
  );
}

function WeeklyPlanCard({ plan }) {
  if (!plan) return null;
  const resources = Array.isArray(plan?.resources) ? plan.resources : [];
  return (
    <div className="border border-[#e8e6e1] rounded-2xl p-4 sm:p-5">
      <div className="bg-[#e8f8ef] rounded-xl px-4 py-3 mb-4">
        <div className="flex items-start gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
          <span className="font-semibold text-[#1d1d1f]">{plan?.weekGoal}</span>
        </div>
        <p className="text-sm text-green-700 font-medium">
          Projected score by Sunday: {(plan?.projectedScoreByWeekend ?? 0)}
          {plan?.expectedGain ? ` (+${plan.expectedGain})` : ""}
        </p>
      </div>

      {/* 7-day plan */}
      <div className="space-y-2">
        {(plan?.days || []).map((d, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 border border-[#e8e6e1] rounded-xl px-4 py-2.5"
          >
            <span className="w-20 text-sm font-semibold text-[#1d1d1f] shrink-0">{d?.day}</span>
            <span className="flex-1 text-sm text-slate-600">{d?.task}</span>
            <div className="flex items-center gap-2 shrink-0">
              {d?.resource && (
                <span className="text-xs text-[#b89968] font-medium">{d.resource}</span>
              )}
              {d?.duration && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f1ea] text-slate-500">
                  {d.duration}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Per-skill learning links */}
      {resources.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-[#1d1d1f] mb-3">Resources to learn</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {resources.map((r, i) => (
              <div key={i} className="border border-[#e8e6e1] rounded-xl p-3">
                <p className="text-sm font-semibold text-[#1d1d1f] capitalize mb-2">{r?.skill}</p>
                <div className="space-y-1.5">
                  {(r?.links || []).map((link, j) => (
                    <a
                      key={j}
                      href={link?.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{link?.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
