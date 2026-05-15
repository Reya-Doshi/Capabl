import { useEffect, useState } from "react";
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
  ChevronDown,
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
  const [resumeScore, setResumeScore] = useState(0);
  const [atsScore, setAtsScore] = useState(0);

  useEffect(() => {
    const resumeInterval = setInterval(() => {
      setResumeScore((prev) => {
        if (prev >= 78) {
          clearInterval(resumeInterval);
          return 78;
        }
        return prev + 1;
      });
    }, 20);

    const atsInterval = setInterval(() => {
      setAtsScore((prev) => {
        if (prev >= 82) {
          clearInterval(atsInterval);
          return 82;
        }
        return prev + 1;
      });
    }, 20);

    return () => {
      clearInterval(resumeInterval);
      clearInterval(atsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex">
      {/* SIDEBAR */}

      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">
        {/* LOGO */}

        <a href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full"></div>
          </div>

          <span className="text-xl font-bold">Capabl</span>
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

        <div className="flex items-start justify-between mb-10">
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
            <img
              src="https://i.pravatar.cc/100?img=32"
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <h3 className="font-semibold text-[#1d1d1f]">{userInfo?.name}</h3>

              <p className="text-sm text-slate-500">Student</p>
            </div>

            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* TOP GRID */}

        <div className="grid lg:grid-cols-[1.4fr,1fr,1fr,1fr] gap-5 mb-6">
          {/* UPLOAD */}

          <div className="bg-white border border-dashed border-[#ddd3c4] rounded-[2rem] p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-20 h-20 rounded-full bg-[#f7f1e7] flex items-center justify-center mb-6">
              <Upload className="w-10 h-10 text-[#c89a2b]" />
            </div>

            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-3">
              Upload Your Resume
            </h2>

            <p className="text-slate-500 font-medium leading-relaxed mb-7">
              Upload your resume in PDF format
              <br />
              (Max size: 5MB)
            </p>

            <button className="group relative overflow-hidden h-12 px-8 bg-[#1d1d1f] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)] active:scale-95 mb-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <span className="relative z-10 flex items-center gap-2">
                <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-all duration-300" />
                Upload PDF
              </span>

              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-all duration-300"></div>
            </button>

            <p className="text-slate-500">or drag and drop</p>
          </div>

          {/* RESUME SCORE */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-8">
              <h3 className="text-xl font-semibold text-[#1d1d1f]">
                Resume Score
              </h3>

              <Info className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex justify-center mb-6">
              <div
                className="relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: `conic-gradient(#d4a44d ${
                    resumeScore * 3.6
                  }deg, #efe6d7 0deg)`,
                }}
              >
                <div className="absolute w-[125px] h-[125px] rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-5xl font-bold text-[#1d1d1f]">
                      {resumeScore}
                    </h2>

                    <p className="text-lg text-slate-500">/100</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-slate-600 font-medium">
              Good! But room for improvement.
            </p>
          </div>

          {/* ATS SCORE */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-8">
              <h3 className="text-xl font-semibold text-[#1d1d1f]">
                ATS Score
              </h3>

              <Info className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex justify-center mb-6">
              <div
                className="relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: `conic-gradient(#d4a44d ${
                    atsScore * 3.6
                  }deg, #efe6d7 0deg)`,
                }}
              >
                <div className="absolute w-[125px] h-[125px] rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-5xl font-bold text-[#1d1d1f]">
                      {atsScore}
                    </h2>

                    <p className="text-lg text-slate-500">/100</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-slate-600 font-medium">
              Great! Your resume is ATS-friendly.
            </p>
          </div>

          {/* STRENGTH */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-8">
              Resume Strength
            </h3>

            <div className="space-y-5">
              {[
                {
                  title: "Formatting",
                  status: "Good",
                  color: "bg-[#e8f8eb] text-green-600",
                },

                {
                  title: "Keywords",
                  status: "Good",
                  color: "bg-[#e8f8eb] text-green-600",
                },

                {
                  title: "Experience",
                  status: "Average",
                  color: "bg-[#fff3df] text-[#c89a2b]",
                },

                {
                  title: "Projects",
                  status: "Good",
                  color: "bg-[#e8f8eb] text-green-600",
                },

                {
                  title: "Education",
                  status: "Good",
                  color: "bg-[#e8f8eb] text-green-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-xl transition-all duration-300 hover:bg-[#faf7f2] hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#eef9ef] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>

                    <p className="font-medium text-[#1d1d1f]">
                      {item.title}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${item.color}`}
                  >
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECOND GRID */}

        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6">
          {/* RESUME PREVIEW */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
              Resume Preview
            </h2>

            {/* PAPER */}

            <div className="bg-[#fcfcfc] border border-[#e8e6e1] rounded-[1.5rem] p-8 h-[640px] overflow-y-auto">
              <h1 className="text-4xl font-bold text-[#1d1d1f] mb-2">
                 {userInfo?.name}
              </h1>

              <h2 className="text-xl font-semibold text-[#c89a2b] mb-5">
                Full Stack Developer
              </h2>

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600 mb-7">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {userInfo?.email}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +91 9876543210
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Hyderabad, India
                </div>
              </div>

              <hr className="mb-7" />

              {/* SUMMARY */}

              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-3">
                  SUMMARY
                </h3>

                <p className="text-slate-700 leading-relaxed">
                  Motivated B.Tech Information Technology student at Bhoj
                  Reddy Engineering College For Women with strong interest
                  in Full Stack Development, AI-powered platforms, and
                  modern web technologies. Passionate about building
                  scalable, user-friendly applications using React,
                  Node.js, PostgreSQL and AI integrations.
                </p>
              </div>

              {/* EDUCATION */}

              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-3">
                  EDUCATION
                </h3>

                <h4 className="font-semibold text-[#1d1d1f]">
                  B.Tech in Information Technology
                </h4>

                <p className="text-slate-600">
                  Bhoj Reddy Engineering College For Women • 2024 - 2028
                </p>
              </div>

              {/* SKILLS */}

              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-3">
                  TECHNICAL SKILLS
                </h3>

                <div className="flex flex-wrap gap-3">
                  {[
                    "React.js",
                    "JavaScript",
                    "Tailwind CSS",
                    "Node.js",
                    "Express.js",
                    "PostgreSQL",
                    "Prisma",
                    "Git & GitHub",
                    "OpenAI APIs",
                    "Vercel",
                  ].map((skill, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 rounded-xl bg-[#f5f1ea] text-sm font-medium text-[#1d1d1f]"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* PROJECT */}

              <div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-3">
                  PROJECT
                </h3>

                <h4 className="font-semibold text-[#1d1d1f] mb-2">
                  Capabl — AI Career Platform
                </h4>

                <ul className="space-y-2 text-slate-700 list-disc pl-5 leading-relaxed">
                  <li>
                    Built a full-stack AI-powered career platform for
                    students.
                  </li>

                  <li>
                    Developed student dashboard, AI analyzer, roadmap and
                    skill gap modules.
                  </li>

                  <li>
                    Planned backend using Node.js, Express, PostgreSQL and
                    Prisma.
                  </li>

                  <li>
                    Integrated modern UI using React and Tailwind CSS.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            {/* AI SUGGESTIONS */}

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
              <div className="flex items-center gap-3 mb-7">
                <Sparkles className="w-5 h-5 text-[#c89a2b]" />

                <h2 className="text-2xl font-bold text-[#1d1d1f]">
                  AI Suggestions
                </h2>
              </div>

              <div className="space-y-5">
                {/* CARD */}

                <div className="group border border-[#f1f1f1] rounded-[1.5rem] p-5 flex items-start justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#f4efff] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1d1d1f] mb-2">
                        Add more quantifiable achievements
                      </h3>

                      <p className="text-slate-500 leading-relaxed">
                        Include metrics to highlight impact in your
                        projects and internships.
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#c89a2b]" />
                </div>

                {/* CARD */}

                <div className="group border border-[#f1f1f1] rounded-[1.5rem] p-5 flex items-start justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#eef5ff] flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-500" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1d1d1f] mb-2">
                        Improve ATS keywords
                      </h3>

                      <p className="text-slate-500 leading-relaxed">
                        Add more backend and AI-related keywords for better
                        ATS ranking.
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#c89a2b]" />
                </div>

                {/* CARD */}

                <div className="group border border-[#f1f1f1] rounded-[1.5rem] p-5 flex items-start justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#fff3df] flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-[#c89a2b]" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1d1d1f] mb-2">
                        Improve project section
                      </h3>

                      <p className="text-slate-500 leading-relaxed">
                        Add deployment links, GitHub links and more
                        technical details.
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#c89a2b]" />
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
              <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button className="h-14 rounded-xl bg-[#1d1d1f] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  <Sparkles className="w-4 h-4" />
                  Build with AI
                </button>

                <button className="h-14 rounded-xl border border-[#e8e6e1] font-medium flex items-center justify-center gap-2 hover:bg-[#f5f1ea] transition-all">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>

                <button className="h-14 rounded-xl border border-[#e8e6e1] font-medium flex items-center justify-center gap-2 hover:bg-[#f5f1ea] transition-all col-span-2">
                  <FilePlus2 className="w-4 h-4" />
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}