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
} from "lucide-react";

export default function SkillGap() {
  const skills = [
    {
      name: "React",
      level: "Intermediate",
      required: "Advanced",
      gap: "40%",
      color: "bg-yellow-400",
    },

    {
      name: "Next.js",
      level: "Beginner",
      required: "Advanced",
      gap: "70%",
      color: "bg-red-400",
    },

    {
      name: "TypeScript",
      level: "Intermediate",
      required: "Advanced",
      gap: "40%",
      color: "bg-yellow-400",
    },

    {
      name: "Node.js",
      level: "Intermediate",
      required: "Advanced",
      gap: "40%",
      color: "bg-yellow-400",
    },

    {
      name: "MongoDB",
      level: "Beginner",
      required: "Intermediate",
      gap: "60%",
      color: "bg-orange-400",
    },

    {
      name: "System Design",
      level: "Beginner",
      required: "Advanced",
      gap: "70%",
      color: "bg-red-400",
    },

    {
      name: "AWS",
      level: "Beginner",
      required: "Intermediate",
      gap: "60%",
      color: "bg-orange-400",
    },
  ];

  const recommendations = [
    "Master Next.js",
    "System Design Fundamentals",
    "AWS Cloud Practitioner",
    "Advanced TypeScript",
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

          <span className="text-xl font-bold">Capabl</span>
        </a>

        {/* NAV */}

        <div className="space-y-2">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>

          <a
            href="/analyzer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
          >
            <Brain className="w-5 h-5" />
            AI Analyzer
          </a>

          <a
            href="/road-map"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
          >
            <Route className="w-5 h-5" />
            Roadmap
          </a>

          <a
            href="/skill-gap"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold shadow-lg"
          >
            <FileSearch className="w-5 h-5 text-white" />
            Skill Gap
          </a>

          <a
            href="/resume"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
          >
            <FileText className="w-5 h-5" />
            Resume
          </a>

          <a
            href="/interview"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
          >
            <Video className="w-5 h-5" />
            Mock Interview
          </a>

          <a
            href="/projects"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
          >
            <FolderKanban className="w-5 h-5" />
            Projects
          </a>

          <a
            href="/recommendations"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
          >
            <Bookmark className="w-5 h-5" />
            Recommendations
          </a>

          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
          >
            <User className="w-5 h-5" />
            Profile
          </a>

          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] hover:translate-x-1 transition-all duration-300 font-medium"
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
            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
              Skill Gap
            </h1>

            <p className="text-slate-500 text-lg font-medium">
              Identify your skill gaps and bridge them with
              personalized recommendations.
            </p>
          </div>

          {/* PROFILE */}

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
                <h3 className="font-semibold text-[#1d1d1f]">
                  Reya Doshi
                </h3>

                <p className="text-sm text-slate-500">
                  Student
                </p>
              </div>

              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="grid lg:grid-cols-4 gap-5 mb-8">
          {/* CARD */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#f5edff] flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-purple-500" />
              </div>
            </div>

            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Overall Match Score
            </h3>

            <h2 className="text-4xl font-bold text-purple-500 mb-4">
              68%
            </h2>

            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div className="w-[68%] h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out hover:w-[72%]"></div>
            </div>

            <p className="text-sm text-slate-500">
              Good
            </p>
          </div>

          {/* CARD */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CheckCircle2 className="w-10 h-10 text-green-500 mb-5" />

            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Skills You Have
            </h3>

            <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">
              32
            </h2>

            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div className="w-[75%] h-full bg-green-500 rounded-full transition-all duration-1000 ease-out hover:w-[80%]"></div>
            </div>

            <p className="text-sm text-green-600 font-medium">
              Strong
            </p>
          </div>

          {/* CARD */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <TriangleAlert className="w-10 h-10 text-orange-400 mb-5" />

            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Skills Missing
            </h3>

            <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">
              16
            </h2>

            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div className="w-[60%] h-full bg-orange-400 rounded-full transition-all duration-1000 ease-out hover:w-[65%]"></div>
            </div>

            <p className="text-sm text-orange-500 font-medium">
              Need Improvement
            </p>
          </div>

          {/* CARD */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Target className="w-10 h-10 text-blue-500 mb-5" />

            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Top Priority Gaps
            </h3>

            <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">
              6
            </h2>

            <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden mb-3">
              <div className="w-[70%] h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out hover:w-[75%]"></div>
            </div>

            <p className="text-sm text-slate-500">
              Focus Areas
            </p>
          </div>
        </div>

        {/* MAIN GRID */}

        <div className="grid lg:grid-cols-[1.5fr,1fr] gap-6 mb-8">
          {/* BREAKDOWN */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
              Skill Gap Breakdown
            </h2>

            <div className="space-y-5">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center gap-5 border-b border-[#f2f2f2] pb-4 rounded-2xl px-3 py-3 hover:bg-[#faf8f4] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <h3 className="font-medium text-[#1d1d1f]">
                    {skill.name}
                  </h3>

                  <div>
                    <p className="text-sm text-slate-500 mb-2">
                      {skill.level}
                    </p>

                    <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${skill.color} w-[40%] transition-all duration-1000 ease-out hover:w-[50%]`}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-2">
                      {skill.required}
                    </p>

                    <div className="w-full h-2 rounded-full bg-[#ececec] overflow-hidden">
                      <div className="h-full rounded-full bg-green-500 w-[80%] transition-all duration-1000 ease-out hover:w-[85%]"></div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="px-4 py-2 rounded-full bg-[#fff3df] text-[#c89a2b] text-sm font-semibold hover:scale-105 transition-all duration-200">
                      {skill.gap}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-7 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              View Full Skill Gap Analysis

              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* PRIORITY */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
              Top Priority Gaps
            </h2>

            <div className="space-y-5">
              {[
                "Next.js",
                "System Design",
                "AWS",
                "MongoDB",
                "TypeScript",
                "Node.js Advanced",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#faf8f4] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f5f1ea] flex items-center justify-center font-semibold text-[#c89a2b]">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1d1d1f]">
                        {item}
                      </h3>

                      <p className="text-sm text-slate-500">
                        High Demand • High Impact
                      </p>
                    </div>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-[#fff3df] text-[#c89a2b] text-sm font-medium">
                    High
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-7 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              View All Gaps

              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM */}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* RECOMMENDED */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-[#c89a2b]" />

              <h2 className="text-2xl font-bold text-[#1d1d1f]">
                Recommended for You
              </h2>
            </div>

            <div className="space-y-5">
              {recommendations.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-[#f2f2f2] rounded-2xl p-4 hover:-translate-y-2 hover:shadow-xl hover:border-[#e7dcc7] transition-all duration-300 bg-white"
                >
                  <div>
                    <h3 className="font-semibold text-[#1d1d1f] mb-1">
                      {item}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Personalized learning recommendation
                    </p>
                  </div>

                  <button className="px-5 h-10 rounded-xl bg-[#1d1d1f] text-white text-sm font-medium hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg">
                    Start
                  </button>
                </div>
              ))}
            </div>

            <a
  href="/road-map"
  className="w-full h-12 border border-[#e8e6e1] rounded-xl mt-7 flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
>
  View Learning Roadmap

  <ArrowRight className="w-4 h-4" />
</a>
          </div>

          {/* PROGRESS */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
              Learning Path Progress
            </h2>

            <div className="flex items-center justify-center mb-8">
              <div className="w-52 h-52 rounded-full border-[14px] border-green-500 border-t-orange-400 border-r-red-400 flex items-center justify-center hover:scale-105 transition-all duration-500">
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-[#1d1d1f]">
                    42%
                  </h2>

                  <p className="text-sm text-slate-500 mt-2">
                    Overall Progress
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-7">
              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>

                  <p className="text-sm text-slate-500">
                    Completed
                  </p>
                </div>

                <p className="font-semibold text-[#1d1d1f]">
                  14 Skills
                </p>
              </div>

              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>

                  <p className="text-sm text-slate-500">
                    In Progress
                  </p>
                </div>

                <p className="font-semibold text-[#1d1d1f]">
                  8 Skills
                </p>
              </div>

              <div className="flex items-center justify-between hover:bg-[#faf8f4] rounded-xl px-3 py-2 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>

                  <p className="text-sm text-slate-500">
                    Yet to Start
                  </p>
                </div>

                <p className="font-semibold text-[#1d1d1f]">
                  16 Skills
                </p>
              </div>
            </div>

            <a
  href="/road-map"
  className="w-full h-12 border border-[#e8e6e1] rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-[#f5f1ea] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
>
  View Full Roadmap

  <ArrowRight className="w-4 h-4" />
</a>
          </div>
        </div>

        {/* FOOTER */}

        <div className="bg-[#f8f1e5] border border-[#ece3d3] rounded-[2rem] p-6 flex items-center justify-between hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
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

          <button className="h-12 px-7 bg-[#1d1d1f] text-white rounded-xl flex items-center gap-2 font-semibold hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-md hover:shadow-xl">
            Explore Roadmap

            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}