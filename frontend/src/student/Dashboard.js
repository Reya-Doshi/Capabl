import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  Sparkles,
  ArrowRight,
  Target,
  BarChart3,
  Puzzle,
  Map,
  CheckCircle2,
  GraduationCap,
  LogOut,
  Loader2,
  Download,
} from "lucide-react";

import logout from "../utils/logout";
import { apiUrl, assetUrl } from "../config/api";
import ProfileStatus from "../components/ProfileStatus";
import WhatIfSimulator from "./WhatIfSimulator";
import ConfidenceMeter, { getConfidenceBand } from "../components/ConfidenceMeter";
import ResponsibleAIPanel from "../components/ResponsibleAIPanel";
import ReasoningPanel from "../components/ReasoningPanel";

const GithubIcon = (props) => (
  <img src="/github.jpg" alt="GitHub" {...props} />
);

const LinkedinIcon = (props) => (
  <img src="/linkedin.jpg" alt="LinkedIn" {...props} />
);

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const [reasoningMap, setReasoningMap] = useState({});

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(
          apiUrl("/api/analysis"),
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserInfo(data.user);
        setAnalysis(data.analysis);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          logout();
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [navigate]);

  // Fetch tradeoff reasoning for recommended skills (non-fatal — cards still
  // render without it). One batched call, results keyed by lowercased name.
  useEffect(() => {
    const skills = analysis?.recommendedSkills;
    if (!skills?.length) return;
    const fetchReasonings = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(
          apiUrl("/api/recommendations/reasoning"),
          { targetRole: analysis?.careerFit, items: skills },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const map = {};
        (data?.reasonings || []).forEach((r) => {
          if (r?.name) map[r.name.toLowerCase()] = r.reasoning;
        });
        setReasoningMap(map);
      } catch (e) {
        // ignore — reasoning is optional enrichment
      }
    };
    fetchReasonings();
  }, [analysis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#b89968]" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const hasProfile = userInfo?.careerGoal && userInfo?.resume;

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center px-6">
        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-[#f5f1ea] flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-[#1d1d1f]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3">
            Finish setting up your profile
          </h2>
          <p className="text-slate-500 mb-6">
            Capabl needs your career goal and resume to generate your
            personalized analysis.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-[#1d1d1f] text-white font-semibold hover:opacity-90"
          >
            Complete profile <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const resumeUrl = userInfo.resume
    ? assetUrl(userInfo.resume)
    : null;

  // Derive evidence-source completeness from the persisted evidence summary
  // (same mapping the backend uses). Drives the confidence meter + band.
  const es = analysis?.evidenceSummary || {};
  const dataCompleteness = {
    interview: (es.interview || 0) > 0,
    projects: (es.project || 0) > 0,
    resume: (es.resume || 0) > 0 || !!userInfo?.resume,
    certs: (es.certification || 0) > 0,
    roadmap: (es.roadmap || 0) > 0,
  };
  const confidenceBand = getConfidenceBand(dataCompleteness);

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex">
      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">
        <a href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full"></div>
          </div>
          <span className="text-xl font-bold">Capabl</span>
        </a>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-semibold mb-4"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <div className="space-y-2 flex-1">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" active />
          <SidebarLink href="/analyzer" icon={Brain} label="AI Analyzer" />
          <SidebarLink href="/road-map" icon={Route} label="Roadmap" />
          <SidebarLink href="/skill-gap" icon={FileSearch} label="Skill Gap" />
          <SidebarLink href="/resume" icon={FileText} label="Resume" />
          <SidebarLink href="/interview" icon={Video} label="Mock Interview" />
          <SidebarLink href="/projects" icon={FolderKanban} label="Projects" />
          <SidebarLink href="/recommendations" icon={Bookmark} label="Recommendations" />
          <SidebarLink href="/profile" icon={User} label="Profile" />
          <SidebarLink href="/settings" icon={Settings} label="Settings" />
        </div>

        <div className="mt-4">
          <ResponsibleAIPanel />
        </div>
      </aside>

      <main className="flex-1 lg:ml-[270px] p-8 lg:p-12">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f] mb-3">
              Welcome back, {userInfo?.name} 👋
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              Ready to take the next step in your career journey?
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
            <button
              onClick={logout}
              title="Log out"
              className="lg:hidden ml-3 w-10 h-10 rounded-full border border-[#e8e6e1] flex items-center justify-center text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.5fr,1fr] gap-5 mb-6">
          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#f5f1ea] flex items-center justify-center shrink-0">
                <GraduationCap className="w-8 h-8 text-[#b89968]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-500 mb-1">
                  Hello {userInfo?.name?.split(" ")[0]}
                </h3>
                <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">
                  {userInfo?.college || "College not added"}
                </h2>
                <p className="text-slate-500">
                  Career Goal:{" "}
                  <span className="font-semibold text-[#1d1d1f]">
                    {userInfo?.careerGoal}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">
              Resume
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#edf3ff] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1d1d1f] truncate">
                  {userInfo?.resumeName || "Resume uploaded"}
                </p>
                <p className="text-xs text-slate-500">
                  Used for AI analysis
                </p>
              </div>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl border border-[#e8e6e1] flex items-center justify-center hover:bg-[#f5f1ea]"
                  title="Open resume"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f8ef] flex items-center justify-center shrink-0">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                  Readiness Score
                </h3>
                <h2 className="text-4xl font-bold text-green-600 mb-2">
                  {analysis?.readinessScore ?? 0}%{" "}
                  <span className="text-xl font-semibold text-slate-400">
                    ± {confidenceBand}
                  </span>
                </h2>
                <p className="text-slate-500 text-sm">
                  Overall career readiness
                </p>
                <ConfidenceMeter dataCompleteness={dataCompleteness} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#f3ecff] flex items-center justify-center shrink-0">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                  Match Score
                </h3>
                <h2 className="text-4xl font-bold text-purple-600 mb-2">
                  {analysis?.matchScore ?? 0}%
                </h2>
                <p className="text-slate-500 text-sm">
                  vs {analysis?.careerFit}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#edf3ff] flex items-center justify-center shrink-0">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                  Skill Strengths
                </h3>
                <h2 className="text-4xl font-bold text-blue-600 mb-2">
                  {analysis?.skillStrengths?.length ?? 0}
                </h2>
                <p className="text-slate-500 text-sm">
                  Skills aligned with your goal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Readiness tabs — Overview vs What-if Simulator (no new route) */}
        <div className="mb-6">
          <div className="inline-flex bg-white border border-[#e8e6e1] rounded-2xl p-1 mb-4">
            <button
              onClick={() => setActiveView("overview")}
              className={
                activeView === "overview"
                  ? "px-4 py-2 rounded-xl bg-[#1d1d1f] text-white text-sm font-semibold"
                  : "px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-[#1d1d1f]"
              }
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView("simulate")}
              className={
                activeView === "simulate"
                  ? "px-4 py-2 rounded-xl bg-[#1d1d1f] text-white text-sm font-semibold flex items-center gap-2"
                  : "px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-[#1d1d1f] flex items-center gap-2"
              }
            >
              <Sparkles className="w-4 h-4" /> Simulate
            </button>
          </div>

          {activeView === "simulate" && (
            <WhatIfSimulator
              targetRole={analysis?.careerFit || userInfo?.careerGoal}
              skills={analysis?.skillProficiency || []}
              initialScore={analysis?.matchScore ?? 0}
            />
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#e8f8ef] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f]">
                Skill Strengths
              </h2>
            </div>
            {analysis?.skillStrengths?.length ? (
              <div className="flex flex-wrap gap-2">
                {analysis.skillStrengths.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full bg-[#e8f8ef] text-green-700 text-sm font-medium capitalize"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                Add more skills matching your career goal to see strengths.
              </p>
            )}
          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#fff2e4] flex items-center justify-center">
                <Puzzle className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f]">
                Skill Gaps
              </h2>
            </div>
            {analysis?.skillGaps?.length ? (
              <div className="flex flex-wrap gap-2">
                {analysis.skillGaps.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full bg-[#fff2e4] text-orange-600 text-sm font-medium capitalize"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                No skill gaps detected — you're on track!
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#edf3ff] flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1d1d1f]">
              Connected Profiles
            </h2>
          </div>
          <ProfileStatus
            profileStatus={analysis?.profileStatus}
            userInfo={userInfo}
            icons={{
              resume: FileText,
              github: GithubIcon,
              linkedin: LinkedinIcon,
            }}
          />
        </div>

        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#f3ecff] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1d1d1f]">
              Recommended Next Skills
            </h2>
          </div>
          {analysis?.recommendedSkills?.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.recommendedSkills.map((s) => (
                <div
                  key={s}
                  className="border border-[#e8e6e1] rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f5f1ea] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#b89968]" />
                    </div>
                    <span className="font-medium text-[#1d1d1f] capitalize">
                      {s}
                    </span>
                  </div>
                  <ReasoningPanel reasoning={reasoningMap[String(s).toLowerCase()]} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No new skills recommended — you have great coverage.
            </p>
          )}
        </div>

        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#fff0f5] flex items-center justify-center">
              <Map className="w-5 h-5 text-pink-500" />
            </div>
            <h2 className="text-xl font-bold text-[#1d1d1f]">
              Personalized Roadmap
            </h2>
          </div>
          {analysis?.roadmap?.length ? (
            <div className="space-y-4">
              {analysis.roadmap.map((w) => (
                <div
                  key={w.week}
                  className="border border-[#e8e6e1] rounded-2xl p-5 flex items-center gap-5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold shrink-0">
                    W{w.week}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1d1d1f] mb-1 capitalize">
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
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No roadmap available yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
