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

import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";

export default function Recommendations() {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const [matches, setMatches] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  const [whyRecommendations, setWhyRecommendations] = useState([]);

  const [stats, setStats] = useState({
    careerMatches: 0,
    courseSuggestions: 0,
    internshipMatches: 0,
    projectIdeas: 0,
  });

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("career");

  useEffect(() => {

    const fetchRecommendations = async () => {

      try {

        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          apiUrl("/api/recommendations"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMatches(data.matches || []);

        setTopSkills(data.topSkills || []);

        setWhyRecommendations(
          data.whyRecommendations || []
        );

        setStats({
          careerMatches:
            data.stats?.careerMatches || 0,

          courseSuggestions:
            data.stats?.courseSuggestions || 0,

          internshipMatches:
            data.stats?.internshipMatches || 0,

          projectIdeas:
            data.stats?.projectIdeas || 0,
        });

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchRecommendations();

  }, []);

  const filteredMatches = matches.filter((item) => {

    if (activeTab === "career") {
      return item.category === "career";
    }

    if (activeTab === "courses") {
      return item.category === "course";
    }

    if (activeTab === "internships") {
      return item.category === "internship";
    }

    if (activeTab === "projects") {
      return item.category === "project";
    }

    return true;

  });

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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
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

        {/* HEADER */}

        <div className="flex items-start justify-between mb-10">

          <div>

            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
              Recommendations
            </h1>

            <p className="text-slate-500 text-lg font-medium">
              AI-powered personalized recommendations based on your analysis.
            </p>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">

            <div className="h-14 w-[360px] bg-white border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3">

              <Search className="w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search opportunities..."
                className="bg-transparent outline-none flex-1 text-[15px]"
              />

            </div>

            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center">

              <Bell className="w-5 h-5 text-[#1d1d1f]" />

            </button>

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

        </div>

        {/* STATS */}

        <div className="grid lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 rounded-2xl bg-[#eef5ff] flex items-center justify-center">

                <Briefcase className="w-7 h-7 text-blue-600" />

              </div>

              <div>

                <h2 className="text-4xl font-bold">
                  {stats.careerMatches}
                </h2>

                <p className="text-slate-500">
                  Career Matches
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 rounded-2xl bg-[#edf8ef] flex items-center justify-center">

                <GraduationCap className="w-7 h-7 text-green-600" />

              </div>

              <div>

                <h2 className="text-4xl font-bold">
                  {stats.courseSuggestions}
                </h2>

                <p className="text-slate-500">
                  Course Suggestions
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 rounded-2xl bg-[#f3ecff] flex items-center justify-center">

                <Building2 className="w-7 h-7 text-purple-600" />

              </div>

              <div>

                <h2 className="text-4xl font-bold">
                  {stats.internshipMatches}
                </h2>

                <p className="text-slate-500">
                  Internship Matches
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 rounded-2xl bg-[#fff3df] flex items-center justify-center">

                <Star className="w-7 h-7 text-orange-500" />

              </div>

              <div>

                <h2 className="text-4xl font-bold">
                  {stats.projectIdeas}
                </h2>

                <p className="text-slate-500">
                  Project Ideas
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* CONTENT */}

        <div className="grid lg:grid-cols-[1.8fr,0.95fr] gap-6 items-start">

          {/* LEFT */}

          <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6 min-h-[700px]">

            {/* TABS */}

            <div className="flex items-center gap-3 mb-8 flex-wrap">

              <button
                onClick={() => setActiveTab("career")}
                className={`h-11 px-6 rounded-full text-sm font-semibold ${
                  activeTab === "career"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-[#f7f5f2]"
                }`}
              >
                Career Matches
              </button>

              <button
                onClick={() => setActiveTab("courses")}
                className={`h-11 px-6 rounded-full text-sm font-semibold ${
                  activeTab === "courses"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-[#f7f5f2]"
                }`}
              >
                Course Suggestions
              </button>

              <button
                onClick={() => setActiveTab("internships")}
                className={`h-11 px-6 rounded-full text-sm font-semibold ${
                  activeTab === "internships"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-[#f7f5f2]"
                }`}
              >
                Internships
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`h-11 px-6 rounded-full text-sm font-semibold ${
                  activeTab === "projects"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-[#f7f5f2]"
                }`}
              >
                Project Ideas
              </button>

            </div>

            {/* MATCHES */}

            <div className="space-y-4">

              {loading ? (

                <div className="text-center py-20 text-slate-500">
                  Loading recommendations...
                </div>

              ) : filteredMatches.length > 0 ? (

                filteredMatches.map((item, index) => (

                  <div
                    key={index}
                    className="border border-[#ececec] rounded-[1.7rem] p-5 flex items-center justify-between"
                  >

                    {/* LEFT */}

                    <div className="flex items-center gap-5">

                      <div className="w-20 h-20 rounded-2xl bg-white border border-[#ececec] flex items-center justify-center">

                        <img
                          src={item.logo}
                          alt="logo"
                          className="w-12 h-12 object-contain"
                        />

                      </div>

                      <div>

                        <h2 className="text-[26px] font-semibold text-[#1d1d1f] mb-1">
                          {item.role}
                        </h2>

                        <p className="text-slate-500 font-medium mb-3">
                          {item.company} • {item.type}
                        </p>

                        <div className="flex gap-2 flex-wrap">

                          {item.skills?.map((skill, idx) => (

                            <div
                              key={idx}
                              className="px-3 py-1 rounded-lg bg-[#f5f5f5] text-sm font-medium"
                            >
                              {skill}
                            </div>

                          ))}

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="flex items-center gap-8">

                      <div className="text-center">

                        <div className="w-16 h-16 rounded-full border-[5px] border-green-500 border-l-[#e8f8ef] border-b-[#e8f8ef] flex items-center justify-center mx-auto mb-2">

                          <span className="text-sm font-bold">
                            {item.score}
                          </span>

                        </div>

                        <p className="text-sm text-slate-500">
                          Match Score
                        </p>

                      </div>

                      <button className="h-12 px-6 rounded-xl border border-[#e8e6e1] font-semibold">

                        View Details

                      </button>

                    </div>

                  </div>

                ))

              ) : (

                <div className="text-center py-20 text-slate-400">
                  No recommendations available yet.
                </div>

              )}

            </div>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* WHY */}

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">

              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">
                Why these recommendations?
              </h2>

              <div className="space-y-5">

                {whyRecommendations.map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-4"
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

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-6">

              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">
                Top In-Demand Skills
              </h2>

              <div className="space-y-6">

                {topSkills.map((skill, index) => (

                  <div key={index}>

                    <div className="flex items-center justify-between mb-3">

                      <h3 className="font-semibold text-[#1d1d1f]">
                        {skill.name}
                      </h3>

                      <span className="text-sm font-semibold">
                        {skill.score}
                      </span>

                    </div>

                    <div className="h-2 rounded-full bg-[#ececec] overflow-hidden">

                      <div
                        className="h-full bg-[#d4a44d] rounded-full"
                        style={{
                          width: skill.width,
                        }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

              <button className="w-full h-14 rounded-2xl border border-[#e8e6e1] font-semibold flex items-center justify-center gap-3 mt-8">

                Improve These Skills

                <ArrowRight className="w-5 h-5" />

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}
