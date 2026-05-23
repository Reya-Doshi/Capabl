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
  CheckCircle2,
  TriangleAlert,
  Target,
  ArrowRight,
  Rocket,
  Star,
  Loader2,
} from "lucide-react";

import logout from "../utils/logout";

const API = "http://localhost:5000";

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

// Pick a colour band for the "gap %" badge based on how far the user is from
// having the skill (gapPct = 100 means missing entirely, 0 means fully known).
function gapTone(gapPct) {
  if (gapPct >= 70) return { bar: "bg-red-400", chip: "bg-[#fff0ed] text-red-600" };
  if (gapPct >= 40) return { bar: "bg-orange-400", chip: "bg-[#fff3df] text-[#c89a2b]" };
  if (gapPct > 0) return { bar: "bg-yellow-400", chip: "bg-[#fff8e0] text-[#a47200]" };
  return { bar: "bg-green-500", chip: "bg-[#e7f7ea] text-green-700" };
}

function levelLabel(known, stageStatus) {
  if (known) return "Confident";
  if (stageStatus === "active") return "In progress";
  if (stageStatus === "completed") return "Confident";
  return "Beginner";
}

export default function SkillGap() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);

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

  // Build the per-skill breakdown rows from the role's required skills.
  // For each required skill we say:
  //   - level: what the user currently has (Confident / In progress / Beginner)
  //   - required: target level (Advanced for required skills)
  //   - gap%: 0 if known, otherwise scaled by how early in the roadmap the
  //           skill appears (earlier stage = bigger gap, since it's a blocker)
  const rows = useMemo(() => {
    if (!analysis) return [];
    const stages = analysis.roadmapStages || [];
    const knownSet = new Set(
      (analysis.extractedSkills || []).map((s) => s.toLowerCase())
    );

    const stageBySkill = new Map();
    stages.forEach((stage, stageIdx) => {
      (stage.skills || []).forEach((sk) => {
        if (!stageBySkill.has(sk.name)) {
          stageBySkill.set(sk.name, { stage, stageIdx });
        }
      });
    });

    const required = analysis.requiredSkills || [];
    return required.map((name) => {
      const known = knownSet.has(name);
      const meta = stageBySkill.get(name);
      const stageIdx = meta?.stageIdx ?? stages.length - 1;
      const stageStatus = meta?.stage?.status || "locked";

      // Earlier stages have a bigger relative gap (blocking foundations).
      const gapPct = known
        ? 0
        : Math.round(
            100 - Math.min(80, stageIdx * 20) // stage 0 → 100, stage 1 → 80, stage 2 → 60 ...
          ) + (stageStatus === "locked" ? 0 : -10);

      const safeGap = Math.max(20, Math.min(100, gapPct));

      return {
        name,
        level: levelLabel(known, stageStatus),
        required: "Advanced",
        currentPct: known ? 100 : Math.max(20, 100 - safeGap),
        targetPct: 100,
        gapPct: known ? 0 : safeGap,
      };
    });
  }, [analysis]);

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

  // Donut numbers come from the (already sequentially-gated) roadmap stages.
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
              Identify your skill gaps and bridge them with personalized
              recommendations.
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
          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#f5edff] flex items-center justify-center mb-5">
              <FileSearch className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Overall Match Score
            </h3>
            <h2 className="text-4xl font-bold text-purple-500 mb-4">
              {matchScore}%
            </h2>
            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${matchScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500">
              {matchScore >= 75
                ? "Excellent"
                : matchScore >= 50
                ? "Good"
                : matchScore >= 25
                ? "Needs work"
                : "Just getting started"}
            </p>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-xl transition-all">
            <CheckCircle2 className="w-10 h-10 text-green-500 mb-5" />
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Skills You Have
            </h3>
            <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">
              {haveCount}
            </h2>
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
              {totalRequired
                ? `${haveCount} of ${totalRequired} required`
                : "—"}
            </p>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-xl transition-all">
            <TriangleAlert className="w-10 h-10 text-orange-400 mb-5" />
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Skills Missing
            </h3>
            <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">
              {missingCount}
            </h2>
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
                    ? `${Math.round(
                        (priorityGaps.length / missingCount) * 100
                      )}%`
                    : "0%",
                }}
              ></div>
            </div>
            <p className="text-sm text-slate-500">Focus areas</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.5fr,1fr] gap-6 mb-8">
          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
              Skill Gap Breakdown
            </h2>

            {rows.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No required skills detected — set your career goal in your
                profile.
              </p>
            ) : (
              <div className="space-y-4">
                {rows.map((skill) => {
                  const tone = gapTone(skill.gapPct);
                  return (
                    <div
                      key={skill.name}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] items-center gap-4 sm:gap-5 border-b border-[#f2f2f2] pb-4 rounded-2xl px-3 py-3 hover:bg-[#faf8f4] transition-all"
                    >
                      <h3 className="font-medium text-[#1d1d1f] capitalize">
                        {skill.name}
                      </h3>

                      <div>
                        <p className="text-sm text-slate-500 mb-2">
                          {skill.level}
                        </p>
                        <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${tone.bar} transition-all duration-1000`}
                            style={{ width: `${skill.currentPct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 mb-2">
                          {skill.required}
                        </p>
                        <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all duration-1000"
                            style={{ width: `${skill.targetPct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex sm:justify-end">
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${tone.chip}`}
                        >
                          {skill.gapPct === 0 ? "Done" : `${skill.gapPct}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <a
              href="/road-map"
              className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-7 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] transition-all"
            >
              View Full Skill Gap Analysis
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

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
              View All Gaps
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
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

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
              Learning Path Progress
            </h2>

            <div className="flex items-center justify-center mb-8">
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
                    <p className="text-sm text-slate-500 mt-2">
                      Overall Progress
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-7">
              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-slate-500">Completed</p>
                </div>
                <p className="font-semibold text-[#1d1d1f]">
                  {completed} Skills
                </p>
              </div>

              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <p className="text-sm text-slate-500">In Progress</p>
                </div>
                <p className="font-semibold text-[#1d1d1f]">
                  {inProgress} Skills
                </p>
              </div>

              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <p className="text-sm text-slate-500">Yet to Start</p>
                </div>
                <p className="font-semibold text-[#1d1d1f]">
                  {yetToStart} Skills
                </p>
              </div>
            </div>

            <a
              href="/road-map"
              className="w-full h-12 border border-[#e8e6e1] rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] transition-all"
            >
              View Full Roadmap
              <ArrowRight className="w-4 h-4" />
            </a>
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
