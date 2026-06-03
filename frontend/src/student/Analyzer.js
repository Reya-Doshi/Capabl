import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import logout from "../utils/logout";
import { apiUrl } from "../config/api";

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
  Upload,
  CheckCircle2,
  Sparkles,
  Eye,
  AlertTriangle,
  ArrowRight,
  RotateCw,
  Loader2,
  LogOut,
} from "lucide-react";

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

const ScoreCard = ({ title, score, status, color, icon: Icon, iconColor }) => (
  <div className="border border-[#e8e6e1] rounded-[2rem] p-5 bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
    <div className="w-12 h-12 rounded-2xl bg-[#f5f1ea] flex items-center justify-center mb-5">
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <h4 className="font-bold text-[#1d1d1f] mb-3 text-sm leading-snug">
      {title}
    </h4>
    <div className="flex items-end gap-1 mb-1">
      <h2 className="text-3xl font-bold text-[#1d1d1f] leading-none">
        {score}
      </h2>
      <span className="text-sm text-slate-500 mb-1">/100</span>
    </div>
    <p className="text-green-600 font-semibold text-xs mb-4">{status}</p>
    <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(100, score)}%` }}
      />
    </div>
  </div>
);

function statusOf(score) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs work";
}

export default function Analyzer() {
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(null);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        apiUrl("/api/analysis"),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserInfo(data.user);
      setAnalysis(data.analysis);
      setLastAnalyzedAt(new Date());
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reanalyze = async () => {
    try {
      setReanalyzing(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        apiUrl("/api/analysis"),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserInfo(data.user);
      setAnalysis(data.analysis);
      setLastAnalyzedAt(new Date());
      toast.success("Re-analyzed successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Re-analysis failed"
      );
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b89968]" />
      </div>
    );
  }

  const readiness = analysis?.readinessScore ?? 0;
  const resumeScore = analysis?.resume?.score ?? 0;
  const linkedinScore = analysis?.linkedin?.score ?? 0;
  const githubScore = analysis?.github?.score ?? 0;
  const recruiterVisibility = analysis?.recruiterVisibility ?? 0;

  const readinessBand =
    readiness >= 80
      ? "Excellent"
      : readiness >= 60
      ? "Good"
      : readiness >= 40
      ? "Fair"
      : "Getting started";

  const ghProfile = analysis?.github?.profile;
  const liData = analysis?.linkedin;
  const semanticScore = analysis?.semanticScore ?? 0;
  const semanticBand =
    semanticScore >= 75
      ? "Strong alignment"
      : semanticScore >= 50
      ? "Good alignment"
      : semanticScore >= 30
      ? "Partial alignment"
      : "Low alignment";

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
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink href="/analyzer" icon={Brain} label="AI Analyzer" active />
          <SidebarLink href="/road-map" icon={Route} label="Roadmap" />
          <SidebarLink href="/skill-gap" icon={FileSearch} label="Skill Gap" />
          <SidebarLink href="/resume" icon={FileText} label="Resume" />
          <SidebarLink href="/interview" icon={Video} label="Mock Interview" />
          <SidebarLink href="/projects" icon={FolderKanban} label="Projects" />
          <SidebarLink href="/recommendations" icon={Bookmark} label="Recommendations" />
          <SidebarLink href="/profile" icon={User} label="Profile" />
          <SidebarLink href="/settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      <main className="flex-1 lg:ml-[270px] p-8 lg:p-12">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
              AI Analyzer
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-2xl">
              Real analysis of your resume, GitHub, and LinkedIn against your
              target role.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#77410e] flex items-center justify-center text-white font-bold text-lg">
              {(userInfo?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f]">
                {userInfo?.name}
              </h3>
              <p className="text-sm text-slate-500">Student</p>
            </div>
          </div>
        </div>

        <div className="bg-[#f8f1e5] border border-[#ece3d3] rounded-[2rem] p-7 mb-7 flex items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">
              Target: {analysis?.careerFit || "Set your career goal"}
            </h2>
            <p className="text-slate-600 max-w-xl">
              Analysis combines resume keyword/ATS scoring, semantic alignment to
              the role profile, GitHub public API data, and LinkedIn URL
              validation.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-center justify-center w-[220px] h-[130px] rounded-[2rem] bg-white/70 px-4">
            <p className="text-xs font-semibold text-slate-500 mb-1 text-center">
              Semantic Alignment
            </p>
            <h3 className="text-4xl font-bold text-[#c4a05d]">{semanticScore}%</h3>
            <p className="text-xs text-slate-500 mt-1">{semanticBand}</p>
          </div>
        </div>

        <section className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7 mb-7">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">
            Connected Profiles
          </h2>
          <p className="text-slate-500 mb-6">
            These are the inputs your analysis is using right now.
          </p>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="border border-[#e8e6e1] rounded-[2rem] p-5">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f1ea] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#b89968]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1d1d1f]">Resume</h3>
                  <p className="text-xs text-slate-500">
                    {userInfo?.resume ? "Uploaded" : "Not uploaded"}
                  </p>
                </div>
              </div>
              {userInfo?.resume ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {userInfo.resumeName || "Resume on file"}
                </div>
              ) : (
                <a
                  href="/resume"
                  className="flex items-center gap-2 text-[#b89968] text-sm font-semibold"
                >
                  <Upload className="w-4 h-4" />
                  Upload resume
                </a>
              )}
            </div>

            <div className="border border-[#e8e6e1] rounded-[2rem] p-5">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f5f5] flex items-center justify-center">
                  <GithubIcon className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1d1d1f]">GitHub</h3>
                  <p className="text-xs text-slate-500">
                    Public API · live data
                  </p>
                </div>
              </div>
              {userInfo?.github ? (
                <div className="text-sm break-words">
                  <a
                    href={userInfo.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {userInfo.github}
                  </a>
                  {ghProfile?.ok ? (
                    <p className="text-xs text-slate-500 mt-2">
                      {ghProfile.ownRepoCount} repos · {ghProfile.followers}{" "}
                      followers · {ghProfile.totalStars} stars
                    </p>
                  ) : (
                    <p className="text-xs text-orange-600 mt-2">
                      {ghProfile?.reason || "Could not load GitHub data"}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No GitHub URL</p>
              )}
            </div>

            <div className="border border-[#e8e6e1] rounded-[2rem] p-5">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#eef5ff] flex items-center justify-center">
                  <LinkedinIcon className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1d1d1f]">LinkedIn</h3>
                  <p className="text-xs text-slate-500">URL validation only</p>
                </div>
              </div>
              {userInfo?.linkedin ? (
                <div className="text-sm break-words">
                  <a
                    href={userInfo.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {userInfo.linkedin}
                  </a>
                  {liData?.note && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {liData.note}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No LinkedIn URL</p>
              )}
            </div>
          </div>

          <button
            onClick={reanalyze}
            disabled={reanalyzing}
            className="w-full h-16 bg-[#1d1d1f] rounded-2xl text-white mt-7 flex items-center justify-center gap-2 font-bold disabled:opacity-60"
          >
            {reanalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Re-analyze my profiles
              </>
            )}
          </button>
        </section>

        <section className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7 mb-7">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1f] mb-1">
                Your AI Analysis Results
              </h2>
              <p className="text-slate-500">
                Based on resume + GitHub + LinkedIn for {analysis?.careerFit}
              </p>
            </div>
            {lastAnalyzedAt && (
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                Last analyzed: {lastAnalyzedAt.toLocaleTimeString()}
                <RotateCw className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-5 gap-4 mb-7">
            <div className="border border-[#e8e6e1] rounded-[2rem] p-5 text-center">
              <h3 className="font-bold text-[#1d1d1f] mb-4 text-sm">
                Overall Readiness
              </h3>
              <div className="w-28 h-28 mx-auto rounded-full border-[8px] border-[#cfa04e] flex items-center justify-center mb-3">
                <div>
                  <h2 className="text-3xl font-bold text-[#1d1d1f]">
                    {readiness}
                  </h2>
                  <p className="text-xs text-slate-500">/100</p>
                </div>
              </div>
              <h4 className="font-bold mb-1">{readinessBand}</h4>
              <p className="text-xs text-slate-500">
                Combined across all signals
              </p>
            </div>

            <ScoreCard
              title="Resume Score"
              score={resumeScore}
              status={statusOf(resumeScore)}
              color="bg-purple-500"
              icon={FileText}
              iconColor="text-purple-500"
            />
            <ScoreCard
              title="LinkedIn Score"
              score={linkedinScore}
              status={statusOf(linkedinScore)}
              color="bg-blue-500"
              icon={LinkedinIcon}
              iconColor=""
            />
            <ScoreCard
              title="GitHub Score"
              score={githubScore}
              status={statusOf(githubScore)}
              color="bg-black"
              icon={GithubIcon}
              iconColor=""
            />
            <ScoreCard
              title="Recruiter Visibility"
              score={recruiterVisibility}
              status={statusOf(recruiterVisibility)}
              color="bg-green-500"
              icon={Eye}
              iconColor="text-green-500"
            />
          </div>

          {ghProfile?.ok && (
            <div className="border border-[#e8e6e1] rounded-2xl p-5 mb-7">
              <h3 className="font-bold text-[#1d1d1f] mb-3">
                GitHub deep dive · {ghProfile.username}
              </h3>
              <div className="grid sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Public repos</p>
                  <p className="text-xl font-bold">{ghProfile.ownRepoCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Followers</p>
                  <p className="text-xl font-bold">{ghProfile.followers}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total stars</p>
                  <p className="text-xl font-bold">{ghProfile.totalStars}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Top language</p>
                  <p className="text-xl font-bold capitalize">
                    {ghProfile.topLanguages?.[0]?.name || "—"}
                  </p>
                </div>
              </div>
              {ghProfile.topRepos?.length > 0 && (
                <>
                  <p className="text-sm font-semibold text-slate-500 mb-2">
                    Top repos
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {ghProfile.topRepos.map((r) => (
                      <a
                        key={r.name}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-[#f1f1f1] rounded-xl px-4 py-2 hover:bg-[#fafafa]"
                      >
                        <p className="font-semibold text-[#1d1d1f] text-sm">
                          {r.name}{" "}
                          <span className="text-slate-400 font-normal text-xs">
                            ★ {r.stars}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {r.description || r.language || ""}
                        </p>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="border border-[#e8e6e1] rounded-[2rem] p-5">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-5">
                Top Strengths
              </h3>
              <div className="space-y-3">
                {analysis?.skillStrengths?.length ? (
                  analysis.skillStrengths.slice(0, 6).map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-slate-600 font-medium capitalize">
                        {s}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No strengths detected yet.
                  </p>
                )}
              </div>
              <a
                href="/resume"
                className="w-full h-11 border border-[#e8e6e1] rounded-xl mt-6 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea]"
              >
                View Resume Analysis
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="border border-[#e8e6e1] rounded-[2rem] p-5">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-5">
                Key Areas to Improve
              </h3>
              <div className="space-y-3">
                {analysis?.skillGaps?.length ? (
                  analysis.skillGaps.slice(0, 6).map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-[#cfa04e]" />
                      <p className="text-sm text-slate-600 font-medium capitalize">
                        {s}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-green-600 font-medium">
                    No skill gaps detected.
                  </p>
                )}
              </div>
              <a
                href="/skill-gap"
                className="w-full h-11 border border-[#e8e6e1] rounded-xl mt-6 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea]"
              >
                View Skill Gap
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="border border-[#e8e6e1] rounded-[2rem] p-5">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-5">
                AI Recommendations
              </h3>
              <div className="space-y-3">
                {analysis?.aiSuggestions?.length ? (
                  analysis.aiSuggestions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#1d1d1f]">
                          {s.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No suggestions — keep going!
                  </p>
                )}
              </div>
              <a
                href="/road-map"
                className="w-full h-11 border border-[#e8e6e1] rounded-xl mt-6 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea]"
              >
                View Roadmap
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        <div className="bg-[#f8f1e5] border border-[#ece3d3] rounded-[2rem] p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
              <Eye className="w-6 h-6 text-[#cfa04e]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">
                Track your progress
              </h3>
              <p className="text-slate-500 text-sm">
                Re-analyze after you update your resume or GitHub.
              </p>
            </div>
          </div>
          <button
            onClick={reanalyze}
            disabled={reanalyzing}
            className="h-12 px-6 bg-[#1d1d1f] text-white rounded-xl flex items-center gap-2 font-semibold disabled:opacity-60"
          >
            <RotateCw
              className={`w-4 h-4 ${reanalyzing ? "animate-spin" : ""}`}
            />
            Re-analyze Now
          </button>
        </div>
      </main>
    </div>
  );
}
