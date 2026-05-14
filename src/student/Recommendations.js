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
  Search,
  Bell,
  Briefcase,
  GraduationCap,
  Building2,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Recommendations() {
  const matches = [
    {
      company: "Google",
      role: "Frontend Developer",
      type: "Full-time",
      score: "92%",
      skills: ["React", "JavaScript", "UI/UX"],
      logo:
        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    },

    {
      company: "Microsoft",
      role: "Software Engineer",
      type: "Full-time",
      score: "89%",
      skills: ["Python", "DSA", "System Design"],
      logo:
        "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    },

    {
      company: "Amazon",
      role: "SDE Intern",
      type: "Internship",
      score: "85%",
      skills: ["Java", "DSA", "OOPs"],
      logo:
        "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },

    {
      company: "Deloitte",
      role: "Data Analyst",
      type: "Full-time",
      score: "81%",
      skills: ["SQL", "Excel", "Power BI"],
      logo:
        "https://iconape.com/wp-content/png_logo_vector/deloitte.png",
    },
  ];

  const topSkills = [
    { name: "React.js", score: "92%", width: "92%" },
    { name: "JavaScript", score: "88%", width: "88%" },
    { name: "Node.js", score: "72%", width: "72%" },
    { name: "SQL", score: "65%", width: "65%" },
    { name: "System Design", score: "58%", width: "58%" },
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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>

          <a
            href="/analyzer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all duration-200 hover:translate-x-1 font-medium"
          >
            <Brain className="w-5 h-5" />
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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold duration-200 hover:translate-x-1"
          >
            <Bookmark className="w-5 h-5 text-[#fffffff]" />
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
        {/* HEADER */}

        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
              Recommendations
            </h1>

            <p className="text-slate-500 text-lg font-medium">
              AI-powered personalized career and learning
              recommendations for you.
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">
            {/* SEARCH */}

            <div className="h-14 w-[360px] bg-white border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search opportunities..."
                className="bg-transparent outline-none flex-1 text-[15px]"
              />
            </div>

            {/* BELL */}

            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center transition-all duration-300 hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <Bell className="w-5 h-5 text-[#1d1d1f]" />
            </button>

            {/* PROFILE */}

            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/100?img=32"
                alt="profile"
                className="w-12 h-12 rounded-full object-cover transition-all duration-300 hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)]"
              />

              <div>
                <h3 className="font-semibold text-[#1d1d1f]">
                  Reya Doshi
                </h3>

                <p className="text-sm text-slate-500">
                  Student
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="grid lg:grid-cols-4 gap-5 mb-8">
          {/* CARD */}

          <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 opacity-100 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#d9e8ff] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-[1.5rem] bg-[#eef5ff] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>

              <div>
                <h2 className="text-4xl font-bold text-[#1d1d1f] mb-1">
                  12
                </h2>

                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
                  Career Matches
                </h3>

                <p className="text-slate-500 font-medium">
                  High match score
                </p>
              </div>
            </div>
          </div>

          {/* CARD */}

          <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 opacity-100 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#d6eddc] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-[1.5rem] bg-[#edf8ef] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h2 className="text-4xl font-bold text-[#1d1d1f] mb-1">
                  18
                </h2>

                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
                  Course Suggestions
                </h3>

                <p className="text-slate-500 font-medium">
                  Recommended for you
                </p>
              </div>
            </div>
          </div>

          {/* CARD */}

          <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 opacity-100 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#e4dcff] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-[1.5rem] bg-[#f3ecff] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>

              <div>
                <h2 className="text-4xl font-bold text-[#1d1d1f] mb-1">
                  9
                </h2>

                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
                  Internship Matches
                </h3>

                <p className="text-slate-500 font-medium">
                  Relevant opportunities
                </p>
              </div>
            </div>
          </div>

          {/* CARD */}

          <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 opacity-100 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#ffe4c4] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-[1.5rem] bg-[#fff3df] flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <Star className="w-8 h-8 text-orange-500" />
              </div>

              <div>
                <h2 className="text-4xl font-bold text-[#1d1d1f] mb-1">
                  4
                </h2>

                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
                  Project Ideas
                </h3>

                <p className="text-slate-500 font-medium">
                  Perfect for your skills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="grid lg:grid-cols-[1.8fr,0.95fr] gap-6">
          {/* LEFT */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">
            {/* TABS */}

            <div className="flex items-center gap-3 mb-8">
              <button className="h-11 px-6 rounded-full bg-[#1d1d1f] text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Career Matches
              </button>

              <button className="h-11 px-6 rounded-full bg-[#f7f5f2] text-sm font-medium transition-all duration-300 hover:bg-[#ece7df]">
                Course Suggestions
              </button>

              <button className="h-11 px-6 rounded-full bg-[#f7f5f2] text-sm font-medium transition-all duration-300 hover:bg-[#ece7df]">
                Internships
              </button>

              <button className="h-11 px-6 rounded-full bg-[#f7f5f2] text-sm font-medium transition-all duration-300 hover:bg-[#ece7df]">
                Project Ideas
              </button>
            </div>

            {/* MATCHES */}

            <div className="space-y-4">
              {matches.map((item, index) => (
                <div
                  key={index}
                  className="group border border-[#ececec] rounded-[1.7rem] p-5 flex items-center justify-between transition-all duration-500 opacity-100 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]"
                >
                  {/* LEFT */}

                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-[#ececec] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
                      <img
                        src={item.logo}
                        alt="logo"
                        className="w-12 h-12 object-contain transition-all duration-300 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div>
                      <h2 className="text-[28px] font-semibold text-[#1d1d1f] mb-1">
                        {item.role}
                      </h2>

                      <p className="text-slate-500 font-medium mb-3">
                        {item.company} • {item.type}
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        {item.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-[#f5f5f5] text-sm font-medium text-[#1d1d1f] transition-all duration-300 hover:bg-[#ece7df]"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}

                  <div className="flex items-center gap-8">
                    {/* SCORE */}

                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-[5px] border-green-500 border-l-[#e8f8ef] border-b-[#e8f8ef] flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:rotate-6">
                        <span className="text-sm font-bold">
                          {item.score}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 font-medium">
                        Match Score
                      </p>
                    </div>

                    {/* BUTTON */}

                    <button className="group/bookmark h-12 px-6 rounded-xl border border-[#e8e6e1] font-semibold transition-all duration-300 hover:bg-[#faf7f2] hover:scale-[1.03] active:scale-[0.97]">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTON */}

            <div className="flex justify-center mt-8">
              <button className="group h-14 px-8 rounded-2xl border border-[#e8e6e1] font-semibold flex items-center gap-3 transition-all duration-300 hover:bg-[#faf7f2] hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] active:scale-[0.98]">
                View All Career Matches

                <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            {/* WHY */}

            <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 opacity-100 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">
                Why these recommendations?
              </h2>

              <div className="space-y-6">
                {[
                  "Based on your skills and experience",
                  "Matched with your career goals",
                  "Industry demand and future growth",
                  "AI models analyze real-time data",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 transition-all duration-300 hover:translate-x-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#fff3df] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#c89a2b]" />
                    </div>

                    <p className="text-slate-700 font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SKILLS */}

            <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 opacity-100 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">
                Top In-Demand Skills for You
              </h2>

              <div className="space-y-6 mb-8">
                {topSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="transition-all duration-300 hover:translate-x-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-[#1d1d1f]">
                        {skill.name}
                      </h3>

                      <span className="text-sm font-semibold text-[#1d1d1f]">
                        {skill.score}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-[#ececec] overflow-hidden">
                      <div
                        className="h-full bg-[#d4a44d] rounded-full transition-all duration-500"
                        style={{ width: skill.width }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="group w-full h-14 rounded-2xl border border-[#e8e6e1] font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#faf7f2] hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] active:scale-[0.98]">
                Improve These Skills

                <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}