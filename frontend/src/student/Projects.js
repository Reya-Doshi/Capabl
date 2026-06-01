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
  Trophy,
  Star,
  CheckCircle2,
  Code2,
  Folder,
  Plus,
  X,
  Sparkles,
  Target,
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";

export default function Projects() {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const [projects, setProjects] = useState([]);

  const [recommended, setRecommended] = useState([]);

  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    recommendedProjects: 0,
  });

  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    technologies: "",
    status: "In Progress",
    image: "",
    url: "",
  });

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        apiUrl("/api/projects"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(data.projects || []);
      setRecommended(data.recommendedProjects || []);
      setStats({
        totalProjects: data.stats?.totalProjects || 0,
        completedProjects: data.stats?.completedProjects || 0,
        inProgressProjects: data.stats?.inProgressProjects || 0,
        recommendedProjects: data.stats?.recommendedProjects || 0,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

  }, []);

  const handleProjectInput = (field) => (event) => {
    setProjectForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const openProjectForm = () => {
    setProjectError("");
    setShowProjectForm(true);
  };

  const closeProjectForm = () => {
    if (savingProject) {
      return;
    }

    setShowProjectForm(false);
    setProjectError("");
  };

  const saveProjectMemory = async (event) => {
    event.preventDefault();

    if (!projectForm.title.trim()) {
      setProjectError("Project title is required.");
      return;
    }

    try {
      setSavingProject(true);
      setProjectError("");

      const token = localStorage.getItem("token");

      await axios.post(
        apiUrl("/api/projects"),
        {
          title: projectForm.title,
          description: projectForm.description,
          technologies: projectForm.technologies,
          status: projectForm.status,
          image: projectForm.image,
          url: projectForm.url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjectForm({
        title: "",
        description: "",
        technologies: "",
        status: "In Progress",
        image: "",
        url: "",
      });
      setShowProjectForm(false);
      await fetchProjects();
    } catch (error) {
      setProjectError(
        error.response?.data?.message ||
          "Unable to save project memory right now."
      );
    } finally {
      setSavingProject(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) => {

      const matchesSearch =
        !searchTerm ||
        `${project.title} ${project.description} ${project.tech}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === "completed") {
        return project.status === "Completed";
      }

      if (activeFilter === "progress") {
        return project.status === "In Progress";
      }

      if (activeFilter === "planned") {
        return project.status === "Planned";
      }

      return true;

    }
  );

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
            href="/job-match"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Target className="w-5 h-5" />
            Job Match
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
              AI-powered project tracking and recommendations.
            </p>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">

            <button
              onClick={openProjectForm}
              className="h-12 px-5 rounded-2xl bg-[#1d1d1f] text-white flex items-center gap-2 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            >
              <Plus className="w-4 h-4" />
              Add Project Memory
            </button>

            <div className="h-14 w-[260px] bg-white border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3">

              <Search className="w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search projects..."
                className="bg-transparent outline-none flex-1 text-[15px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

            </div>

            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center relative">

              <Bell className="w-5 h-5 text-[#1d1d1f]" />

            </button>

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-full bg-[#ac731e] flex items-center justify-center text-white font-bold text-lg">

                {(userInfo?.name || "U")
                  .charAt(0)
                  .toUpperCase()}

              </div>

            </div>

          </div>

        </div>

        {showProjectForm && (
          <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_30px_90px_rgba(0,0,0,0.18)] border border-[#ece3d3] overflow-hidden">
              <div className="flex items-start justify-between gap-4 p-6 border-b border-[#f0e7d7] bg-[#faf7f2]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff1cf] text-[#8a6513] text-sm font-semibold mb-3">
                    <Sparkles className="w-4 h-4" />
                    Project memory
                  </div>
                  <h2 className="text-3xl font-semibold text-[#1d1d1f]">
                    Add a non-GitHub project
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">
                    Save a personal or private project here and Capabl will score it the same way it scores your repositories.
                  </p>
                </div>

                <button
                  onClick={closeProjectForm}
                  className="w-11 h-11 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center text-slate-500 hover:text-[#1d1d1f]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveProjectMemory} className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[#1d1d1f]">Project name</span>
                    <input
                      type="text"
                      value={projectForm.title}
                      onChange={handleProjectInput("title")}
                      placeholder="AI Study Planner"
                      className="w-full h-12 px-4 rounded-2xl border border-[#e8e6e1] bg-[#fcfbf9] outline-none focus:border-[#c89a2b]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[#1d1d1f]">Status</span>
                    <select
                      value={projectForm.status}
                      onChange={handleProjectInput("status")}
                      className="w-full h-12 px-4 rounded-2xl border border-[#e8e6e1] bg-[#fcfbf9] outline-none focus:border-[#c89a2b]"
                    >
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Planned</option>
                    </select>
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-[#1d1d1f]">Description</span>
                  <textarea
                    rows="4"
                    value={projectForm.description}
                    onChange={handleProjectInput("description")}
                    placeholder="Describe what it does, who it helps, and what you built."
                    className="w-full px-4 py-3 rounded-2xl border border-[#e8e6e1] bg-[#fcfbf9] outline-none focus:border-[#c89a2b] resize-none"
                  />
                </label>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="space-y-2 block">
                    <span className="text-sm font-semibold text-[#1d1d1f]">Technologies</span>
                    <input
                      type="text"
                      value={projectForm.technologies}
                      onChange={handleProjectInput("technologies")}
                      placeholder="React, Node.js, PostgreSQL"
                      className="w-full h-12 px-4 rounded-2xl border border-[#e8e6e1] bg-[#fcfbf9] outline-none focus:border-[#c89a2b]"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm font-semibold text-[#1d1d1f]">Project link</span>
                    <input
                      type="url"
                      value={projectForm.url}
                      onChange={handleProjectInput("url")}
                      placeholder="https://your-demo-link.com"
                      className="w-full h-12 px-4 rounded-2xl border border-[#e8e6e1] bg-[#fcfbf9] outline-none focus:border-[#c89a2b]"
                    />
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-[#1d1d1f]">Cover image URL</span>
                  <input
                    type="text"
                    value={projectForm.image}
                    onChange={handleProjectInput("image")}
                    placeholder="Optional image link or leave blank to use the default card image"
                    className="w-full h-12 px-4 rounded-2xl border border-[#e8e6e1] bg-[#fcfbf9] outline-none focus:border-[#c89a2b]"
                  />
                </label>

                {projectError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-medium">
                    {projectError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeProjectForm}
                    className="h-12 px-5 rounded-2xl border border-[#e8e6e1] font-semibold text-[#1d1d1f]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProject}
                    className="h-12 px-6 rounded-2xl bg-[#1d1d1f] text-white font-semibold disabled:opacity-60"
                  >
                    {savingProject ? "Saving..." : "Save project memory"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STATS */}

        <div className="grid lg:grid-cols-4 gap-5 mb-8">

          {/* CARD */}

          <div className="bg-[#faf7f2] border border-[#ece3d3] rounded-[2rem] p-6">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-[1.7rem] bg-[#fff1cf] flex items-center justify-center">

                <Folder className="w-9 h-9 text-[#d4a44d]" />

              </div>

              <div>

                <h2 className="text-4xl font-bold">
                  {stats.totalProjects}
                </h2>

                <p className="text-slate-500">
                  Total Projects
                </p>

              </div>

            </div>

          </div>

          {/* CARD */}

          <div className="bg-[#f3faf5] border border-[#dfeee3] rounded-[2rem] p-6">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-[1.7rem] bg-[#dff5e5] flex items-center justify-center">

                <CheckCircle2 className="w-9 h-9 text-green-600" />

              </div>

              <div>

                <h2 className="text-4xl font-bold">
                  {stats.completedProjects}
                </h2>

                <p className="text-slate-500">
                  Completed
                </p>

              </div>

            </div>

          </div>

          {/* CARD */}

          <div className="bg-[#f7f4ff] border border-[#e7e0ff] rounded-[2rem] p-6">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-[1.7rem] bg-[#e8dcff] flex items-center justify-center">

                <Code2 className="w-9 h-9 text-purple-600" />

              </div>

              <div>

                <h2 className="text-4xl font-bold">
                  {stats.inProgressProjects}
                </h2>

                <p className="text-slate-500">
                  In Progress
                </p>

              </div>

            </div>

          </div>

          {/* CARD */}

          <div className="bg-[#f4f8ff] border border-[#dde9ff] rounded-[2rem] p-6">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-[1.7rem] bg-[#dceaff] flex items-center justify-center">

                <Star className="w-9 h-9 text-blue-600" />

              </div>

              <div>

                <h2 className="text-4xl font-bold">
                  {stats.recommendedProjects}
                </h2>

                <p className="text-slate-500">
                  Recommended
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

    <div className="flex items-center gap-3 mb-6 flex-wrap">

      <button
        onClick={() => setActiveFilter("all")}
        className={`h-10 px-6 rounded-full text-sm font-semibold transition-all duration-200 ${
          activeFilter === "all"
            ? "bg-[#1d1d1f] text-white"
            : "bg-white border border-[#e8e6e1]"
        }`}
      >
        All
      </button>

      <button
        onClick={() => setActiveFilter("completed")}
        className={`h-10 px-6 rounded-full text-sm font-semibold transition-all duration-200 ${
          activeFilter === "completed"
            ? "bg-[#1d1d1f] text-white"
            : "bg-white border border-[#e8e6e1]"
        }`}
      >
        Completed
      </button>

      <button
        onClick={() => setActiveFilter("progress")}
        className={`h-10 px-6 rounded-full text-sm font-semibold transition-all duration-200 ${
          activeFilter === "progress"
            ? "bg-[#1d1d1f] text-white"
            : "bg-white border border-[#e8e6e1]"
        }`}
      >
        In Progress
      </button>

      <button
        onClick={() => setActiveFilter("planned")}
        className={`h-10 px-6 rounded-full text-sm font-semibold transition-all duration-200 ${
          activeFilter === "planned"
            ? "bg-[#1d1d1f] text-white"
            : "bg-white border border-[#e8e6e1]"
        }`}
      >
        Planned
      </button>

    </div>

    {/* PROJECT LIST */}

    <div className="space-y-4">

      {loading ? (

        <div className="text-center py-20 text-slate-500 font-medium">
          Loading projects...
        </div>

      ) : filteredProjects.length > 0 ? (

        filteredProjects.map((project, index) => (

          <div
            key={index}
            className="group bg-white border border-[#e8e6e1] rounded-[1.7rem] p-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]"
          >

            {/* LEFT */}

            <div className="flex items-center gap-5">

              <div className="overflow-hidden rounded-2xl">

                <img
                  src={project.image || "/github.jpg"}
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

                {project.breakdown?.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2 max-w-[480px]">
                    {project.breakdown.map((item) => (
                      <span
                        key={item.reason}
                        className="px-3 py-1 rounded-full bg-[#f7f5f2] text-[12px] font-semibold text-slate-600 border border-[#ece6dc]"
                      >
                        {item.reason} +{item.points}
                      </span>
                    ))}
                  </div>
                ) : project.reasons?.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2 max-w-[480px]">
                    {project.reasons.slice(0, 3).map((reason) => (
                      <span
                        key={reason}
                        className="px-3 py-1 rounded-full bg-[#f7f5f2] text-[12px] font-semibold text-slate-600 border border-[#ece6dc]"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                ) : null}

              </div>

            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-5">

              <div className="space-y-3">

                <div className={`px-4 py-1 rounded-full text-sm font-medium inline-flex ${
                  project.status === "Completed"
                    ? "bg-[#e8f8ef] text-green-700"
                    : project.status === "In Progress"
                    ? "bg-[#f3ecff] text-purple-700"
                    : "bg-[#eef5ff] text-blue-700"
                }`}>
                  {project.status}
                </div>

                <div className="px-4 py-1 rounded-full text-sm font-medium inline-flex bg-[#f5f1ea] text-slate-700">
                  {project.score ?? 0}/100
                </div>

                <div className="px-4 py-1 rounded-full text-sm font-medium inline-flex bg-[#fff3df] text-orange-600">
                  {project.tech}
                </div>

              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#c89a2b]" />

            </div>

          </div>

        ))

      ) : (

        <div className="bg-white border border-[#e8e6e1] rounded-[1.7rem] p-8 text-center">
          <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-3">
            No projects synced yet
          </h3>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Add a public GitHub profile or save projects in your profile to populate this section. Once data is available, Capabl will show your repositories, score them, and recommend the next projects to build.
          </p>
        </div>

      )}

      {/* BUTTON */}

      <button className="group w-full h-14 rounded-2xl bg-white border border-[#e8e6e1] font-semibold text-[#1d1d1f] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#faf7f2] hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">

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

      {recommended.length > 0 ? (

  recommended.map((item, index) => (

        <div
          key={index}
          className="group bg-white border border-[#e8e6e1] rounded-[1.7rem] p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:border-[#e4d3b3]"
        >

          <div className="flex gap-4">

            <div className="w-20 h-20 rounded-[1.5rem] bg-[#edf8ef] flex items-center justify-center text-4xl transition-all duration-300 group-hover:scale-110">

              💡

            </div>

            <div>

              <h3 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
                {item.title}
              </h3>

              <p className="text-slate-500 leading-relaxed font-medium mb-4">
                {item.desc}
              </p>

              <div className="inline-flex px-4 py-1 rounded-full text-sm font-medium bg-[#edf8ef] text-green-700">
                {item.tag}
              </div>

            </div>

          </div>

        </div>

     ))

) : (

  <div className="bg-white border border-[#e8e6e1] rounded-[1.7rem] p-6 text-center">
    <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">
      No recommendations yet
    </h3>
    <p className="text-slate-500 font-medium leading-relaxed">
      Complete your profile or connect GitHub so Capabl can suggest the next projects to build.
    </p>
  </div>

)}

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
        AI recommends projects based on your skills and career goals.
      </p>

    </div>

  </div>

  <button
    onClick={openProjectForm}
    className="h-14 px-8 rounded-2xl bg-[#1d1d1f] text-white flex items-center gap-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
  >
    <Plus className="w-4 h-4" />
    Add New Project
  </button>

</div>
      </main>

    </div>

  );

}
