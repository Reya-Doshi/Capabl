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
  Upload,
  CheckCircle2,
  Sparkles,
  Eye,
  AlertTriangle,
  ArrowRight,
  RotateCw,
} from "lucide-react";

import linkedinLogo from "../assets/images/linkedin.jpg";
import githubLogo from "../assets/images/github.jpg";

export default function Analyzer() {
  const userInfo = JSON.parse(
  localStorage.getItem("userInfo")
);
  const studentName = "{userInfo?.name}";

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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>

          <a
            href="/analyzer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold shadow-lg"
          >
            <Brain className="w-5 h-5 text-white" />
            AI Analyzer
          </a>

          <a
            href="/road-map"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <Route className="w-5 h-5" />
            Roadmap
          </a>

          <a
            href="/skill-gap"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <FileSearch className="w-5 h-5" />
            Skill Gap
          </a>

          <a
            href="/resume"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <FileText className="w-5 h-5" />
            Resume
          </a>

          <a
            href="/interview"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <Video className="w-5 h-5" />
            Mock Interview
          </a>

          <a
            href="/projects"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <FolderKanban className="w-5 h-5" />
            Projects
          </a>

          <a
            href="/recommendations"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <Bookmark className="w-5 h-5" />
            Recommendations
          </a>

          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <User className="w-5 h-5" />
            Profile
          </a>

          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </div>
      </aside>

      {/* MAIN */}

      <main className="flex-1 lg:ml-[270px] p-8 lg:p-12">
        {/* TOP */}

        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] leading-tight">
              AI Analyzer
            </h1>

            <p className="text-slate-500 text-lg mt-3 font-medium max-w-2xl">
              Connect your professional profiles below. Our AI will
              analyze and provide personalized insights to help you
              grow.
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">
            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <Bell className="w-5 h-5 text-[#1d1d1f]" />
            </button>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#ece8df] hover:shadow-lg transition-all duration-300">
              <img
                src="https://i.pravatar.cc/100?img=32"
                alt="profile"
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <h3 className="font-bold text-[#1d1d1f]">
                  Reya Doshi
                </h3>

                <p className="text-sm text-slate-500 font-medium">
                  Student
                </p>
              </div>

              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* BANNER */}

        <div className="bg-[#f8f1e5] border border-[#ece3d3] rounded-[2rem] p-8 mb-8 flex items-center justify-between hover:shadow-xl transition-all duration-300">
          <div>
            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-3">
              Analyze Your Career Profile
            </h2>

            <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
              Upload your resume and connect LinkedIn + GitHub to
              receive personalized AI insights, readiness scores,
              and career guidance.
            </p>
          </div>

          <div className="hidden lg:flex w-[230px] h-[140px] rounded-[2rem] bg-white/60 items-center justify-center">
            <Brain className="w-20 h-20 text-[#c4a05d] animate-pulse" />
          </div>
        </div>

        {/* CONNECT */}

        <section className="bg-white border border-[#e8e6e1] rounded-[2rem] p-8 mb-8 shadow-sm">
          <h2 className="text-3xl font-bold text-[#1d1d1f] mb-2">
            Connect Your Profiles
          </h2>

          <p className="text-slate-500 font-medium mb-8">
            Add your professional information to get a comprehensive
            AI analysis.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* RESUME */}

            <div className="border border-[#e8e6e1] rounded-[2rem] p-6 bg-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="flex gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f1ea] flex items-center justify-center">
                  <FileText className="w-7 h-7 text-[#b89968]" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">
                    Resume
                  </h3>

                  <p className="text-sm text-slate-500 font-medium">
                    Upload your latest resume
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    (PDF only)
                  </p>
                </div>
              </div>

              <div className="h-[130px] border border-dashed border-[#d8d4cc] rounded-2xl flex flex-col items-center justify-center text-center hover:bg-[#faf7f2] transition-all duration-300 cursor-pointer">
                <Upload className="w-6 h-6 mb-3 hover:scale-110 transition-all duration-200" />

                <h4 className="font-semibold text-[#1d1d1f]">
                  Upload PDF
                </h4>

                <p className="text-sm text-slate-500">
                  or drag and drop
                </p>
              </div>

              <div className="flex items-center justify-between mt-5">
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Resume uploaded
                </div>

                <button className="text-[#b89968] font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Change
                </button>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {userInfo?.name}_Resume.pdf
              </p>
            </div>

            {/* LINKEDIN */}

            <div className="border border-[#e8e6e1] rounded-[2rem] p-6 bg-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="flex gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#eef5ff] flex items-center justify-center">
                  <img
                    src={linkedinLogo}
                    alt="linkedin"
                    className="w-7 h-7 object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">
                    LinkedIn Profile
                  </h3>

                  <p className="text-sm text-slate-500 font-medium">
                    Add your LinkedIn profile URL
                  </p>
                </div>
              </div>

              <input
                type="text"
                value="https://linkedin.com/in/reyadoshi"
                readOnly
                className="w-full h-12 border border-[#e8e6e1] rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[#b89968]/30 transition-all"
              />

              <div className="flex items-center justify-between mt-5">
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  LinkedIn connected
                </div>

                <button className="text-[#b89968] font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Change
                </button>
              </div>
            </div>

            {/* GITHUB */}

            <div className="border border-[#e8e6e1] rounded-[2rem] p-6 bg-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="flex gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f5f5] flex items-center justify-center">
                  <img
                    src={githubLogo}
                    alt="github"
                    className="w-7 h-7 object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">
                    GitHub Profile
                  </h3>

                  <p className="text-sm text-slate-500 font-medium">
                    Add your GitHub username or URL
                  </p>
                </div>
              </div>

              <input
                type="text"
                value="https://github.com/Reya-Doshi"
                readOnly
                className="w-full h-12 border border-[#e8e6e1] rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[#b89968]/30 transition-all"
              />

              <div className="flex items-center justify-between mt-5">
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  GitHub connected
                </div>

                <button className="text-[#b89968] font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* BUTTON */}

          <button className="w-full h-[76px] bg-[#1d1d1f] rounded-[1.5rem] text-white mt-8 flex flex-col items-center justify-center hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />

              <span className="font-bold text-lg">
                Analyze My Profiles
              </span>
            </div>

            <p className="text-sm text-slate-300">
              Our AI will analyze your resume, LinkedIn & GitHub and
              generate insights.
            </p>
          </button>
        </section>

        {/* RESULTS */}

        <section className="bg-white border border-[#e8e6e1] rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#1d1d1f] mb-2">
                Your AI Analysis Results
              </h2>

              <p className="text-slate-500 font-medium">
                Based on your resume, LinkedIn, and GitHub profile
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              Last analyzed: Today, 11:30 AM

              <RotateCw className="w-4 h-4" />
            </div>
          </div>

          {/* SCORE GRID */}

          <div className="grid lg:grid-cols-5 gap-5 mb-8">
            {/* MAIN SCORE */}

            <div className="border border-[#e8e6e1] rounded-[2rem] p-6 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <h3 className="font-bold text-[#1d1d1f] mb-5">
                Overall Readiness Score
              </h3>

              <div className="w-32 h-32 mx-auto rounded-full border-[8px] border-[#cfa04e] flex items-center justify-center mb-4 hover:scale-105 transition-all duration-300">
                <div>
                  <h2 className="text-4xl font-bold text-[#1d1d1f] leading-none">
                    78
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    /100
                  </p>
                </div>
              </div>

              <h4 className="font-bold text-lg mb-1">Good</h4>

              <p className="text-sm text-slate-500">
                You're on the right track!
              </p>
            </div>

            {[
              {
                title: "Resume Score",
                score: "82",
                status: "Strong",
                color: "bg-purple-500",
                icon: (
                  <FileText className="w-5 h-5 text-purple-500" />
                ),
              },
              {
                title: "LinkedIn Score",
                score: "75",
                status: "Good",
                color: "bg-blue-500",
                icon: (
                  <img
                    src={linkedinLogo}
                    alt="linkedin"
                    className="w-5 h-5"
                  />
                ),
              },
              {
                title: "GitHub Score",
                score: "74",
                status: "Good",
                color: "bg-black",
                icon: (
                  <img
                    src={githubLogo}
                    alt="github"
                    className="w-5 h-5"
                  />
                ),
              },
              {
                title: "Recruiter Visibility",
                score: "71",
                status: "Good",
                color: "bg-green-500",
                icon: (
                  <Eye className="w-5 h-5 text-green-500" />
                ),
              },
            ].map((item, index) => (
              <div
                key={index}
                className="border border-[#e8e6e1] rounded-[2rem] p-5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f5f1ea] flex items-center justify-center mb-5">
                  {item.icon}
                </div>

                <h4 className="font-bold text-[#1d1d1f] mb-4 text-sm leading-snug">
                  {item.title}
                </h4>

                <div className="flex items-end gap-1 mb-2">
                  <h2 className="text-3xl font-bold text-[#1d1d1f] leading-none">
                    {item.score}
                  </h2>

                  <span className="text-sm text-slate-500 mb-1">
                    /100
                  </span>
                </div>

                <p className="text-green-600 font-semibold text-sm mb-5">
                  {item.status}
                </p>

                <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} w-[75%]`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM CARDS */}

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* STRENGTHS */}

            <div className="border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">
                Top Strengths
              </h3>

              <div className="space-y-4">
                {[
                  "Strong technical skills",
                  "Good project diversity",
                  "Consistent GitHub activity",
                  "Relevant experience",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600" />

                    <p className="text-sm text-slate-600 font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <a
                href="/resume"
                className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-8 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                View Full Analysis

                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* IMPROVE */}

            <div className="border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">
                Key Areas to Improve
              </h3>

              <div className="space-y-4">
                {[
                  "Add more connections on LinkedIn",
                  "Improve resume keywords",
                  "Contribute to more open source",
                  "Add more projects",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#cfa04e]" />

                    <p className="text-sm text-slate-600 font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <a
                href="/skill-gap"
                className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-8 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                View Skill Gap

                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* RECOMMENDATIONS */}

            <div className="border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">
                AI Recommendations
              </h3>

              <div className="space-y-4">
                {[
                  "Learn Advanced React",
                  "Improve DSA skills",
                  "Build full stack projects",
                  "Optimize LinkedIn headline",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />

                    <p className="text-sm text-slate-600 font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <a
                href="/road-map"
                className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-8 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                View Recommendations

                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* FOOTER */}

          <div className="bg-[#f8f1e5] border border-[#ece3d3] rounded-[2rem] p-6 flex items-center justify-between hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
                <Eye className="w-7 h-7 text-[#cfa04e]" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#1d1d1f] mb-1">
                  Track your progress regularly
                </h3>

                <p className="text-slate-500 font-medium">
                  Re-analyze your profiles every few weeks to see
                  your improvement.
                </p>
              </div>
            </div>

            <button className="h-12 px-7 bg-[#1d1d1f] text-white rounded-xl flex items-center gap-2 font-semibold hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
              <RotateCw className="w-4 h-4" />

              Re-analyze Now
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}