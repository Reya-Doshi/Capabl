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
  ChevronDown,
  MapPin,
  Mail,
  Calendar,
  CheckCircle2,
  GraduationCap,
  BarChart3,
  Phone,
  Globe,
  Camera,
} from "lucide-react";

export default function Profile() {
  const tabs = [
    "Overview",
    
  ];

  const skills = [
    "JavaScript",
    "React.js",
    "Node.js",
    "Python",
    "SQL",
    "MongoDB",
    "Git",
    "Tailwind CSS",
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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
          >
            <User className="w-5 h-5 text-white" />
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

      <main className="flex-1 lg:ml-[270px]">
        {/* TOPBAR */}

        <div className="h-[86px] bg-white border-b border-[#e8e6e1] px-10 flex items-center justify-between">
          {/* SEARCH */}

          <div className="w-[430px] h-12 bg-[#fafafa] border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />

            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent outline-none flex-1 text-[14px]"
            />
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">
            <button className="w-11 h-11 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-[#1d1d1f]" />

              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#c89a2b] text-white text-[10px] flex items-center justify-center font-bold">
                3
              </div>
            </button>

            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/150?img=32"
                alt="profile"
                className="w-11 h-11 rounded-full object-cover"
              />

              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="px-8 py-7">
          {/* HEADER */}

          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="text-[28px] font-semibold text-[#111111] mb-1">
                My Profile
              </h1>

              <p className="text-[15px] text-[#6b7280] font-normal">
                Manage your personal information and preferences
              </p>
            </div>

            <a
  href="/settings"
  className="h-12 px-6 rounded-2xl border border-[#d4a44d] text-[#c89a2b] flex items-center gap-3 text-[14px] font-semibold hover:bg-[#fff8eb] transition-all"
>
  ✏️ Edit Profile
</a>
          </div>

          {/* PROFILE CARD */}

          <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-7 mb-7">
            <div className="flex items-center justify-between">
              {/* LEFT */}

              <div className="flex items-center gap-8">
                {/* IMAGE */}

                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/250?img=32"
                    alt="profile"
                    className="w-[120px] h-[120px] rounded-full object-cover"
                  />

                  <button className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-white border border-[#ececec] flex items-center justify-center shadow-sm">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                {/* INFO */}

                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-[22px] font-semibold text-[#111111]">
                      Reya Doshi
                    </h2>

                    <div className="h-8 px-3 rounded-full bg-[#e8f8ef] text-green-700 flex items-center gap-2 text-[12px] font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Verified
                    </div>
                  </div>

                  <p className="text-[15px] text-slate-700 font-medium mb-4">
                    Aspiring Full Stack Developer
                  </p>

                  <div className="flex items-center gap-6 text-slate-500 font-medium text-[14px]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Hyderabad, India
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      reya@gmail.com
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined May 2025
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <div className="w-[320px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[16px] font-semibold text-[#111111]">
                    Profile Completion
                  </h3>

                  <span className="text-[#c89a2b] text-[16px] font-semibold">
                    85%
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-[#ece7df] overflow-hidden mb-4">
                  <div className="w-[85%] h-full bg-[#c89a2b] rounded-full"></div>
                </div>

                <p className="text-[#6b7280] text-[14px] leading-6">
                  Great! Complete your profile to get better AI
                  recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* TABS */}

          <div className="flex items-center gap-4 border-b border-[#ececec] mb-7">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`pb-4 px-1 text-[14px] font-medium transition-all ${
                  index === 0
                    ? "text-[#c89a2b] border-b-2 border-[#c89a2b]"
                    : "text-[#6b7280] hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* GRID */}

          <div className="grid lg:grid-cols-[1fr,1fr,1fr] gap-5">
            {/* ABOUT */}

            <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-6">
              <h2 className="text-[18px] font-semibold text-[#111111] mb-6">
                About Me
              </h2>

              <p className="text-[14px] text-[#6b7280] leading-7 mb-7">
                A passionate and curious developer who loves
                building real-world solutions. I enjoy learning new
                technologies and turning ideas into products.
              </p>

              <div className="border-t border-[#ececec] pt-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[12px] text-slate-400 mb-2">
                      Phone
                    </p>

                    <h3 className="text-[15px] font-medium">
                      +91 98765 43210
                    </h3>
                  </div>

                  <div>
                    <p className="text-[12px] text-slate-400 mb-2">
                      Languages
                    </p>

                    <h3 className="text-[15px] font-medium">
                      English, Hindi
                    </h3>
                  </div>
                </div>
              </div>

              {/* SOCIAL */}

              <div className="flex items-center gap-4 mt-6">
                <img
                  src="/linkedin.jpg"
                  alt="LinkedIn"
                  className="w-11 h-11 rounded-full object-cover border border-[#ece7dc] p-2 bg-white"
                />

                <img
                  src="/github.jpg"
                  alt="GitHub"
                  className="w-11 h-11 rounded-full object-cover border border-[#ece7dc] p-2 bg-white"
                />

                <button className="w-11 h-11 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* EDUCATION + SKILLS */}

            <div className="space-y-5">
              {/* EDUCATION */}

              <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-6">
                <h2 className="text-[18px] font-semibold text-[#111111] mb-6">
                  Education
                </h2>

                <div className="border border-[#ececec] rounded-2xl p-5">
                  <h3 className="text-[17px] font-semibold mb-2">
                    B.Tech in Information Technology
                  </h3>

                  <p className="text-[14px] text-[#6b7280] mb-3">
                    Brewc College of Engineering for Women,
                    Hyderabad
                  </p>

                  <div className="flex items-center gap-4">
                    <span className="text-[13px] text-slate-500">
                      2024 - 2028
                    </span>

                    <div className="px-3 py-1 rounded-full bg-[#e8f8ef] text-green-700 text-[12px] font-semibold">
                      Full Time
                    </div>
                  </div>
                </div>
              </div>

              {/* SKILLS */}

              <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-[#111111]">
                    Skills
                  </h2>

                  <button className="text-[#c89a2b] text-[13px] font-semibold">
                    View All
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 rounded-full bg-[#f7f5f2] text-[13px] font-medium"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STATS */}

            <div className="space-y-5">
              {/* QUICK STATS */}

              <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-6">
                <h2 className="text-[18px] font-semibold text-[#111111] mb-6">
                  Quick Stats
                </h2>

                <div className="space-y-5">
                  {[
                    ["Readiness Score", "78%"],
                    ["Projects Completed", "6"],
                    ["Certificates", "4"],
                    ["Mock Interviews", "3"],
                    ["Profile Views", "120+"],
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <p className="text-[14px] text-[#6b7280]">
                        {item[0]}
                      </p>

                      <span className="text-[16px] font-semibold">
                        {item[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BADGES */}

              <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-[#111111]">
                    Badges
                  </h2>

                  <button className="text-[#c89a2b] text-[13px] font-semibold">
                    View All
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {["🥇", "🟣", "🔵", "🟢"].map(
                    (badge, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 rounded-2xl bg-[#f7f5f2] flex items-center justify-center text-3xl"
                      >
                        {badge}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}