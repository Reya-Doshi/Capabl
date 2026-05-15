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
  ChevronRight,
  Plus,
  Trophy,
  Star,
  CheckCircle2,
  Code2,
  Folder,
} from "lucide-react";

export default function Projects() {
  const userInfo = JSON.parse(
  localStorage.getItem("userInfo")
);
  const projects = [
    {
      title: "Capabl AI Career Platform",
      description:
        "Full-stack AI-powered student career platform with analyzer, roadmap and skill gap system.",
      status: "Completed",
      tech: "React, Node.js, PostgreSQL",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      statusColor: "bg-[#e8f8ef] text-green-700",
      techColor: "bg-[#f3ecff] text-purple-700",
    },

    {
      title: "AI Chatbot Assistant",
      description:
        "AI chatbot capable of answering user queries with NLP-based responses.",
      status: "In Progress",
      tech: "Python, NLP",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
      statusColor: "bg-[#f3ecff] text-purple-700",
      techColor: "bg-[#eef5ff] text-blue-700",
    },

    {
      title: "Task Management App",
      description:
        "Productivity application with reminders, task tracking and progress management.",
      status: "Completed",
      tech: "React, Firebase",
      image:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1200&auto=format&fit=crop",
      statusColor: "bg-[#e8f8ef] text-green-700",
      techColor: "bg-[#fff3df] text-orange-600",
    },
  ];

  const recommended = [
    {
      title: "AI Resume Analyzer",
      desc:
        "Analyze resumes and provide AI suggestions for improvement.",
      tag: "Beginner Friendly",
      color: "bg-[#edf8ef] text-green-700",
      iconBg: "bg-[#edf8ef]",
      icon: "🧠",
    },

    {
      title: "Real-time Chat App",
      desc:
        "Build a real-time chat application with rooms and authentication.",
      tag: "In Demand",
      color: "bg-[#f3ecff] text-purple-700",
      iconBg: "bg-[#f3ecff]",
      icon: "💬",
    },

    {
      title: "Expense Tracker",
      desc:
        "Track income, expenses and visualize financial insights.",
      tag: "Beginner Friendly",
      color: "bg-[#eef5ff] text-blue-700",
      iconBg: "bg-[#eef5ff]",
      icon: "📈",
    },

    {
      title: "Weather Dashboard",
      desc:
        "Get real-time weather updates using weather APIs.",
      tag: "Quick Build",
      color: "bg-[#fff3df] text-orange-600",
      iconBg: "bg-[#fff3df]",
      icon: "☀️",
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

          <span className="text-xl font-bold">Capabl</span>
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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Video className="w-5 h-5" />
            Mock Interview
          </a>

          <a
            href="/projects"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
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
              Projects
            </h1>

            <p className="text-slate-500 text-lg font-medium">
              Build real-world projects, showcase your skills and
              stand out.
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">
            {/* SEARCH */}

            <div className="h-14 w-[260px] bg-white border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search projects..."
                className="bg-transparent outline-none flex-1 text-[15px]"
              />
            </div>

            {/* BELL */}

            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-[#1d1d1f]" />

              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>

            {/* PROFILE */}

            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/100?img=32"
                alt="profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="grid lg:grid-cols-4 gap-5 mb-8">
          {/* CARD */}

          <div className="group bg-[#faf7f2] border border-[#ece3d3] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3] hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[1.7rem] bg-[#fff1cf] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Folder className="w-9 h-9 text-[#d4a44d]" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                  Total Projects
                </h3>

                <h2 className="text-4xl font-bold text-[#1d1d1f] mb-1">
                  08
                </h2>

                <p className="text-slate-500 font-medium">
                  Across all domains
                </p>
              </div>
            </div>
          </div>

          {/* CARD */}

          <div className="group bg-[#f3faf5] border border-[#dfeee3] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:border-[#cfe8d6] hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[1.7rem] bg-[#dff5e5] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                  Completed
                </h3>

                <h2 className="text-4xl font-bold text-[#1d1d1f] mb-1">
                  05
                </h2>

                <p className="text-slate-500 font-medium">
                  Keep it up!
                </p>
              </div>
            </div>
          </div>

          {/* CARD */}

          <div className="group bg-[#f7f4ff] border border-[#e7e0ff] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:border-[#ddd0ff] hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[1.7rem] bg-[#e8dcff] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Code2 className="w-9 h-9 text-purple-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                  In Progress
                </h3>

                <h2 className="text-4xl font-bold text-[#1d1d1f] mb-1">
                  02
                </h2>

                <p className="text-slate-500 font-medium">
                  Keep building!
                </p>
              </div>
            </div>
          </div>

          {/* CARD */}

          <div className="group bg-[#f4f8ff] border border-[#dde9ff] rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:border-[#cfe0ff] hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[1.7rem] bg-[#dceaff] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Star className="w-9 h-9 text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                  Recommended
                </h3>

                <h2 className="text-4xl font-bold text-[#1d1d1f] mb-1">
                  06
                </h2>

                <p className="text-slate-500 font-medium">
                  AI suggested
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="grid lg:grid-cols-[1.8fr,0.9fr] gap-6 mb-8">
          {/* LEFT */}

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold text-[#1d1d1f]">
                Your Projects
              </h2>

              <div className="h-11 px-4 rounded-xl bg-white border border-[#e8e6e1] flex items-center text-sm font-medium">
                Latest First
              </div>
            </div>

            {/* FILTERS */}

            <div className="flex items-center gap-3 mb-6">
              <button className="h-10 px-6 rounded-full bg-[#1d1d1f] text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                All
              </button>

              <button className="h-10 px-6 rounded-full bg-white border border-[#e8e6e1] text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Completed
              </button>

              <button className="h-10 px-6 rounded-full bg-white border border-[#e8e6e1] text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                In Progress
              </button>

              <button className="h-10 px-6 rounded-full bg-white border border-[#e8e6e1] text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Planned
              </button>
            </div>

            {/* PROJECT LIST */}

            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="group bg-white border border-[#e8e6e1] rounded-[1.7rem] p-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]"
                >
                  <div className="flex items-center gap-5">
                    <div className="overflow-hidden rounded-2xl">
                      <img
                        src={project.image}
                        alt="project"
                        className="w-[190px] h-[110px] rounded-2xl object-cover transition-all duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div>
                      <h3 className="text-[28px] font-semibold text-[#1d1d1f] mb-2">
                        {project.title}
                      </h3>

                      <p className="text-slate-500 leading-relaxed font-medium max-w-[480px]">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="space-y-3">
                      <div
                        className={`px-4 py-1 rounded-full text-sm font-medium inline-flex ${project.statusColor}`}
                      >
                        {project.status}
                      </div>

                      <div
                        className={`px-4 py-1 rounded-full text-sm font-medium inline-flex ${project.techColor}`}
                      >
                        {project.tech}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#c89a2b]" />
                  </div>
                </div>
              ))}

              {/* BUTTON */}

              <button className="group w-full h-14 rounded-2xl bg-white border border-[#e8e6e1] font-semibold text-[#1d1d1f] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#faf7f2] hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] active:scale-[0.99]">
                View All Projects

                <ChevronRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* RIGHT */}

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold text-[#1d1d1f]">
                Recommended Projects
              </h2>

              <button className="text-[#c89a2b] font-semibold">
                View all
              </button>
            </div>

            {/* LIST */}

            <div className="space-y-4">
              {recommended.map((item, index) => (
                <div
                  key={index}
                  className="group bg-white border border-[#e8e6e1] rounded-[1.7rem] p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]"
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-20 h-20 rounded-[1.5rem] ${item.iconBg} flex items-center justify-center text-4xl transition-all duration-300 group-hover:scale-110`}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <h3 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
                        {item.title}
                      </h3>

                      <p className="text-slate-500 leading-relaxed font-medium mb-4">
                        {item.desc}
                      </p>

                      <div
                        className={`inline-flex px-4 py-1 rounded-full text-sm font-medium ${item.color}`}
                      >
                        {item.tag}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="bg-[#faf7f2] border border-[#ece3d3] rounded-[2rem] p-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#fff1cf] flex items-center justify-center">
              <Trophy className="w-8 h-8 text-[#d4a44d]" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">
                Build. Learn. Showcase.
              </h2>

              <p className="text-slate-500 font-medium">
                Projects help you apply your skills and increase your
                chances of getting hired.
              </p>
            </div>
          </div>

          <button className="group h-14 px-8 rounded-2xl bg-[#1d1d1f] text-white flex items-center gap-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)] active:scale-95">
            <Plus className="w-5 h-5 transition-all duration-300 group-hover:rotate-90" />
            Add New Project
          </button>
        </div>
      </main>
    </div>
  );
}