import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
  TrendingUp,
  Clock3,
  Flag,
  BriefcaseBusiness,
  Check,
  PlayCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
  LogOut,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
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

const sourceBadge = (source) => {
  if (source === "resume")
    return { label: "from resume", className: "bg-[#e7f7ea] text-green-700" };
  if (source === "profile")
    return { label: "from profile", className: "bg-[#edf3ff] text-blue-600" };
  if (source === "manual")
    return { label: "marked done", className: "bg-[#f4efff] text-purple-600" };
  return null;
};

export default function RoadMap() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [expanded, setExpanded] = useState({});

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAnalysis = useCallback(async ({ keepExpansion = true } = {}) => {
    try {
      const { data } = await axios.get(`${API}/api/analysis`, {
        headers: authHeaders(),
      });
      setUserInfo(data.user);
      setAnalysis(data.analysis);
      if (!keepExpansion) setExpanded({});
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis({ keepExpansion: false });
  }, [fetchAnalysis]);

  // Sequential gating is enforced server-side; we still guard the click here
  // so locked-stage rows can't fire requests.
  const toggleSkill = async (stage, skillName, currentlyKnown) => {
    if (stage.status === "locked") {
      toast.error("Finish previous stage first");
      return;
    }
    const key = `skill::${skillName}`;
    setSavingKey(key);
    try {
      await axios.put(
        `${API}/api/progress/skill`,
        { skillName, completed: !currentlyKnown },
        { headers: authHeaders() }
      );
      await fetchAnalysis();
    } catch (error) {
      console.error(error);
      toast.error("Could not save progress");
    } finally {
      setSavingKey(null);
    }
  };

  const toggleWeeklyTask = async (week, taskKey, currentlyDone) => {
    const key = `task::${week}::${taskKey}`;
    setSavingKey(key);
    try {
      await axios.put(
        `${API}/api/progress/task`,
        { week, taskKey, completed: !currentlyDone },
        { headers: authHeaders() }
      );
      await fetchAnalysis();
    } catch (error) {
      console.error(error);
      toast.error("Could not save task");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b89968]" />
      </div>
    );
  }

  const stages = analysis?.roadmapStages || [];
  const weeks = analysis?.roadmap || [];

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const overallProgress = stages.length
    ? Math.round(
        stages.reduce((acc, s) => acc + (s.progress || 0), 0) / stages.length
      )
    : 0;

  const activeStageIndex = stages.findIndex((s) => s.status === "active");
  const currentStageNumber =
    activeStageIndex >= 0 ? activeStageIndex + 1 : stages.length;

  const incompleteWeeks = weeks.filter((w) =>
    (w.tasks || []).some((t) => !t.done)
  ).length;
  const estimatedMonths = (incompleteWeeks / 4).toFixed(1);

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
          <SidebarLink href="/road-map" icon={Route} label="Roadmap" active />
          <SidebarLink href="/skill-gap" icon={FileSearch} label="Skill Gap" />
          <SidebarLink href="/resume" icon={FileText} label="Resume" />
          <SidebarLink href="/interview" icon={Video} label="Mock Interview" />
          <SidebarLink href="/projects" icon={FolderKanban} label="Projects" />
          <SidebarLink href="/recommendations" icon={Bookmark} label="Recommendations" />
          <SidebarLink href="/profile" icon={User} label="Profile" />
          <SidebarLink href="/settings" icon={Settings} label="Settings" />
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-semibold mt-4"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      <main className="flex-1 lg:ml-[270px] p-6 sm:p-8 lg:p-12 max-w-[1400px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-2">
              Your Personalized Roadmap
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium">
              Generated from your skills, resume, and career goal:{" "}
              <span className="font-semibold text-[#1d1d1f]">
                {analysis?.careerFit}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#77410e] flex items-center justify-center text-white font-bold text-lg">
              {(userInfo?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f]">{userInfo?.name}</h3>
              <p className="text-sm text-slate-500">Student</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1d1d1f] text-sm">
                Overall Progress
              </h3>
              <div className="w-10 h-10 rounded-2xl bg-[#f8f1e5] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#c89a2b]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#c89a2b] mb-3">
              {overallProgress}%
            </h2>
            <div className="w-full h-3 rounded-full bg-[#ece6dc] overflow-hidden mb-2">
              <div
                className="h-full bg-[#c89a2b] rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500">
              {completedCount} of {stages.length} stages complete
            </p>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1d1d1f] text-sm">
                Remaining Time
              </h3>
              <div className="w-10 h-10 rounded-2xl bg-[#f8f1e5] flex items-center justify-center">
                <Clock3 className="w-5 h-5 text-[#c89a2b]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-2">
              {incompleteWeeks > 0 ? `${estimatedMonths} mo` : "Done"}
            </h2>
            <p className="text-xs text-slate-500">
              {incompleteWeeks} weeks of focused study left
            </p>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1d1d1f] text-sm">
                Current Stage
              </h3>
              <div className="w-10 h-10 rounded-2xl bg-[#edf8ef] flex items-center justify-center">
                <Flag className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-2">
              {currentStageNumber} of {stages.length}
            </h2>
            <p className="text-xs text-slate-500">
              {stages.find((s) => s.status === "active")?.title ||
                "All stages complete"}
            </p>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1d1d1f] text-sm">
                Target Role
              </h3>
              <div className="w-10 h-10 rounded-2xl bg-[#f4efff] flex items-center justify-center">
                <BriefcaseBusiness className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">
              {analysis?.careerFit || "—"}
            </h2>
            <p className="text-xs text-slate-500">
              {analysis?.targetRole || ""}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
          Roadmap Stages
        </h2>

        <div className="space-y-4 mb-12">
          {stages.map((s, index) => {
            const isCompleted = s.status === "completed";
            const isActive = s.status === "active";
            const isLocked = s.status === "locked";
            const isOpen = !!expanded[s.stage];

            return (
              <div
                key={s.stage}
                className={`border rounded-[2rem] overflow-hidden transition-all ${
                  isActive
                    ? "border-[#e7c47c] bg-[#fffdfa]"
                    : isCompleted
                    ? "border-[#cdebd2] bg-white"
                    : "border-[#e8e6e1] bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((e) => ({ ...e, [s.stage]: !isOpen }))
                  }
                  className="w-full flex items-start gap-5 p-5 sm:p-6 text-left hover:bg-black/[0.015] transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold shrink-0 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-[#c89a2b] text-white"
                        : "bg-[#e9e6e0] text-[#888]"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-1">{s.stage}</p>
                    <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">
                      {s.title}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          isCompleted
                            ? "bg-[#e7f7ea] text-green-700"
                            : isActive
                            ? "bg-[#fff3df] text-[#c89a2b]"
                            : "bg-[#f1f1f1] text-slate-500"
                        }`}
                      >
                        {s.status}
                      </span>
                      <span className="text-sm text-slate-500">
                        {s.knownCount} / {s.total} skills
                      </span>
                      <div className="flex-1 min-w-[120px] max-w-[260px] h-2 rounded-full bg-[#ece6dc] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted
                              ? "bg-green-500"
                              : isActive
                              ? "bg-[#c89a2b]"
                              : "bg-slate-300"
                          }`}
                          style={{ width: `${s.progress || 0}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          isActive ? "text-[#c89a2b]" : "text-slate-500"
                        }`}
                      >
                        {s.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 self-center text-slate-400">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 border-t border-[#f1ede5]">
                    {isLocked && (
                      <div className="mt-4 mb-2 flex items-center gap-2 text-sm text-slate-500">
                        <Lock className="w-4 h-4" />
                        Finish the previous stage to unlock these skills.
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      {s.skills.map((skill) => {
                        const key = `skill::${skill.name}`;
                        const saving = savingKey === key;
                        const badge = sourceBadge(skill.source);
                        return (
                          <div
                            key={skill.name}
                            className={`border rounded-2xl p-4 ${
                              skill.known
                                ? "border-green-200 bg-[#f4fbf6]"
                                : isLocked
                                ? "border-[#ece8df] bg-[#fafaf8]"
                                : "border-[#f0eadd] bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="min-w-0">
                                <h4 className="font-semibold text-[#1d1d1f] capitalize">
                                  {skill.name}
                                </h4>
                                {badge && (
                                  <span
                                    className={`mt-1 inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold ${badge.className}`}
                                  >
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled={saving || isLocked}
                                onClick={() =>
                                  toggleSkill(s, skill.name, skill.known)
                                }
                                className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center border transition-all ${
                                  skill.known
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "bg-white border-[#dcd6c8] text-slate-500 hover:bg-[#fff8ec]"
                                } disabled:opacity-50`}
                                title={
                                  skill.known
                                    ? "Mark as not done"
                                    : "Mark as done"
                                }
                              >
                                {saving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : skill.known ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <PlayCircle className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            {skill.resources?.length > 0 && (
                              <div className="mt-3 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  Resources
                                </div>
                                {skill.resources.slice(0, 3).map((r) => (
                                  <a
                                    key={r.url}
                                    href={r.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between gap-2 text-sm text-blue-600 hover:underline truncate"
                                  >
                                    <span className="truncate">{r.title}</span>
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {stages.length === 0 && (
            <p className="text-slate-400 text-sm">
              No stages yet — complete your profile to generate a roadmap.
            </p>
          )}
        </div>

        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
          Week-by-week plan
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {weeks.length > 0 ? (
            weeks.map((w) => {
              const allDone =
                (w.tasks || []).length > 0 &&
                (w.tasks || []).every((t) => t.done);
              return (
                <div
                  key={w.week}
                  className={`bg-white border rounded-2xl p-5 ${
                    allDone ? "border-green-200" : "border-[#e8e6e1]"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        allDone
                          ? "bg-green-500 text-white"
                          : "bg-[#1d1d1f] text-white"
                      }`}
                    >
                      {allDone ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <CalendarDays className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">
                        Week {w.week}
                      </p>
                      <h3 className="font-semibold text-[#1d1d1f] capitalize">
                        {w.goal}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(w.tasks || []).map((t) => {
                      const key = `task::${w.week}::${t.key}`;
                      const saving = savingKey === key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() =>
                            toggleWeeklyTask(w.week, t.key, t.done)
                          }
                          disabled={saving}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm border transition-all ${
                            t.done
                              ? "bg-[#f4fbf6] border-green-200 text-slate-600"
                              : "bg-[#faf7f0] border-[#ece4d4] text-[#1d1d1f] hover:bg-[#fff8ec]"
                          } disabled:opacity-50`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                              t.done
                                ? "bg-green-500 text-white"
                                : "border border-[#cfc6b1]"
                            }`}
                          >
                            {saving ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : t.done ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : null}
                          </span>
                          <span
                            className={`capitalize flex-1 ${
                              t.done ? "line-through opacity-70" : ""
                            }`}
                          >
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-slate-400 text-sm">
              No weekly plan available — looks like you've covered everything!
            </p>
          )}
        </div>

        <div className="bg-gradient-to-r from-[#f6f0ff] to-[#faf7ff] border border-[#e9dcff] rounded-[2rem] p-7">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">
                AI Recommendations for {userInfo?.name?.split(" ")[0]}
              </h3>
              <p className="text-slate-600 mb-4">
                Based on your skill gaps, focus on these to become{" "}
                {analysis?.careerFit}-ready faster.
              </p>
              <div className="flex flex-wrap gap-2">
                {(analysis?.recommendedSkills || []).map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#e9dcff] text-xs font-medium text-[#5c3fc9] capitalize"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <a
              href="/analyzer"
              className="h-11 px-5 rounded-xl bg-[#6d4aff] text-white font-semibold flex items-center gap-2 whitespace-nowrap"
            >
              Re-analyze
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
