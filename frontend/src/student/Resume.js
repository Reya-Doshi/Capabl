import { useEffect, useState } from "react";
import axios from "axios";

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
  MapPin,
} from "lucide-react";

export default function Resume() {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const [resumeScore, setResumeScore] =
    useState(0);

  const [atsScore, setAtsScore] =
    useState(0);

  const [resumeData, setResumeData] =
    useState(null);

  const [, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState(null);

  useEffect(() => {

    const fetchResumeData = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const { data } = await axios.get(
          "http://localhost:5000/api/resume",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResumeData(data);

        setResumeScore(
          data.resumeScore || 0
        );

        setAtsScore(
          data.atsScore || 0
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchResumeData();

  }, []);

  const handleResumeUpload = async () => {

    if (!selectedFile) return;

    try {

      setUploading(true);

      const token =
        localStorage.getItem("token");

      const formData = new FormData();

      formData.append(
        "resume",
        selectedFile
      );

      await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      window.location.reload();

    } catch (error) {

      console.log(error);

    } finally {

      setUploading(false);

    }

  };

  return (

    <div className="min-h-screen bg-[#f7f5f2] flex">

      {/* SIDEBAR */}

      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">

        {/* LOGO */}

        <a
          href="/"
          className="flex items-center gap-2 mb-12"
        >

          <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">

            <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full"></div>

          </div>

          <span className="text-xl font-bold">
            Capabl
          </span>

        </a>

        {/* NAV */}

        <div className="space-y-2">

          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>

          <a
            href="/analyzer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Brain className="w-5 h-5" />
            AI Analyzer
          </a>

          <a
            href="/road-map"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Route className="w-5 h-5" />
            Roadmap
          </a>

          <a
            href="/skill-gap"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <FileSearch className="w-5 h-5" />
            Skill Gap
          </a>

          <a
            href="/resume"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
          >
            <FileText className="w-5 h-5 text-white" />
            Resume
          </a>

          <a
            href="/interview"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Video className="w-5 h-5" />
            Mock Interview
          </a>

          <a
            href="/projects"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <FolderKanban className="w-5 h-5" />
            Projects
          </a>

          <a
            href="/recommendations"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Bookmark className="w-5 h-5" />
            Recommendations
          </a>

          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <User className="w-5 h-5" />
            Profile
          </a>

          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Settings className="w-5 h-5" />
            Settings
          </a>

        </div>

      </aside>

      {/* MAIN */}

      <main className="flex-1 lg:ml-[270px] p-8 lg:p-12">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
              Resume
            </h1>

            <p className="text-slate-500 text-lg font-medium">
              Build, optimize and analyze your resume to stand out.
            </p>

          </div>

          {/* PROFILE */}

          <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-full bg-[#77410e] flex items-center justify-center text-white font-bold text-lg">

                {(userInfo?.name || "U")
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div>

                <h3 className="font-semibold text-[#1d1d1f]">
                  {userInfo?.name}
                </h3>

                <p className="text-sm text-slate-500">
                  Student
                </p>

              </div>
          </div>

        </div>

        {/* TOP GRID */}

        <div className="grid grid-cols-1 gap-6 mb-8">

          {/* UPLOAD */}

<div className="group bg-white border border-dashed border-[#ddd3c4] rounded-[2rem] p-10 flex flex-col items-center justify-center text-center min-h-[340px] w-full transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(212,164,77,0.12)] hover:border-[#d9c09a]">
            <div className="w-20 h-20 rounded-full bg-[#f7f1e7] flex items-center justify-center mb-6">

              <Upload className="w-10 h-10 text-[#c89a2b]" />

            </div>

            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-3">
              Upload Your Resume
            </h2>

            <p className="text-slate-500 font-medium leading-relaxed mb-7">

              Upload your resume in PDF format

            </p>

            <div className="flex flex-col items-center gap-4">

              <input
                type="file"
                accept=".pdf"
                id="resumeUpload"
                className="hidden"
                onChange={(e) =>
                  setSelectedFile(
                    e.target.files[0]
                  )
                }
              />

              <label
                htmlFor="resumeUpload"
                className="cursor-pointer h-12 px-8 bg-[#1d1d1f] text-white rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300"
              >

                <Upload className="w-4 h-4" />

                Choose PDF

              </label>

              {selectedFile && (

                <button
                  onClick={handleResumeUpload}
                  disabled={uploading}
                  className="h-11 px-6 rounded-xl bg-[#c89a2b] text-white font-semibold hover:scale-105 transition-all duration-300"
                >

                  {uploading
                    ? "Uploading..."
                    : "Analyze Resume"}

                </button>

              )}

            </div>

          </div>

        </div>
{/* RESUME CONTENT */}
<div className="mt-2"></div>
<div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6">

  {/* LEFT */}

  <div className="space-y-6">

    {/* SCORES */}

    <div className="grid md:grid-cols-2 gap-5">

      {/* RESUME SCORE */}

      <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]">

        <div className="flex items-center justify-between mb-6">

          <div>

            <p className="text-slate-500 font-medium mb-2">
              Resume Score
            </p>

            <h2 className="text-5xl font-bold text-[#1d1d1f]">
              {resumeScore}%
            </h2>

          </div>

          <div className="w-20 h-20 rounded-[1.8rem] bg-[#edf8ef] flex items-center justify-center transition-all duration-500 group-hover:scale-110">

            <CheckCircle2 className="w-10 h-10 text-green-600" />

          </div>

        </div>

        <div className="w-full h-3 rounded-full bg-[#f1f1f1] overflow-hidden">

          <div
            className="h-full bg-green-500 rounded-full transition-all duration-700"
            style={{
              width: `${resumeScore}%`,
            }}
          ></div>

        </div>

      </div>

      {/* ATS SCORE */}

      <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]">

        <div className="flex items-center justify-between mb-6">

          <div>

            <p className="text-slate-500 font-medium mb-2">
              ATS Compatibility
            </p>

            <h2 className="text-5xl font-bold text-[#1d1d1f]">
              {atsScore}%
            </h2>

          </div>

          <div className="w-20 h-20 rounded-[1.8rem] bg-[#fff3df] flex items-center justify-center transition-all duration-500 group-hover:scale-110">

            <Search className="w-10 h-10 text-[#c89a2b]" />

          </div>

        </div>

        <div className="w-full h-3 rounded-full bg-[#f1f1f1] overflow-hidden">

          <div
            className="h-full bg-[#c89a2b] rounded-full transition-all duration-700"
            style={{
              width: `${atsScore}%`,
            }}
          ></div>

        </div>

      </div>

    </div>

    {/* STRENGTHS */}

    <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-3xl font-bold text-[#1d1d1f] mb-2">
            Resume Analysis
          </h2>

          <p className="text-slate-500 font-medium">
            AI-generated insights from your resume
          </p>

        </div>

        <div className="w-16 h-16 rounded-[1.5rem] bg-[#f7f1e7] flex items-center justify-center">

          <Info className="w-8 h-8 text-[#c89a2b]" />

        </div>

      </div>

      <div className="space-y-5">

        {resumeData?.strengths?.length > 0 ? (

          resumeData.strengths.map(
            (item, index) => (

              <div
                key={index}
                className="flex items-center justify-between p-5 rounded-[1.5rem] border border-[#f1f1f1] hover:border-[#e4d3b3] transition-all duration-300"
              >

                <div>

                  <h3 className="font-semibold text-[#1d1d1f] mb-1">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 text-sm">
                    {item.description}
                  </p>

                </div>

                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${item.color}`}
                >

                  {item.status}

                </div>

              </div>

            )
          )

        ) : (

          <div className="text-center py-12">

            <div className="w-20 h-20 rounded-full bg-[#faf7f2] flex items-center justify-center mx-auto mb-5">

              <FilePlus2 className="w-10 h-10 text-[#c89a2b]" />

            </div>

            <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-3">
              No Resume Analysis Yet
            </h3>

            <p className="text-slate-500 max-w-[450px] mx-auto leading-relaxed">

              Upload your resume and let AI analyze formatting, keywords, ATS compatibility and project quality.

            </p>

          </div>

        )}

      </div>

    </div>

    {/* AI SUGGESTIONS */}

    <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(200,154,43,0.10)] hover:border-[#e4d3b3]">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-3xl font-bold text-[#1d1d1f] mb-2">
            AI Suggestions
          </h2>

          <p className="text-slate-500 font-medium">
            Personalized improvements for your resume
          </p>

        </div>

        <div className="w-16 h-16 rounded-[1.5rem] bg-[#fff3df] flex items-center justify-center">

          <Sparkles className="w-8 h-8 text-[#c89a2b]" />

        </div>

      </div>

      <div className="space-y-5">

        {resumeData?.aiSuggestions?.length > 0 ? (

          resumeData.aiSuggestions.map(
            (item, index) => (

              <div
                key={index}
                className="group border border-[#f1f1f1] rounded-[1.5rem] p-5 flex items-start justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]"
              >

                <div className="flex gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-[#fff3df] flex items-center justify-center">

                    <Sparkles className="w-6 h-6 text-[#c89a2b]" />

                  </div>

                  <div>

                    <h3 className="font-semibold text-[#1d1d1f] mb-2">

                      {item.title}

                    </h3>

                    <p className="text-slate-500 leading-relaxed">

                      {item.description}

                    </p>

                  </div>

                </div>

                <ArrowRight className="w-5 h-5 text-slate-400" />

              </div>

            )
          )

        ) : (

          <div className="text-center py-10 text-slate-400 font-medium">

            AI suggestions will appear after resume analysis.

          </div>

        )}

      </div>

    </div>

  </div>

  {/* RIGHT */}

  <div className="space-y-6">

    {/* PREVIEW */}

<div className="group bg-white border border-[#e8e6e1] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]">
      {/* TOP */}

      <div className="px-7 py-6 border-b border-[#f1f1f1] flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-1">
            Resume Preview
          </h2>

          <p className="text-slate-500 text-sm">
            AI-generated resume information
          </p>

        </div>

        {resumeData?.resumeUrl && (

          <a
            href={resumeData?.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="h-11 px-5 rounded-xl border border-[#e8e6e1] flex items-center gap-2 font-semibold text-[#1d1d1f] hover:bg-[#faf7f2] transition-all duration-300"
          >

            <Download className="w-4 h-4" />

            Download

          </a>

        )}

      </div>

      {/* BODY */}

      <div className="p-7">

        {resumeData ? (

          <>

            {/* PROFILE */}

            <div className="mb-8">

              <h1 className="text-3xl font-bold text-[#1d1d1f] mb-3">
                {userInfo?.name || "Student Name"}
              </h1>

              <div className="space-y-2 text-slate-500">

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {resumeData?.email || "email@example.com"}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {resumeData?.phone || "+91 XXXXX XXXXX"}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {resumeData?.location || "India"}
                </div>

              </div>

            </div>

            {/* SUMMARY */}

            <div className="mb-8">

              <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">
                Summary
              </h2>

              <p className="text-slate-500 leading-relaxed">

                {resumeData?.summary ||
                  "AI-generated professional summary will appear here after resume upload."}

              </p>

            </div>

            {/* SKILLS */}

            <div className="mb-8">

              <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">
                Skills
              </h2>

              <div className="flex flex-wrap gap-3">

                {resumeData?.skills?.length > 0 ? (

                  resumeData.skills.map(
                    (skill, index) => (

                      <div
                        key={index}
                        className="px-4 py-2 rounded-full bg-[#faf7f2] border border-[#ece3d3] text-sm font-medium text-[#1d1d1f]"
                      >

                        {skill}

                      </div>

                    )
                  )

                ) : (

                  <p className="text-slate-400">
                    Skills will appear here.
                  </p>

                )}

              </div>

            </div>

            {/* PROJECTS */}

            <div className="mb-8">

              <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">
                Projects
              </h2>

              <div className="space-y-5">

                {resumeData?.projects?.length > 0 ? (

                  resumeData.projects.map(
                    (project, index) => (

                      <div
                        key={index}
                        className="border border-[#f1f1f1] rounded-[1.3rem] p-5"
                      >

                        <div className="flex items-center gap-3 mb-3">

                          <Code2 className="w-5 h-5 text-[#c89a2b]" />

                          <h3 className="font-semibold text-[#1d1d1f]">
                            {project.title}
                          </h3>

                        </div>

                        <p className="text-slate-500 leading-relaxed">

                          {project.description}

                        </p>

                      </div>

                    )
                  )

                ) : (

                  <p className="text-slate-400">
                    Projects will appear here.
                  </p>

                )}

              </div>

            </div>

            {/* EDUCATION */}

            <div>

              <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">
                Education
              </h2>

              <div className="border border-[#f1f1f1] rounded-[1.3rem] p-5">

                <h3 className="font-semibold text-[#1d1d1f] mb-2">

                  {resumeData?.education?.degree ||
                    "Degree"}

                </h3>

                <p className="text-slate-500">

                  {resumeData?.education?.college ||
                    "College Name"}

                </p>

              </div>

            </div>

          </>

        ) : (

          <div className="text-center py-20">

            <div className="w-20 h-20 rounded-full bg-[#faf7f2] flex items-center justify-center mx-auto mb-6">

              <FileText className="w-10 h-10 text-[#c89a2b]" />

            </div>

            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-3">
              No Resume Uploaded
            </h2>

            <p className="text-slate-500 max-w-[350px] mx-auto leading-relaxed">

              Upload your resume to generate AI-powered analysis and preview.

            </p>

          </div>

        )}

      </div>

    </div>

  </div>

</div>
      </main>

    </div>

  );

}