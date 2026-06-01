import { useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Loader2,
  LogOut,
  Route,
  Settings,
  Sparkles,
  Target,
  User,
  Video,
  XCircle,
} from "lucide-react";

import { apiUrl } from "../config/api";
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

const scoreTone = (score) => {
  if (score >= 80) return "text-green-600 border-green-500 bg-green-50";
  if (score >= 65) return "text-blue-600 border-blue-500 bg-blue-50";
  if (score >= 45) return "text-orange-600 border-orange-400 bg-orange-50";
  return "text-red-600 border-red-400 bg-red-50";
};

const ScoreCard = ({ label, score, icon: Icon }) => (
  <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
    <div className="flex items-center justify-between mb-5">
      <div>
        <p className="text-sm text-slate-500 font-semibold mb-2">{label}</p>
        <h3 className="text-4xl font-bold text-[#1d1d1f]">{score}%</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${scoreTone(score)}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="w-full h-2.5 rounded-full bg-[#ececec] overflow-hidden">
      <div
        className="h-full rounded-full bg-[#1d1d1f]"
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
  </div>
);

const SkillList = ({ title, items, type }) => {
  const positive = type === "matched";
  return (
    <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
      <div className="flex items-center gap-3 mb-5">
        {positive ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <h3 className="text-xl font-bold text-[#1d1d1f]">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span
              key={item}
              className={
                positive
                  ? "px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold"
                  : "px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-semibold"
              }
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-400">
            {positive ? "No matching skills detected yet." : "No missing skills detected."}
          </p>
        )}
      </div>
    </div>
  );
};

export default function JobMatch() {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const userInfo = useMemo(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  }, []);

  const charCount = jobDescription.length;
  const canAnalyze = jobDescription.trim().length >= 50 && !loading;

  const analyze = async () => {
    if (!canAnalyze) {
      setError("Please paste a complete job description first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        apiUrl("/api/job-match"),
        { jobDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(data.match);
    } catch (err) {
      setError(
        err.response?.data?.error || "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex">
      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">
        <a href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full" />
          </div>
          <span className="text-xl font-bold">Capabl</span>
        </a>

        <div className="space-y-2 flex-1">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink href="/analyzer" icon={Brain} label="AI Analyzer" />
          <SidebarLink href="/road-map" icon={Route} label="Roadmap" />
          <SidebarLink href="/skill-gap" icon={FileSearch} label="Skill Gap" />
          <SidebarLink href="/resume" icon={FileText} label="Resume" />
          <SidebarLink href="/interview" icon={Video} label="Mock Interview" />
          <SidebarLink href="/job-match" icon={Target} label="Job Match" active />
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
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff1cf] text-[#8a6513] text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              AI job fit
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-3">
              Job Match Analyzer
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-3xl">
              Paste a job description and compare it against your uploaded resume,
              profile skills, and career goal.
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

        <div className="grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 items-start">
          <section className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 sm:p-7">
            <label className="block text-lg font-bold text-[#1d1d1f] mb-3">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value);
                if (error) setError("");
              }}
              rows={16}
              placeholder="Paste the full job description here: title, responsibilities, required skills, qualifications, and company context."
              className="w-full rounded-2xl border border-[#e8e6e1] bg-[#fcfbf9] px-4 py-4 outline-none resize-y min-h-[360px] focus:border-[#c89a2b] focus:ring-4 focus:ring-[#c89a2b]/10 text-sm leading-6"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p
                className={
                  charCount < 50
                    ? "text-sm font-medium text-red-500"
                    : "text-sm font-medium text-slate-500"
                }
              >
                {charCount} characters
                {charCount < 50 ? `, ${50 - charCount} more needed` : ""}
              </p>
              {error && (
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={analyze}
              disabled={!canAnalyze}
              className="w-full h-14 rounded-2xl bg-[#1d1d1f] text-white font-bold flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing match...
                </>
              ) : (
                <>
                  Analyze Job Match
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </section>

          <section className="space-y-6">
            {!result && !loading && (
              <div className="bg-[#f8f1e5] border border-[#ece3d3] rounded-[2rem] p-8 min-h-[360px] flex flex-col justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6">
                  <BriefcaseBusiness className="w-8 h-8 text-[#c89a2b]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3">
                  Ready when the job post is
                </h2>
                <p className="text-slate-600 leading-7 max-w-2xl">
                  Capabl will compute semantic alignment with Gemini embeddings,
                  identify matched and missing skills, and give you concrete next
                  steps for this specific role.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-10 text-center min-h-[360px] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#c89a2b] mb-5" />
                <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">
                  Comparing your resume to the role
                </h2>
                <p className="text-slate-500">
                  Running semantic match, skill gap extraction, and advice generation.
                </p>
              </div>
            )}

            {result && !loading && (
              <>
                <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 font-semibold mb-2">
                        Match for
                      </p>
                      <h2 className="text-3xl font-bold text-[#1d1d1f]">
                        {result.jobTitle}
                      </h2>
                      {result.company && (
                        <p className="text-slate-500 font-medium mt-1">
                          {result.company}
                        </p>
                      )}
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-sm font-bold ${scoreTone(result.matchScore)}`}>
                      {result.verdict}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <ScoreCard label="Overall Match" score={result.matchScore} icon={Target} />
                  <ScoreCard label="Semantic Match" score={result.semanticScore} icon={Brain} />
                  <ScoreCard label="Skill Match" score={result.skillMatchScore} icon={FileSearch} />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <SkillList title="You Have" items={result.matchedSkills || []} type="matched" />
                  <SkillList title="You Need" items={result.missingSkills || []} type="missing" />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
                    <h3 className="text-xl font-bold text-[#1d1d1f] mb-5">
                      Why You Fit
                    </h3>
                    <div className="space-y-3">
                      {(result.strongPoints || []).map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-600 leading-6">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
                    <h3 className="text-xl font-bold text-[#1d1d1f] mb-5">
                      Where To Improve
                    </h3>
                    <div className="space-y-3">
                      {(result.weakPoints || []).map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-600 leading-6">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8f1e5] border border-[#ece3d3] rounded-[2rem] p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-[#c89a2b]" />
                    <h3 className="text-xl font-bold text-[#1d1d1f]">
                      AI Advice
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-7">{result.advice}</p>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
