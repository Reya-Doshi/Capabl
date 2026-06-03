import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  LayoutDashboard,
  Brain,
  Route,
  FileSearch,
  FileText,
  Video,
  FolderKanban,
  Bookmark,
  User,
  Settings,
  Bell,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  TriangleAlert,
  Target,
  ArrowRight,
  Rocket,
  Star,
  Loader2,
  Circle,
  ExternalLink,
  Info,
} from "lucide-react";

import logout from "../utils/logout";
import { API_BASE_URL } from "../config/api";

const API = API_BASE_URL;

const SidebarLink = ({ href, icon: Icon, label, active }) => (
  <a
    href={href}
    className={
      active
        ? "flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold shadow-lg"
        : "flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
    }
  >
    <Icon className={active ? "w-5 h-5 text-white" : "w-5 h-5"} />
    {label}
  </a>
);

// Readiness band → colour for the progress bar and level chip.
function readinessTone(readiness) {
  if (readiness >= 85) return { bar: "bg-green-500", chip: "bg-[#e7f7ea] text-green-700" };
  if (readiness >= 70) return { bar: "bg-emerald-400", chip: "bg-[#e7f7ea] text-emerald-700" };
  if (readiness >= 45) return { bar: "bg-[#c89a2b]", chip: "bg-[#fff3df] text-[#a47200]" };
  if (readiness >= 20) return { bar: "bg-orange-400", chip: "bg-[#fff0ed] text-orange-600" };
  return { bar: "bg-red-400", chip: "bg-[#fff0ed] text-red-600" };
}

function confidenceTone(confidence) {
  if (confidence === "High") return "bg-[#e7f7ea] text-green-700";
  if (confidence === "Medium") return "bg-[#fff3df] text-[#a47200]";
  return "bg-[#fff0ed] text-red-600";
}

// The four weighted evidence sources, shown verbatim for traceability.
const EVIDENCE_SOURCES = [
  { key: "resume", label: "Resume", weight: "35%" },
  { key: "project", label: "Projects", weight: "25%" },
  { key: "github", label: "GitHub", weight: "20%" },
  { key: "roadmap", label: "Roadmap", weight: "20%" },
];

// A skill card surfaces only learner-facing language and is expandable into a
// full, evidence-by-evidence explanation of exactly how its readiness was
// produced — nothing is hidden.
const SkillCard = ({ skill }) => {
  const [open, setOpen] = useState(false);
  const tone = readinessTone(skill.readiness);
  const found = skill.evidenceFound || [];
  const missing = skill.evidenceMissing || [];
  const missingConcepts = skill.missingConcepts || [];
  const recommendations = skill.recommendations || [];
  const scores = skill.evidenceScores || {};

  return (
    <div className="border border-[#ece8df] rounded-[1.5rem] p-5 bg-white hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-[#1d1d1f] capitalize">{skill.name}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${confidenceTone(skill.confidence)}`}>
            {skill.confidence}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${tone.chip}`}>
            {skill.readiness}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-3">
        <div>
          <p className="text-xs text-slate-400 font-medium">Current</p>
          <p className="text-sm font-semibold text-[#1d1d1f]">{skill.currentLevel}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
        <div>
          <p className="text-xs text-slate-400 font-medium">Target</p>
          <p className="text-sm font-semibold text-[#1d1d1f]">{skill.targetLevel}</p>
        </div>
        {typeof skill.weight === "number" && (
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-400 font-medium">Role weight</p>
            <p className="text-sm font-semibold text-[#1d1d1f]">{Math.round(skill.weight)}%</p>
          </div>
        )}
      </div>

      <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-4">
        <div
          className={`h-full rounded-full ${tone.bar} transition-all duration-1000 ease-out`}
          style={{ width: `${skill.readiness}%` }}
        />
      </div>

      {/* Evidence found / missing — traceable, with checks and crosses */}
      <div className="flex flex-wrap gap-2 mb-3">
        {found.map((ev) => (
          <span
            key={`f-${ev}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f1ea] text-[#1d1d1f] text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            {ev}
          </span>
        ))}
        {missing.map((ev) => (
          <span
            key={`m-${ev}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#faf8f4] text-slate-400 text-xs font-semibold"
          >
            <XCircle className="w-3.5 h-3.5 text-slate-300" />
            {ev}
          </span>
        ))}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c89a2b] hover:underline"
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {open ? "Hide details" : "Why this score?"}
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-[#f2f2f2] space-y-4">
          {/* Reason — generated from actual evidence */}
          <p className="text-sm text-slate-600 leading-6">{skill.reason}</p>

          {/* Evidence traceability — the four sources and their raw 0-100 scores */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Evidence scores (weighted into readiness)
            </p>
            <div className="space-y-2">
              {EVIDENCE_SOURCES.map((src) => {
                const value = scores[src.key] ?? 0;
                return (
                  <div key={src.key} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-slate-500 shrink-0">
                      {src.label}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#ececec] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${value > 0 ? "bg-[#1d1d1f]" : "bg-transparent"}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="w-14 text-right text-xs font-semibold text-[#1d1d1f]">
                      {value} <span className="text-slate-400 font-normal">×{src.weight}</span>
                    </span>
                  </div>
                );
              })}
            </div>
            {skill.profileBaselineApplied && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Self-reported in profile — readiness floored at a baseline until
                verified by other evidence.
              </p>
            )}
          </div>

          {missingConcepts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Missing concepts
              </p>
              <ul className="space-y-1">
                {missingConcepts.map((concept) => (
                  <li
                    key={concept}
                    className="flex items-center gap-2 text-sm text-slate-600 capitalize"
                  >
                    <Circle className="w-1.5 h-1.5 fill-[#c89a2b] text-[#c89a2b]" />
                    {concept}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.length > 0 && skill.readiness < 85 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Learn it</p>
              <div className="flex flex-col gap-1.5">
                {recommendations.map((rec) => (
                  <a
                    key={rec.url}
                    href={rec.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{rec.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// A leader-dot row used throughout the "Why this score?" panel.
const LeaderRow = ({ label, value, positive }) => (
  <div className="flex items-baseline gap-2">
    <span className="capitalize text-slate-600 truncate">{label}</span>
    <span className="flex-1 border-b border-dotted border-slate-300 translate-y-[-3px]" />
    <span
      className={`font-semibold tabular-nums ${
        positive === false ? "text-red-500" : "text-green-600"
      }`}
    >
      {positive === false ? "−" : "+"}
      {Math.abs(value)}
    </span>
  </div>
);

// The full, auditable breakdown of the overall match score.
const WhyScorePanel = ({ explanation, matchScore }) => {
  if (!explanation) return null;
  const contributions = explanation.contributions || [];
  const gaps = explanation.largestGaps || [];
  const ev = explanation.evidenceSummary || {};

  return (
    <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 sm:p-7 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-1">
        <Info className="w-5 h-5 text-[#c89a2b]" />
        <h2 className="text-2xl font-bold text-[#1d1d1f]">
          Why {matchScore}%?
        </h2>
      </div>
      <p className="text-slate-500 mb-6">{explanation.formula}</p>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">
            Skill contributions
          </h3>
          <div className="space-y-2 text-sm">
            {contributions.map((c) => (
              <LeaderRow key={c.name} label={c.name} value={c.points} positive />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">Largest gaps</h3>
          <div className="space-y-2 text-sm">
            {gaps.length === 0 ? (
              <p className="text-slate-400">No gaps — every skill is covered.</p>
            ) : (
              gaps.map((g) => (
                <LeaderRow key={g.name} label={g.name} value={g.lostPoints} positive={false} />
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">
            Evidence summary
          </h3>
          <div className="space-y-2 text-sm">
            <LeaderRow label="Resume evidence" value={ev.resume ?? 0} positive />
            <LeaderRow label="Project evidence" value={ev.project ?? 0} positive />
            <LeaderRow label="GitHub evidence" value={ev.github ?? 0} positive />
            <LeaderRow label="Roadmap progress" value={ev.roadmap ?? 0} positive />
            {(ev.profile ?? 0) > 0 && (
              <LeaderRow label="Profile (self-reported)" value={ev.profile} positive />
            )}
            <div className="flex items-baseline gap-2 pt-2 mt-2 border-t border-[#f2f2f2]">
              <span className="font-bold text-[#1d1d1f]">Final weighted score</span>
              <span className="flex-1" />
              <span className="font-bold text-[#1d1d1f] tabular-nums">{matchScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SkillGap() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [showWhy, setShowWhy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/api/analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(data.user);
        setAnalysis(data.analysis);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Per-skill cards come straight from the backend's `skillProficiency` array —
  // every number is mathematically derived from real evidence (resume parse,
  // projects, GitHub, roadmap completion), never synthetic.
  const skills = useMemo(
    () => (analysis ? analysis.skillProficiency || [] : []),
    [analysis]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b89968]" />
      </div>
    );
  }

  const matchScore = analysis?.matchScore ?? 0;
  const haveCount = analysis?.skillStrengths?.length ?? 0;
  const missingCount = analysis?.skillGaps?.length ?? 0;
  const totalRequired = analysis?.requiredSkills?.length ?? 0;
  const priorityGaps = (analysis?.skillGaps || []).slice(0, 6);
  const recommended =
    analysis?.aiSuggestions?.length > 0
      ? analysis.aiSuggestions.slice(0, 4).map((s) => ({
          title: s.title,
          subtitle: s.description,
        }))
      : (analysis?.recommendedSkills || []).slice(0, 4).map((s) => ({
          title: `Master ${s}`,
          subtitle: `Recommended for ${analysis?.careerFit}`,
        }));

  // Learning-path donut numbers come from the (sequentially-gated) roadmap.
  const stages = analysis?.roadmapStages || [];
  const allSkills = stages.flatMap((s) => s.skills || []);
  const completed = allSkills.filter((s) => s.known).length;
  const inProgressStage = stages.find((s) => s.status === "active");
  const inProgress = inProgressStage
    ? (inProgressStage.skills || []).filter((s) => !s.known).length
    : 0;
  const yetToStart = allSkills.length - completed - inProgress;
  const overallProgress = allSkills.length
    ? Math.round((completed / allSkills.length) * 100)
    : 0;

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
          <SidebarLink href="/skill-gap" icon={FileSearch} label="Skill Gap" active />
          <SidebarLink href="/resume" icon={FileText} label="Resume" />
          <SidebarLink href="/interview" icon={Video} label="Mock Interview" />
          <SidebarLink href="/projects" icon={FolderKanban} label="Projects" />
          <SidebarLink href="/recommendations" icon={Bookmark} label="Recommendations" />
          <SidebarLink href="/profile" icon={User} label="Profile" />
          <SidebarLink href="/settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      <main className="flex-1 lg:ml-[270px] p-6 sm:p-8 lg:p-12 max-w-[1400px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-2">
              Skill Gap
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium">
              How ready you are for {analysis?.careerFit || "your target role"},
              skill by skill — with the math behind every score.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center hover:shadow-lg transition-all">
              <Bell className="w-5 h-5 text-[#1d1d1f]" />
            </button>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#ece8df]">
              <div className="w-10 h-10 rounded-full bg-[#77410e] flex items-center justify-center text-white font-bold">
                {(userInfo?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-[#1d1d1f]">{userInfo?.name}</h3>
                <p className="text-sm text-slate-500">Student</p>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Overall Match Score — clickable to reveal the full breakdown */}
          <button
            onClick={() => setShowWhy((v) => !v)}
            className="text-left bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#c89a2b]/30"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#f5edff] flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-purple-500" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#c89a2b]">
                {showWhy ? "Hide" : "Why?"}
                {showWhy ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Overall Match Score
            </h3>
            <h2 className="text-4xl font-bold text-purple-500 mb-4">{matchScore}%</h2>
            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${matchScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500">
              Weighted average of every skill — tap to see how.
            </p>
          </button>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-xl transition-all">
            <CheckCircle2 className="w-10 h-10 text-green-500 mb-5" />
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Skills You Have
            </h3>
            <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">{haveCount}</h2>
            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: totalRequired
                    ? `${Math.round((haveCount / totalRequired) * 100)}%`
                    : "0%",
                }}
              ></div>
            </div>
            <p className="text-sm text-green-600 font-medium">
              {totalRequired ? `${haveCount} of ${totalRequired} required` : "—"}
            </p>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-xl transition-all">
            <TriangleAlert className="w-10 h-10 text-orange-400 mb-5" />
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Skills Missing
            </h3>
            <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">{missingCount}</h2>
            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: totalRequired
                    ? `${Math.round((missingCount / totalRequired) * 100)}%`
                    : "0%",
                }}
              ></div>
            </div>
            <p className="text-sm text-orange-500 font-medium">
              {missingCount > 0 ? "Need improvement" : "All covered"}
            </p>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-xl transition-all">
            <Target className="w-10 h-10 text-blue-500 mb-5" />
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Top Priority Gaps
            </h3>
            <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">
              {priorityGaps.length}
            </h2>
            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: missingCount
                    ? `${Math.round((priorityGaps.length / missingCount) * 100)}%`
                    : "0%",
                }}
              ></div>
            </div>
            <p className="text-sm text-slate-500">Focus areas</p>
          </div>
        </div>

        {showWhy && (
          <WhyScorePanel
            explanation={analysis?.scoreExplanation}
            matchScore={matchScore}
          />
        )}

        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 sm:p-7 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-1">
            Skill Readiness
          </h2>
          <p className="text-slate-500 mb-6">
            Each readiness = 0.35·resume + 0.25·projects + 0.20·GitHub +
            0.20·roadmap. Tap a card to see the evidence behind it.
          </p>

          {skills.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No required skills detected — set your career goal in your profile,
              then re-run the analyzer.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {skills.map((skill) => (
                <SkillCard key={skill.name} skill={skill} />
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr,1fr] gap-6 mb-8">
          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
              Top Priority Gaps
            </h2>

            {priorityGaps.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No priority gaps — you're matching every required skill.
              </p>
            ) : (
              <div className="space-y-4">
                {priorityGaps.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#faf8f4] transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#f5f1ea] flex items-center justify-center font-semibold text-[#c89a2b] shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#1d1d1f] capitalize truncate">
                          {item}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Required for {analysis?.careerFit}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#fff3df] text-[#c89a2b] text-sm font-medium shrink-0">
                      {index < 2 ? "High" : index < 4 ? "Medium" : "Low"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <a
              href="/road-map"
              className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-7 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] transition-all"
            >
              View Learning Roadmap
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-[#c89a2b]" />
              <h2 className="text-2xl font-bold text-[#1d1d1f]">
                Recommended for You
              </h2>
            </div>

            {recommended.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No recommendations yet — upload your resume or fill in your
                profile to get personalized suggestions.
              </p>
            ) : (
              <div className="space-y-4">
                {recommended.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 border border-[#f2f2f2] rounded-2xl p-4 hover:-translate-y-1 hover:shadow-lg hover:border-[#e7dcc7] transition-all bg-white"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#1d1d1f] mb-1 capitalize">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                    <a
                      href="/road-map"
                      className="px-5 h-10 rounded-xl bg-[#1d1d1f] text-white text-sm font-medium hover:opacity-90 transition-all shadow-md shrink-0 flex items-center"
                    >
                      Start
                    </a>
                  </div>
                ))}
              </div>
            )}

            <a
              href="/road-map"
              className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-7 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] transition-all"
            >
              View Learning Roadmap
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
            Learning Path Progress
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center justify-center">
              <div
                className="w-52 h-52 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(#22c55e 0% ${overallProgress}%, #fb923c ${overallProgress}% ${
                    overallProgress +
                    (allSkills.length
                      ? Math.round((inProgress / allSkills.length) * 100)
                      : 0)
                  }%, #f87171 ${
                    overallProgress +
                    (allSkills.length
                      ? Math.round((inProgress / allSkills.length) * 100)
                      : 0)
                  }% 100%)`,
                }}
              >
                <div className="w-[170px] h-[170px] rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-5xl font-bold text-[#1d1d1f]">
                      {overallProgress}%
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">Overall Progress</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-slate-500">Completed</p>
                </div>
                <p className="font-semibold text-[#1d1d1f]">{completed} Skills</p>
              </div>

              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <p className="text-sm text-slate-500">In Progress</p>
                </div>
                <p className="font-semibold text-[#1d1d1f]">{inProgress} Skills</p>
              </div>

              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <p className="text-sm text-slate-500">Yet to Start</p>
                </div>
                <p className="font-semibold text-[#1d1d1f]">{yetToStart} Skills</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f8f1e5] border border-[#ece3d3] rounded-[2rem] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-xl transition-all">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0">
              <Rocket className="w-7 h-7 text-[#c89a2b]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#1d1d1f] mb-1">
                Keep learning, keep growing!
              </h3>
              <p className="text-slate-500">
                Bridging today's gaps for tomorrow's success.
              </p>
            </div>
          </div>
          <a
            href="/road-map"
            className="h-12 px-7 bg-[#1d1d1f] text-white rounded-xl flex items-center gap-2 font-semibold shadow-md hover:shadow-xl whitespace-nowrap"
          >
            Explore Roadmap
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
