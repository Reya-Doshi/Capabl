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
  PlayCircle,
  CheckCircle2,
  Code2,
  Briefcase,
  MessagesSquare,
  LineChart,
  ArrowRight,
} from "lucide-react";

export default function Interview() {
  const interviewTypes = [
    {
      title: "Technical Interview",
      description: "DSA, Algorithms, System Design & more",
      color: "bg-[#f3ecff]",
      text: "text-purple-600",
      button: "bg-[#f3ecff] text-purple-700",
      icon: <Code2 className="w-7 h-7 text-purple-600" />,
    },

    {
      title: "HR Interview",
      description: "HR questions, behavior and motivation",
      color: "bg-[#edf8ef]",
      text: "text-green-600",
      button: "bg-[#edf8ef] text-green-700",
      icon: <Briefcase className="w-7 h-7 text-green-600" />,
    },

    {
      title: "Behavioral Interview",
      description: "Situational, behavioral & soft skills",
      color: "bg-[#fff3df]",
      text: "text-orange-500",
      button: "bg-[#fff3df] text-orange-600",
      icon: <MessagesSquare className="w-7 h-7 text-orange-500" />,
    },

    {
      title: "Custom Interview",
      description: "Create your own custom interview",
      color: "bg-[#eef5ff]",
      text: "text-blue-600",
      button: "bg-[#eef5ff] text-blue-700",
      icon: <LineChart className="w-7 h-7 text-blue-600" />,
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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <FileText className="w-5 h-5" />
            Resume
          </a>

          <a
            href="/interview"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
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
              Mock Interview
            </h1>

            <p className="text-slate-500 text-lg font-medium">
              Practice real interviews with AI and improve your
              confidence.
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">
            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-[#1d1d1f]" />

              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#d4a44d] text-white text-[10px] flex items-center justify-center font-bold">
                3
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

        {/* HERO */}

        <div className="bg-[#faf7f2] border border-[#ece3d3] rounded-[2rem] p-8 mb-8">
          <div className="grid lg:grid-cols-[1.2fr,1fr,0.9fr] gap-8 items-center">
            {/* LEFT */}

            <div>
              <h2 className="text-5xl font-bold text-[#1d1d1f] leading-tight mb-5">
                Get Interview Ready with AI
              </h2>

              <p className="text-slate-600 text-xl leading-relaxed mb-8 font-medium">
                Realistic questions, instant feedback and
                performance insights.
              </p>

              <button className="h-14 px-8 rounded-2xl bg-[#1d1d1f] text-white flex items-center gap-3 font-semibold hover:opacity-90 transition-all">
                <PlayCircle className="w-5 h-5" />
                Start New Interview
              </button>
            </div>

            {/* CENTER */}

            <div className="bg-white border border-[#ece3d3] rounded-[1.7rem] p-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1d1d1f] text-white flex items-center justify-center font-semibold">
                  AI
                </div>

                <h3 className="text-xl font-semibold text-[#1d1d1f]">
                  AI Interviewer
                </h3>
              </div>

              <div className="h-20 bg-[#f5f1ea] rounded-xl mb-6 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 rounded-full bg-[#d4a44d]"></div>
                  <div className="w-2 h-14 rounded-full bg-[#d4a44d]"></div>
                  <div className="w-2 h-10 rounded-full bg-[#d4a44d]"></div>
                  <div className="w-2 h-16 rounded-full bg-[#d4a44d]"></div>
                  <div className="w-2 h-8 rounded-full bg-[#d4a44d]"></div>
                  <div className="w-2 h-5 rounded-full bg-[#d4a44d]"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button className="w-12 h-12 rounded-full bg-[#f5f1ea] flex items-center justify-center">
                  🎤
                </button>

                <button className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center">
                  📞
                </button>

                <button className="w-12 h-12 rounded-full bg-[#f5f1ea] flex items-center justify-center">
                  📹
                </button>
              </div>
            </div>

            {/* RIGHT */}

            <div className="bg-white border border-[#ece3d3] rounded-[1.7rem] p-5">
              <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-6">
                Why Mock Interviews?
              </h3>

              <div className="space-y-5">
                {[
                  "AI-powered real-time interview",
                  "Industry specific questions",
                  "Detailed performance feedback",
                  "Improve communication skills",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600" />

                    <p className="text-slate-700 font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
<div className="grid lg:grid-cols-[0.9fr,0.9fr,0.9fr,0.9fr,1.05fr] gap-4 mb-10">
  {/* TYPES */}

  {interviewTypes.map((item, index) => (
    <div
      key={index}
      className="bg-white border border-[#e8e6e1] rounded-[1.7rem] p-5"
    >
      <div
        className={`w-14 h-14 rounded-[1.3rem] ${item.color} flex items-center justify-center mb-5`}
      >
        {item.icon}
      </div>

      <h3 className="text-[22px] font-semibold text-[#1d1d1f] mb-3 leading-snug">
        {item.title}
      </h3>

      <p className="text-slate-500 leading-relaxed mb-6 font-medium text-[15px]">
        {item.description}
      </p>

      <button
        className={`w-full h-11 rounded-xl font-semibold text-[15px] transition-all ${item.button}`}
      >
        Start Interview
      </button>
    </div>
  ))}

  {/* PERFORMANCE */}

  <div className="bg-white border border-[#e8e6e1] rounded-[1.7rem] p-5">
    <h2 className="text-[22px] font-semibold text-[#1d1d1f] mb-6">
      Your Performance
    </h2>

    <div className="flex justify-center mb-6">
      <div className="w-36 h-36 rounded-full border-[10px] border-green-500 border-l-[#e8f8ef] border-b-[#e8f8ef] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#1d1d1f]">
            72%
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Overall Score
          </p>
        </div>
      </div>
    </div>

    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 font-medium text-[15px]">
          Interviews Taken
        </p>

        <p className="font-semibold text-[#1d1d1f]">
          12
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-slate-500 font-medium text-[15px]">
          Avg. Score
        </p>

        <p className="font-semibold text-[#1d1d1f]">
          72%
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-slate-500 font-medium text-[15px]">
          Best Score
        </p>

        <p className="font-semibold text-[#1d1d1f]">
          88%
        </p>
      </div>
    </div>

    <button className="text-[#c89a2b] font-semibold flex items-center gap-2 text-[15px]">
      View Performance

      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
</div>
        {/* TABLE */}

        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] overflow-hidden">
          {/* TOP */}

          <div className="flex items-center justify-between px-8 py-6 border-b border-[#f1f1f1]">
            <h2 className="text-3xl font-semibold text-[#1d1d1f]">
              Recent Interviews
            </h2>

            <button className="text-[#c89a2b] font-semibold flex items-center gap-2">
              View All Interviews

              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#f1f1f1]">
                  <th className="px-8 py-5 text-slate-500 font-semibold">
                    Interview
                  </th>

                  <th className="px-6 py-5 text-slate-500 font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-5 text-slate-500 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-5 text-slate-500 font-semibold">
                    Score
                  </th>

                  <th className="px-6 py-5 text-slate-500 font-semibold">
                    Feedback
                  </th>

                  <th className="px-6 py-5 text-slate-500 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* ROW */}

                <tr className="border-b border-[#f1f1f1]">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#f3ecff] flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-purple-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#1d1d1f]">
                          Frontend Developer Interview
                        </h3>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="inline-flex px-4 py-1 rounded-full bg-[#f3ecff] text-purple-700 text-sm font-medium">
                      Technical
                    </div>
                  </td>

                  <td className="px-6 py-6 text-slate-500 font-medium">
                    12 May, 2025
                  </td>

                  <td className="px-6 py-6 font-semibold text-green-600">
                    78%
                  </td>

                  <td className="px-6 py-6">
                    <div className="inline-flex px-4 py-1 rounded-full bg-[#e8f8ef] text-green-700 text-sm font-medium">
                      Good
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <button className="h-11 px-5 rounded-xl border border-[#d4a44d] text-[#c89a2b] font-semibold hover:bg-[#fff8eb] transition-all">
                      View Report
                    </button>
                  </td>
                </tr>

                {/* ROW */}

                <tr>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#edf8ef] flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-green-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#1d1d1f]">
                          HR Round Interview
                        </h3>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="inline-flex px-4 py-1 rounded-full bg-[#edf8ef] text-green-700 text-sm font-medium">
                      HR
                    </div>
                  </td>

                  <td className="px-6 py-6 text-slate-500 font-medium">
                    10 May, 2025
                  </td>

                  <td className="px-6 py-6 font-semibold text-orange-500">
                    65%
                  </td>

                  <td className="px-6 py-6">
                    <div className="inline-flex px-4 py-1 rounded-full bg-[#fff3df] text-orange-600 text-sm font-medium">
                      Average
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <button className="h-11 px-5 rounded-xl border border-[#d4a44d] text-[#c89a2b] font-semibold hover:bg-[#fff8eb] transition-all">
                      View Report
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}