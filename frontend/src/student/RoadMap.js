import {
  LayoutDashboard,
  Brain,
  Route,
  FileSearch,
  FileText,
  Video,
  FolderKanban,
  Briefcase,
  Bookmark,
  User,
  Settings,
  Bell,
  ChevronDown,
  TrendingUp,
  Clock3,
  Flag,
  BriefcaseBusiness,
  Check,
  PlayCircle,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function RoadMap() {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const studentName = userInfo?.name;

  const stages = [
    {
      stage: "Stage 1",
      title: "Foundations",
      status: "Completed",
      completed: true,
      description: "Build strong foundational knowledge.",
      skills: ["HTML", "CSS", "JavaScript Basics", "Git & GitHub"],
      button: "Review",
    },

    {
      stage: "Stage 2",
      title: "Core Skills",
      status: "In Progress",
      active: true,
      progress: "60%",
      description: "Learn the core technologies and tools.",
      skills: ["React.js", "Node.js", "Express.js", "MongoDB"],
      button: "Continue",
    },

    {
      stage: "Stage 3",
      title: "Advanced Concepts",
      status: "Locked",
      locked: true,
      description: "Deep dive into advanced concepts.",
      skills: [
        "Authentication",
        "Data Structures",
        "System Design",
        "API Design",
      ],
      button: "Upcoming",
    },

    {
      stage: "Stage 4",
      title: "Real World Projects",
      status: "Locked",
      locked: true,
      description: "Build real-world projects and gain experience.",
      skills: ["Project 1", "Project 2", "Project 3"],
      button: "Upcoming",
    },

    {
      stage: "Stage 5",
      title: "Placement Ready",
      status: "Locked",
      locked: true,
      description: "Prepare for interviews and land your dream job.",
      skills: [
        "Mock Interviews",
        "Resume Review",
        "Job Applications",
      ],
      button: "Upcoming",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex">
      {/* SIDEBAR */}
      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">
        {/* LOGO */}

        <a href="/" className="flex items-center gap-2 mb-12">
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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
          >
            <Route className="w-5 h-5 text-white" />
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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <FileText className="w-5 h-5" />
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
        {/* TOP */}

        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#1d1d1f] leading-tight mb-3">
              Your Personalized Roadmap
            </h1>

            <p className="text-slate-500 text-lg font-medium">
              Step-by-step guide to help you achieve your dream role
            </p>
          </div>

          {/* PROFILE */}

          <div className="flex items-center gap-5">
            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center relative transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <Bell className="w-5 h-5 text-[#1d1d1f]" />

              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#c89a2b] text-white text-[10px] flex items-center justify-center font-bold">
                2
              </div>
            </button>

            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/100?img=32"
                alt="profile"
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <h3 className="font-semibold text-[#1d1d1f]">
                  {studentName}
                </h3>

                <p className="text-sm text-slate-500">
                  Student
                </p>
              </div>

              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

{/* TOP CARDS */}

<div className="grid lg:grid-cols-4 gap-5 mb-10">
  {/* CARD */}

  <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-2xl hover:shadow-[#c89a2b]/10">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-[#1d1d1f]">
        Overall Progress
      </h3>

      <div className="w-12 h-12 rounded-2xl bg-[#f8f1e5] flex items-center justify-center">
        <TrendingUp className="w-5 h-5 text-[#c89a2b]" />
      </div>
    </div>

    <h2 className="text-4xl font-bold text-[#c89a2b] mb-4">
      62%
    </h2>

    <div className="w-full h-3 rounded-full bg-[#ece6dc] overflow-hidden mb-3">
      <div className="w-[62%] h-full bg-[#c89a2b] rounded-full transition-all duration-1000 ease-out"></div>
    </div>

    <p className="text-sm text-slate-500">
      Keep going! You're doing great.
    </p>
  </div>

  {/* CARD */}

  <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-2xl hover:shadow-[#c89a2b]/10">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-[#1d1d1f]">
        Estimated Time
      </h3>

      <div className="w-12 h-12 rounded-2xl bg-[#f8f1e5] flex items-center justify-center">
        <Clock3 className="w-5 h-5 text-[#c89a2b]" />
      </div>
    </div>

    <h2 className="text-3xl font-bold text-[#1d1d1f] mb-4">
      3.5 Months
    </h2>

    <p className="text-sm text-slate-500">
      To reach your goal
    </p>
  </div>

  {/* CARD */}

  <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-2xl hover:shadow-green-200/40">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-[#1d1d1f]">
        Current Stage
      </h3>

      <div className="w-12 h-12 rounded-2xl bg-[#edf8ef] flex items-center justify-center">
        <Flag className="w-5 h-5 text-green-600" />
      </div>
    </div>

    <h2 className="text-3xl font-bold text-[#1d1d1f] mb-4">
      2 of 5
    </h2>

    <p className="text-sm text-slate-500">
      Core Skills
    </p>
  </div>

  {/* CARD */}

  <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-2xl hover:shadow-purple-200/40">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-[#1d1d1f]">
        Target Role
      </h3>

      <div className="w-12 h-12 rounded-2xl bg-[#f4efff] flex items-center justify-center">
        <BriefcaseBusiness className="w-5 h-5 text-purple-500" />
      </div>
    </div>

    <h2 className="text-2xl font-bold text-[#1d1d1f] leading-tight mb-3">
      Full Stack Developer
    </h2>

    <p className="text-sm text-slate-500">
      Next: Advanced Concepts
    </p>
  </div>
</div>


        {/* ROADMAP */}

        <div className="flex items-center justify-between mb-7">
          <h2 className="text-3xl font-bold text-[#1d1d1f]">
            Roadmap Stages
          </h2>

          <button className="h-12 px-6 bg-white border border-[#e8e6e1] rounded-xl font-semibold hover:bg-[#f5f1ea] transition-all flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            View Full Plan

            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* STAGES */}

        <div className="space-y-5 mb-8">
          {stages.map((stage, index) => (
            <div
              key={index}
              className="flex gap-6 opacity-0 animate-[fadeIn_0.6s_ease_forwards]"
              style={{
                animationDelay: `${index * 0.12}s`,
              }}
            >
              {/* LEFT */}

              <div className="w-[240px] flex gap-5">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold ${
                      stage.completed
                        ? "bg-green-500 text-white"
                        : stage.active
                        ? "bg-[#c89a2b] text-white"
                        : "bg-[#d9d9d9] text-[#555]"
                    }`}
                  >
                    {stage.completed ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {index !== stages.length - 1 && (
                    <div className="w-[2px] h-[90px] bg-[#d9d9d9]"></div>
                  )}
                </div>

                <div className="pt-1">
                  <p className="text-sm text-slate-500">
                    {stage.stage}
                  </p>

                  <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                    {stage.title}
                  </h3>

                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      stage.completed
                        ? "bg-[#e7f7ea] text-green-600"
                        : stage.active
                        ? "bg-[#fff3df] text-[#c89a2b]"
                        : "bg-[#f1f1f1] text-slate-500"
                    }`}
                  >
                    {stage.status}
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <div
                className={`flex-1 border rounded-[2rem] p-6 transition-all duration-300 ${
                  stage.active
                    ? "border-[#e7c47c] bg-[#fffdfa] hover:-translate-y-1 hover:shadow-2xl"
                    : stage.locked
                    ? "border-[#e8e6e1] bg-white hover:opacity-90 hover:shadow-md"
                    : "border-[#e8e6e1] bg-white hover:-translate-y-1 hover:shadow-2xl"
                }`}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex-1">
                    <p className="text-slate-600 mb-5 font-medium">
                      {stage.description}
                    </p>

                    {/* PROGRESS */}

                    {stage.active && (
                      <div className="flex items-center gap-4 mb-5">
                        <div className="flex-1 h-3 rounded-full bg-[#ece6dc] overflow-hidden">
                          <div className="w-[60%] h-full bg-[#c89a2b] rounded-full transition-all duration-1000 ease-out"></div>
                        </div>

                        <span className="font-semibold text-[#c89a2b]">
                          60%
                        </span>
                      </div>
                    )}

                    {/* SKILLS */}

                    <div className="flex flex-wrap gap-3">
                      {stage.skills.map((skill, skillIndex) => (
                        <div
                          key={skillIndex}
                          className="px-4 py-2 rounded-xl border border-[#e8e6e1] bg-[#fafafa] flex items-center gap-2 text-sm font-medium"
                        >
                          {stage.locked ? (
                            <Lock className="w-4 h-4 text-slate-500" />
                          ) : stage.active ? (
                            <PlayCircle className="w-4 h-4 text-[#c89a2b]" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600" />
                          )}

                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className={`px-6 h-11 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      stage.active
                        ? "bg-[#c89a2b] text-white hover:opacity-90"
                        : "bg-white border border-[#e8e6e1] hover:bg-[#f5f1ea]"
                    }`}
                  >
                    {stage.button}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI RECOMMENDATIONS */}

        <div className="bg-gradient-to-r from-[#f6f0ff] to-[#faf7ff] border border-[#e9dcff] rounded-[2rem] p-7">
          <div className="flex items-start justify-between gap-8">
            <div className="flex gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#1d1d1f] mb-3">
                  AI Recommendations for Reya
                </h3>

                <p className="text-slate-600 font-medium mb-5 max-w-3xl leading-relaxed">
                  Based on your current progress, the AI recommends
                  focusing more on backend development and project
                  building to become placement-ready faster.
                </p>

                <div className="flex flex-wrap gap-3">
                  {[
                    "Build 2 Full Stack Projects",
                    "Practice DSA Daily",
                    "Learn PostgreSQL + Prisma",
                    "Deploy Projects on Vercel",
                    "Improve API Design Skills",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 rounded-xl bg-white border border-[#e9dcff] text-sm font-medium text-[#5c3fc9]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="h-12 px-6 rounded-xl bg-[#6d4aff] text-white font-semibold hover:opacity-90 transition-all whitespace-nowrap">
              Update Goal
            </button>
          </div>
        </div>

        {/* ANIMATION STYLE */}

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </main>
    </div>
  );
}