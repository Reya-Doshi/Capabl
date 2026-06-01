import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Brain,
  Route,
  FileSearch,
  FileText,
  CheckCircle2,
  Video,
  FolderKanban,
  Bookmark,
  User,
  Settings,
  Upload,
  Info,
  Sparkles,
  Search,
  Code2,
  ArrowRight,
  Download,
  FilePlus2,
  Mail,
  Phone,
  Link as LinkIcon,
  LogOut,
  Loader2,
  Target,
} from "lucide-react";

import logout from "../utils/logout";
import { apiUrl, assetUrl } from "../config/api";

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

export default function Resume() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        apiUrl("/api/analysis"),
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
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      toast.error("Only PDF, DOC, or DOCX files");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("resume", selectedFile);

      await axios.post(
        apiUrl("/api/profile/resume"),
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Resume re-analyzed");
      setSelectedFile(null);
      await fetchAnalysis();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b89968]" />
      </div>
    );
  }

  const resume = analysis?.resume;
  const resumeScore = resume?.score ?? 0;
  const atsScore = resume?.atsScore ?? 0;
  const resumeUrl = userInfo?.resume
    ? assetUrl(userInfo.resume)
    : null;

  const hasResume = Boolean(userInfo?.resume);

  const suggestions = analysis?.aiSuggestions || [];
  const strengths = analysis?.strengthsText || [];

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
          <SidebarLink href="/resume" icon={FileText} label="Resume" active />
          <SidebarLink href="/interview" icon={Video} label="Mock Interview" />
          <SidebarLink href="/job-match" icon={Target} label="Job Match" />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-2">
              Resume
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium">
              Build, optimize and analyze your resume to stand out.
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

        <div className="bg-white border border-dashed border-[#ddd3c4] rounded-[2rem] p-6 sm:p-8 mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#f7f1e7] flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-[#c89a2b]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">
            {hasResume ? "Re-upload your resume" : "Upload your resume"}
          </h2>
          <p className="text-slate-500 font-medium mb-5">
            {hasResume
              ? `Current: ${userInfo?.resumeName || "resume on file"}`
              : "Upload PDF, DOC, or DOCX"}
          </p>
          <div className="flex flex-col items-center gap-3">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="resumeUpload"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="resumeUpload"
              className="cursor-pointer h-11 px-7 bg-[#1d1d1f] text-white rounded-xl font-semibold flex items-center gap-2 hover:opacity-90"
            >
              <Upload className="w-4 h-4" />
              Choose file
            </label>
            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="h-11 px-6 rounded-xl bg-[#c89a2b] text-white font-semibold disabled:opacity-60 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>Analyze {selectedFile.name}</>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-5 gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-500 font-medium mb-2">Resume Score</p>
                    <h2 className="text-4xl sm:text-5xl font-bold text-[#1d1d1f]">
                      {resumeScore}%
                    </h2>
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#edf8ef] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-[#f1f1f1] overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${resumeScore}%` }}
                  ></div>
                </div>
                {resume?.breakdown && (
                  <p className="mt-3 text-xs text-slate-400">
                    Sections {resume.breakdown.sectionScore} · Keywords{" "}
                    {resume.breakdown.atsKeywordScore} · Role{" "}
                    {resume.breakdown.roleKeywordScore} · Length{" "}
                    {resume.breakdown.lengthScore}
                  </p>
                )}
              </div>

              <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-5 gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-500 font-medium mb-2">
                      ATS Compatibility
                    </p>
                    <h2 className="text-4xl sm:text-5xl font-bold text-[#1d1d1f]">
                      {atsScore}%
                    </h2>
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#fff3df] flex items-center justify-center shrink-0">
                    <Search className="w-7 h-7 sm:w-8 sm:h-8 text-[#c89a2b]" />
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-[#f1f1f1] overflow-hidden">
                  <div
                    className="h-full bg-[#c89a2b] rounded-full"
                    style={{ width: `${atsScore}%` }}
                  ></div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Detected {resume?.sectionsFound?.length || 0} sections,{" "}
                  {resume?.wordCount || 0} words
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-1">
                    Resume Analysis
                  </h2>
                  <p className="text-slate-500 font-medium">
                    AI-generated insights from your resume
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#f7f1e7] flex items-center justify-center">
                  <Info className="w-7 h-7 text-[#c89a2b]" />
                </div>
              </div>

              {hasResume && resume?.ok ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-[#f1f1f1]">
                    <h3 className="font-semibold text-[#1d1d1f] mb-2">
                      Skills found in resume
                    </h3>
                    {resume.foundSkills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {resume.foundSkills.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1.5 rounded-full bg-[#e8f8ef] text-green-700 text-xs font-medium capitalize"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        No role-specific skills detected.
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl border border-[#f1f1f1]">
                    <h3 className="font-semibold text-[#1d1d1f] mb-2">
                      Missing keywords for {analysis.careerFit}
                    </h3>
                    {resume.missingKeywords?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {resume.missingKeywords.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1.5 rounded-full bg-[#fff2e4] text-orange-600 text-xs font-medium capitalize"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-green-600 text-sm font-medium">
                        All role keywords present.
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl border border-[#f1f1f1]">
                    <h3 className="font-semibold text-[#1d1d1f] mb-2">
                      Detected sections
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(resume.sectionsFound || []).map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.5 rounded-full bg-[#f5f1ea] text-xs font-medium capitalize"
                        >
                          {s}
                        </span>
                      ))}
                      {(!resume.sectionsFound ||
                        resume.sectionsFound.length === 0) && (
                        <span className="text-slate-400 text-sm">
                          None detected
                        </span>
                      )}
                    </div>
                  </div>

                  {strengths.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {strengths.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-2xl border border-[#f1f1f1]"
                        >
                          <div>
                            <h4 className="font-semibold text-[#1d1d1f] mb-1">
                              {s.title}
                            </h4>
                            <p className="text-slate-500 text-sm">
                              {s.description}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${s.color}`}
                          >
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-[#faf7f2] flex items-center justify-center mx-auto mb-4">
                    <FilePlus2 className="w-8 h-8 text-[#c89a2b]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">
                    No Resume Analysis Yet
                  </h3>
                  <p className="text-slate-500 max-w-[420px] mx-auto">
                    Upload your resume so we can detect keywords, sections and
                    score ATS compatibility.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-1">
                    AI Suggestions
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Personalized improvements
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#fff3df] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[#c89a2b]" />
                </div>
              </div>

              {suggestions.length ? (
                <div className="space-y-4">
                  {suggestions.map((item, i) => (
                    <div
                      key={i}
                      className="border border-[#f1f1f1] rounded-2xl p-4 flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#fff3df] flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-[#c89a2b]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1d1d1f] mb-1">
                          {item.title}
                        </h4>
                        <p className="text-slate-500 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No suggestions — your resume looks great for{" "}
                  {analysis?.careerFit}.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 min-w-0 lg:sticky lg:top-6 self-start">
            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#f1f1f1] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1d1d1f] mb-1">
                    Resume Preview
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Detected info from your file
                  </p>
                </div>
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-4 rounded-xl border border-[#e8e6e1] flex items-center gap-2 font-semibold text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Open
                  </a>
                )}
              </div>

              <div className="p-6">
                {hasResume ? (
                  <>
                    <h1 className="text-2xl font-bold text-[#1d1d1f] mb-3">
                      {userInfo?.name}
                    </h1>
                    <div className="space-y-2 text-slate-500 text-sm mb-6 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {resume?.contact?.email || userInfo?.email}
                        </span>
                      </div>
                      {resume?.contact?.phone && (
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="w-4 h-4 shrink-0" />
                          <span className="truncate">{resume.contact.phone}</span>
                        </div>
                      )}
                      {resume?.contact?.urls?.slice(0, 3).map((u) => (
                        <div key={u} className="flex items-center gap-2 min-w-0">
                          <LinkIcon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{u}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                        Career Goal
                      </h2>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {userInfo?.careerGoal || "Not set"}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                        Skills detected
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {(analysis?.extractedSkills || []).map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full bg-[#faf7f2] border border-[#ece3d3] text-xs font-medium capitalize"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                        Education
                      </h2>
                      <div className="border border-[#f1f1f1] rounded-2xl p-4">
                        <h3 className="font-semibold text-[#1d1d1f] mb-1">
                          {userInfo?.college || "College"}
                        </h3>
                        <p className="text-slate-500 text-sm">
                          Age {userInfo?.age || "—"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-[#faf7f2] flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-[#c89a2b]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">
                      No Resume Uploaded
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Upload your resume to see your preview here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {resume?.contact?.urls?.length > 0 && (
              <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#edf3ff] flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1d1d1f]">
                    Links in resume
                  </h3>
                </div>
                <div className="space-y-2">
                  {resume.contact.urls.map((u) => (
                    <a
                      key={u}
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-blue-600 truncate hover:underline"
                    >
                      {u}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
