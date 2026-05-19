import { useEffect, useState } from "react";
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
} from "lucide-react";

import logout from "../utils/logout";

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

export default function RoadMap() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/analysis",
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  const currentStageIndex = Math.max(
    1,
    stages.findIndex((s) => s.status === "active") + 1
  );

  const estimatedWeeks = weeks.length;
  const estimatedMonths = (estimatedWeeks / 4).toFixed(1);

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

      <main className="flex-1 lg:ml-[270px] p-8 lg:p-12">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
              Your Personalized Roadmap
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              Generated from your skills, resume, and career goal:{" "}
              <span className="font-semibold text-[#1d1d1f]">
                {analysis?.careerFit}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#77410e] flex items-center justify-center text-white font-bold text-lg">
              {(userInfo?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f]">{userInfo?.name}</h3>
              <p className="text-sm text-slate-500">Student</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-5 mb-10">
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
                className="h-full bg-[#c89a2b] rounded-full"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500">
              Based on stage completion
            </p>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1d1d1f] text-sm">
                Estimated Time
              </h3>
              <div className="w-10 h-10 rounded-2xl bg-[#f8f1e5] flex items-center justify-center">
                <Clock3 className="w-5 h-5 text-[#c89a2b]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-2">
              {estimatedWeeks > 0 ? `${estimatedMonths} mo` : "—"}
            </h2>
            <p className="text-xs text-slate-500">
              {estimatedWeeks} weeks of focused study
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
              {Math.max(1, currentStageIndex)} of {stages.length}
            </h2>
            <p className="text-xs text-slate-500">
              {stages.find((s) => s.status === "active")?.title ||
                "Plan ready"}
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
              {completedCount} stages completed
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
          Roadmap Stages
        </h2>

        <div className="space-y-5 mb-10">
          {stages.map((s, index) => {
            const isCompleted = s.status === "completed";
            const isActive = s.status === "active";
            const isLocked = s.status === "locked";

            return (
              <div key={s.stage} className="flex gap-6">
                <div className="w-[200px] flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-[#c89a2b] text-white"
                          : "bg-[#d9d9d9] text-[#555]"
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    {index !== stages.length - 1 && (
                      <div className="w-[2px] h-[90px] bg-[#d9d9d9]"></div>
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="text-xs text-slate-500">{s.stage}</p>
                    <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">
                      {s.title}
                    </h3>
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        isCompleted
                          ? "bg-[#e7f7ea] text-green-600"
                          : isActive
                          ? "bg-[#fff3df] text-[#c89a2b]"
                          : "bg-[#f1f1f1] text-slate-500"
                      }`}
                    >
                      {s.status}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex-1 border rounded-[2rem] p-6 ${
                    isActive
                      ? "border-[#e7c47c] bg-[#fffdfa]"
                      : "border-[#e8e6e1] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <p className="text-slate-600 font-medium">
                      Mastered {s.knownSkills?.length || 0} of {s.skills.length}{" "}
                      skills in this stage
                    </p>
                    <span
                      className={`font-bold ${
                        isActive ? "text-[#c89a2b]" : "text-slate-500"
                      }`}
                    >
                      {s.progress}%
                    </span>
                  </div>

                  <div className="flex-1 h-2 rounded-full bg-[#ece6dc] overflow-hidden mb-5">
                    <div
                      className={`h-full rounded-full ${
                        isCompleted
                          ? "bg-green-500"
                          : isActive
                          ? "bg-[#c89a2b]"
                          : "bg-slate-300"
                      }`}
                      style={{ width: `${s.progress || 0}%` }}
                    ></div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {s.skills.map((skill) => {
                      const known = s.knownSkills?.includes(skill);
                      return (
                        <div
                          key={skill}
                          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-medium capitalize ${
                            known
                              ? "bg-[#e7f7ea] border-green-200 text-green-700"
                              : isLocked
                              ? "bg-[#fafafa] border-[#e8e6e1] text-slate-500"
                              : "bg-[#fff3df] border-[#f1e4c4] text-[#c89a2b]"
                          }`}
                        >
                          {known ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5" />
                          )}
                          {skill}
                        </div>
                      );
                    })}
                  </div>
                </div>
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
            weeks.map((w) => (
              <div
                key={w.week}
                className="bg-white border border-[#e8e6e1] rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">
                    Week {w.week}
                  </p>
                  <h3 className="font-semibold text-[#1d1d1f] mb-2 capitalize">
                    {w.goal}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {w.focus.map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-1 rounded-full bg-[#f5f1ea] text-xs font-medium capitalize"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-sm">
              No weekly plan available — looks like you've covered everything!
            </p>
          )}
        </div>

        <div className="bg-gradient-to-r from-[#f6f0ff] to-[#faf7ff] border border-[#e9dcff] rounded-[2rem] p-7">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex-1">
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
