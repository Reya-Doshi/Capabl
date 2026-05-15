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

  Camera,
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {

  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const token = localStorage.getItem("token");
        console.log(token);

        const { data } = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserInfo(data.user);

        if (data.user?.aiAnalysis) {
          setAnalysis(data.user.aiAnalysis);
        }

      } catch (error) {

        console.log(error);

      }

    };

    fetchProfile();

  }, []);

  const tabs = ["Overview"];

  const skills =
    analysis?.extractedSkills
      ? analysis.extractedSkills.split(",")
      : [];

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

              <div className="w-11 h-11 rounded-full bg-[#ac731e] flex items-center justify-center text-white font-bold text-lg">

  {(userInfo?.name || "U")
    .charAt(0)
    .toUpperCase()}

</div>

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

          </div>

          {/* PROFILE CARD */}

          <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-7 mb-7">

            <div className="flex items-center justify-between">

              {/* LEFT */}

              <div className="flex items-center gap-8">

                <div className="relative">


                  <div className="w-[120px] h-[120px] rounded-full bg-[#917a59] flex items-center justify-center text-white text-[48px] font-bold shadow-lg select-none">

  {(userInfo?.name || "U")
    .charAt(0)
    .toUpperCase()}

</div>
                  

                  <button className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-white border border-[#ececec] flex items-center justify-center shadow-sm">

                    <Camera className="w-5 h-5" />

                  </button>

                </div>

                {/* INFO */}

                <div>

                  <div className="flex items-center gap-4 mb-3">

                    <h2 className="text-[22px] font-semibold text-[#111111]">

                      {userInfo?.name}

                    </h2>

                    <div className="h-8 px-3 rounded-full bg-[#e8f8ef] text-green-700 flex items-center gap-2 text-[12px] font-semibold">

                      <CheckCircle2 className="w-4 h-4" />

                      Verified

                    </div>

                  </div>

                  <p className="text-[15px] text-slate-700 font-medium mb-4">

                    {analysis?.careerFit || "Career path not analyzed yet"}

                  </p>

                  <div className="flex items-center gap-6 text-slate-500 font-medium text-[14px]">

                    <div className="flex items-center gap-2">

                      <MapPin className="w-4 h-4" />

                      {analysis?.location || "Location not analyzed"}

                    </div>

                    <div className="flex items-center gap-2">

                      <Mail className="w-4 h-4" />

                      {userInfo?.email}

                    </div>

                    <div className="flex items-center gap-2">

                      <Calendar className="w-4 h-4" />

                      {analysis?.startYear || "----"} - {analysis?.endYear || "----"}

                    </div>

                  </div>

                </div>

              </div>

              {/* RIGHT */}

              <div className="w-[320px]">

                <div className="flex items-center justify-between mb-3">

                  <h3 className="text-[16px] font-semibold text-[#111111]">

                    Readiness Score

                  </h3>

                  <span className="text-[#c89a2b] text-[16px] font-semibold">

                    {analysis?.readinessScore || "0%"}

                  </span>

                </div>

                <div className="h-2.5 rounded-full bg-[#ece7df] overflow-hidden mb-4">

                  <div
                    style={{
                      width: analysis?.readinessScore || "0%",
                    }}
                    className="h-full bg-[#c89a2b] rounded-full"
                  ></div>

                </div>

                <p className="text-[#6b7280] text-[14px] leading-6">

                  AI-generated career readiness based on your profile and resume.

                </p>

              </div>

            </div>

          </div>

          {/* GRID */}

          <div className="grid lg:grid-cols-[1fr,1fr,1fr] gap-5">

            {/* ABOUT */}

            <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-6">

              <h2 className="text-[18px] font-semibold text-[#111111] mb-6">

                About Me

              </h2>

              <p className="text-[14px] text-[#6b7280] leading-7 mb-7">

                {userInfo?.bio || "No bio added yet."}

              </p>

              <div className="border-t border-[#ececec] pt-6 mb-6">

                <div className="grid grid-cols-2 gap-6">

                  <div>

                    <p className="text-[12px] text-slate-400 mb-2">

                      Phone

                    </p>

                    <h3 className="text-[15px] font-medium">

                      {analysis?.phone || "Not analyzed"}

                    </h3>

                  </div>

                  <div>

                    <p className="text-[12px] text-slate-400 mb-2">

                      Languages

                    </p>

                    <h3 className="text-[15px] font-medium">

                      {analysis?.languages || "Not analyzed"}

                    </h3>

                  </div>

                </div>

              </div>

              {/* SOCIAL */}

              <div className="flex items-center gap-4 mt-6">

                <a
  href={userInfo?.linkedin}
  target="_blank"
  rel="noreferrer"
>

                  <img
                    src="/linkedin.jpg"
                    alt="LinkedIn"
                    className="w-11 h-11 rounded-full object-cover border border-[#ece7dc] p-2 bg-white"
                  />

                </a>

                <a
  href={userInfo?.github}
  target="_blank"
  rel="noreferrer"
>

                  <img
                    src="/github.jpg"
                    alt="GitHub"
                    className="w-11 h-11 rounded-full object-cover border border-[#ece7dc] p-2 bg-white"
                  />

                </a>

                <a
                  href={userInfo?.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d1d1f] text-white text-sm font-medium"
                >

                  View Resume

                </a>

              </div>

            </div>

            {/* EDUCATION */}

            <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-6">

              <h2 className="text-[18px] font-semibold text-[#111111] mb-6">

                Education

              </h2>

              <div className="border border-[#ececec] rounded-2xl p-5">

                <h3 className="text-[17px] font-semibold mb-2">

                  {analysis?.degree || "Degree not analyzed"}

                </h3>

                <p className="text-[14px] text-[#6b7280] mb-3">

                  {analysis?.collegeName || "College not analyzed"}

                </p>

                <div className="flex items-center gap-4">

                  <span className="text-[13px] text-slate-500">

                    {analysis?.startYear || "----"} - {analysis?.endYear || "----"}

                  </span>

                  <div className="px-3 py-1 rounded-full bg-[#e8f8ef] text-green-700 text-[12px] font-semibold">

                    {analysis?.specialization || "Specialization"}

                  </div>

                </div>

              </div>

            </div>

            {/* SKILLS */}

            <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-6">

              <h2 className="text-[18px] font-semibold text-[#111111] mb-6">

                Skills

              </h2>

              <div className="flex flex-wrap gap-3">

                {skills.length > 0 ? (

                  skills.map((skill, index) => (

                    <div
                      key={index}
                      className="px-4 py-2 rounded-full bg-[#f7f5f2] text-[13px] font-medium"
                    >
                      {skill}
                    </div>

                  ))

                ) : (

                  <p className="text-slate-400 text-sm">

                    Skills not analyzed yet.

                  </p>

                )}

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}