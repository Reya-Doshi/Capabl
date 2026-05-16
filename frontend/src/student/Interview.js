import { useEffect, useState } from "react";
import axios from "axios";

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

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const [showFeedback, setShowFeedback] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [interviewTypes, setInterviewTypes] =
    useState([]);

  const [recentInterviews, setRecentInterviews] =
    useState([]);

  const [whyInterview, setWhyInterview] =
    useState([]);

  const [performance, setPerformance] =
    useState({
      overallScore: 0,
      interviewsTaken: 0,
      avgScore: 0,
      bestScore: 0,
    });

  useEffect(() => {

    const fetchInterviewData = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const { data } = await axios.get(
          "http://localhost:5000/api/interviews",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setInterviewTypes(
          data.interviewTypes || []
        );

        setRecentInterviews(
          data.recentInterviews || []
        );

        setWhyInterview(
          data.whyInterview || []
        );

        setPerformance({
          overallScore:
            data.performance?.overallScore || 0,

          interviewsTaken:
            data.performance?.interviewsTaken || 0,

          avgScore:
            data.performance?.avgScore || 0,

          bestScore:
            data.performance?.bestScore || 0,
        });

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchInterviewData();

    const timer = setTimeout(() => {
      setShowFeedback(true);
    }, 700);

    return () => clearTimeout(timer);

  }, []);

  return (

    <div className="min-h-screen bg-[#f7f5f2] flex">

      {/* SIDEBAR */}

      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">

        {/* LOGO */}

        <a
          href="/"
          className="flex items-center gap-2 mb-12"
        >

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
              Practice real interviews with AI and improve your confidence.
            </p>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">

            <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center relative">

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
                Realistic questions, instant feedback and performance insights.
              </p>

              <button className="group h-14 px-8 rounded-2xl bg-[#1d1d1f] text-white flex items-center gap-3 font-semibold transition-all duration-300 hover:scale-105">

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

                  <div className="w-2 h-8 rounded-full bg-[#d4a44d] animate-pulse"></div>

                  <div className="w-2 h-14 rounded-full bg-[#d4a44d] animate-pulse"></div>

                  <div className="w-2 h-10 rounded-full bg-[#d4a44d] animate-pulse"></div>

                  <div className="w-2 h-16 rounded-full bg-[#d4a44d] animate-pulse"></div>

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

                {whyInterview.map((item, index) => (

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
{/* INTERVIEW SECTION */}

<div className="grid lg:grid-cols-[1.7fr,0.72fr] gap-6 mb-10 items-start">

  {/* LEFT SIDE */}

  <div>

    {/* INTERVIEW TYPES */}

    <div className="grid lg:grid-cols-2 gap-4 mb-6">

{loading ? (

  [1, 2, 3, 4].map((item) => (

    <div
      key={item}
      className="bg-white border border-[#e8e6e1] rounded-[1.7rem] p-6 min-h-[280px] flex flex-col justify-between"
    >

      <div className="w-14 h-14 rounded-[1.3rem] bg-[#f3f3f3] mb-5 animate-pulse"></div>

      <div className="w-[160px] h-7 rounded-lg bg-[#f3f3f3] mb-4 animate-pulse"></div>

      <div className="w-full h-4 rounded-lg bg-[#f3f3f3] mb-2 animate-pulse"></div>

      <div className="w-[80%] h-4 rounded-lg bg-[#f3f3f3] mb-6 animate-pulse"></div>

      <div className="w-full h-11 rounded-xl bg-[#f3f3f3] animate-pulse"></div>

    </div>

  ))

) : interviewTypes.length > 0 ? (

  interviewTypes.map((item, index) => (

    <div
      key={index}
      className="group bg-white border border-[#e8e6e1] rounded-[1.7rem] p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:border-[#e6d5b5]"
    >

      <div
        className={`w-14 h-14 rounded-[1.3rem] ${item.color} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110`}
      >

        {item.type === "Technical" ? (
          <Code2 className="w-7 h-7 text-purple-600" />
        ) : item.type === "HR" ? (
          <Briefcase className="w-7 h-7 text-green-600" />
        ) : item.type === "Behavioral" ? (
          <MessagesSquare className="w-7 h-7 text-orange-500" />
        ) : (
          <LineChart className="w-7 h-7 text-blue-600" />
        )}

      </div>

      <h3 className="text-[22px] font-semibold text-[#1d1d1f] mb-3">
        {item.title}
      </h3>

      <p className="text-slate-500 leading-relaxed mb-6 font-medium text-[15px]">
        {item.description}
      </p>

      <button
        className={`w-full h-11 rounded-xl font-semibold text-[15px] ${item.button}`}
      >

        Start Interview

      </button>

    </div>

  ))

) : (

  <div className="col-span-2 bg-white border border-[#e8e6e1] rounded-[1.7rem] p-10 text-center">



    <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-3">
      No Interview Types Available Yet
    </h2>

    <p className="text-slate-500 font-medium max-w-[500px] mx-auto leading-relaxed mb-6">

      AI interview categories will appear here once your backend sends interview analysis data.

    </p>

    <button className="h-12 px-6 rounded-2xl bg-[#1d1d1f] text-white font-semibold">

      Generate AI Interviews

    </button>

  </div>

)}

    </div>

  </div>

  {/* RIGHT SIDE */}

  <div className="sticky top-8">

    <div className="group bg-white border border-[#e8e6e1] rounded-[1.7rem] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]">

      <h2 className="text-[30px] font-semibold text-[#1d1d1f] mb-8 leading-tight">
        Your Performance
      </h2>

      <div className="flex justify-center mb-8">

        <div className="w-44 h-44 rounded-full border-[12px] border-green-500 border-l-[#e8f8ef] border-b-[#e8f8ef] flex items-center justify-center">

          <div className="text-center">

            <h2 className="text-5xl font-bold text-[#1d1d1f]">
              {performance.overallScore}%
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              Overall Score
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-5 mb-8">

        <div className="flex items-center justify-between">

          <p className="text-slate-500 font-medium text-[15px]">
            Interviews Taken
          </p>

          <p className="font-semibold text-[#1d1d1f] text-[16px]">
            {performance.interviewsTaken}
          </p>

        </div>

        <div className="flex items-center justify-between">

          <p className="text-slate-500 font-medium text-[15px]">
            Avg. Score
          </p>

          <p className="font-semibold text-[#1d1d1f] text-[16px]">
            {performance.avgScore}%
          </p>

        </div>

        <div className="flex items-center justify-between">

          <p className="text-slate-500 font-medium text-[15px]">
            Best Score
          </p>

          <p className="font-semibold text-[#1d1d1f] text-[16px]">
            {performance.bestScore}%
          </p>

        </div>

      </div>

      <button className="w-full h-13 rounded-2xl border border-[#e8e6e1] font-semibold text-[#c89a2b] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#faf7f2]">

        View Performance

        <ArrowRight className="w-4 h-4" />

      </button>

    </div>

  </div>

</div>

{/* RECENT INTERVIEWS */}

<div
  className={`bg-white border border-[#e8e6e1] rounded-[2rem] overflow-hidden transition-all duration-700 ${
    showFeedback
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-6"
  }`}
>

  {/* TOP */}

  <div className="flex items-center justify-between px-8 py-6 border-b border-[#f1f1f1]">

    <h2 className="text-3xl font-semibold text-[#1d1d1f]">
      Recent Interviews
    </h2>

    <button className="text-[#c89a2b] font-semibold flex items-center gap-2 group">

      View All Interviews

      <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />

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

        {recentInterviews.length > 0 ? (

          recentInterviews.map((item, index) => (

            <tr
              key={index}
              className="border-b border-[#f1f1f1] transition-all duration-300 hover:bg-[#faf7f2]"
            >

              <td className="px-8 py-6">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-[#f3ecff] flex items-center justify-center">

                    <Code2 className="w-5 h-5 text-purple-600" />

                  </div>

                  <h3 className="font-semibold text-[#1d1d1f]">
                    {item.title}
                  </h3>

                </div>

              </td>

              <td className="px-6 py-6">

                <div className="inline-flex px-4 py-1 rounded-full bg-[#f3ecff] text-purple-700 text-sm font-medium">

                  {item.type}

                </div>

              </td>

              <td className="px-6 py-6 text-slate-500 font-medium">
                {item.date}
              </td>

              <td className="px-6 py-6 font-semibold text-green-600">
                {item.score}%
              </td>

              <td className="px-6 py-6">

                <div className="inline-flex px-4 py-1 rounded-full bg-[#e8f8ef] text-green-700 text-sm font-medium">

                  {item.feedback}

                </div>

              </td>

              <td className="px-6 py-6">

                <button className="h-11 px-5 rounded-xl border border-[#d4a44d] text-[#c89a2b] font-semibold transition-all duration-300 hover:bg-[#fff8eb]">

                  View Report

                </button>

              </td>

            </tr>

          ))

        ) : (

          <tr>

            <td
              colSpan="6"
              className="text-center py-20 text-slate-400 font-medium"
            >

              No interviews available yet.

            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

</div>
      </main>

    </div>

  );

}