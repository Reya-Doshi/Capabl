import MainLayout from "../layouts/MainLayout";

import {
  FileText,
  Target,
  BarChart3,
  Map,
  Bot,
  Layout,
  Database,
  Code,
  ArrowRight,
  Star,
} from "lucide-react";

export default function Features() {

  return (

    <MainLayout>

      <main className="pt-32 pb-24 bg-[#f5f1ea]">

        <div className="max-w-7xl mx-auto px-8">

          {/* HEADER */}

          <div className="text-center space-y-6 mb-16">

            <div className="inline-block px-4 py-1 rounded-full border border-[#b89968] text-[10px] font-bold tracking-widest text-[#b89968] uppercase">

              Features

            </div>

            <h1 className="text-6xl font-extrabold tracking-tight text-[#1d1d1f] max-w-4xl mx-auto leading-tight">

              Everything you need to build your career

            </h1>

            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">

              Powerful tools and AI-driven insights to help you discover, prepare, and land your dream career.

            </p>

          </div>

          {/* FEATURES GRID */}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">

            {/* CARD 1 */}

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-8 flex flex-col gap-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">

              <div className="space-y-4">

                <div className="w-12 h-12 bg-[#f3ede2] rounded-xl flex items-center justify-center">

                  <FileText className="w-6 h-6 text-[#b89968]" />

                </div>

                <h3 className="text-xl font-bold">

                  Resume Analysis

                </h3>

                <p className="text-xs text-slate-500 leading-relaxed font-medium">

                  AI analyzes your resume to extract key skills, strengths, and areas to improve.

                </p>

              </div>

              {/* INNER */}

              <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm space-y-4 mt-auto">

                <span className="text-[9px] font-bold text-slate-400 uppercase">

                  Resume Score

                </span>

                <div className="flex items-center gap-3">

                  <div className="relative w-12 h-12 flex items-center justify-center">

                    <svg className="w-full h-full -rotate-90">

                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="4"
                      />

                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="transparent"
                        stroke="#22c55e"
                        strokeWidth="4"
                        strokeDasharray="125"
                        strokeDashoffset="20"
                        strokeLinecap="round"
                      />

                    </svg>

                    <span className="absolute text-[10px] font-bold">

                      85

                    </span>

                  </div>

                  <div className="flex flex-col">

                    <span className="text-[10px] font-bold">

                      85/100

                    </span>

                    <span className="text-[8px] font-bold text-green-500">

                      Good

                    </span>

                  </div>

                </div>

                <div className="space-y-2">

                  <span className="text-[9px] font-bold text-slate-400 uppercase">

                    Top Skills

                  </span>

                  <div className="flex flex-wrap gap-1">

                    {["JavaScript", "React", "Node.js", "SQL"].map((skill) => (

                      <span
                        key={skill}
                        className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700"
                      >

                        {skill}

                      </span>

                    ))}

                  </div>

                </div>

              </div>

            </div>

            {/* CARD 2 */}

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-8 flex flex-col gap-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">

              <div className="space-y-4">

                <div className="w-12 h-12 bg-[#f3ede2] rounded-xl flex items-center justify-center">

                  <Target className="w-6 h-6 text-[#b89968]" />

                </div>

                <h3 className="text-xl font-bold">

                  Career <br></br>Matches

                </h3>

                <p className="text-xs text-slate-500 leading-relaxed font-medium">

                  Get AI-powered career recommendations that match your skills and interests.

                </p>

              </div>

              <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm space-y-3 mt-auto">

                <span className="text-[9px] font-bold text-slate-400 uppercase">

                  Top Career Matches

                </span>

                {[
                  {
                    icon: <Layout className="w-3 h-3 text-blue-500" />,
                    role: "Full Stack Developer",
                    score: "92% Match",
                    color: "text-green-500",
                  },

                  {
                    icon: <Database className="w-3 h-3 text-purple-500" />,
                    role: "Backend Developer",
                    score: "86% Match",
                    color: "text-green-600",
                  },

                  {
                    icon: <Code className="w-3 h-3 text-orange-500" />,
                    role: "Frontend Developer",
                    score: "78% Match",
                    color: "text-slate-400",
                  },

                ].map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                  >

                    <div className="flex items-center gap-2">

                      {item.icon}

                      <span className="text-[8px] font-bold">

                        {item.role}

                      </span>

                    </div>

                    <span className={`text-[7px] font-bold ${item.color}`}>

                      {item.score}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* CARD 3 */}

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-8 flex flex-col gap-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">

              <div className="space-y-4">

                <div className="w-12 h-12 bg-[#f3ede2] rounded-xl flex items-center justify-center">

                  <BarChart3 className="w-6 h-6 text-[#b89968]" />

                </div>

                <h3 className="text-xl font-bold">

                  Skill Gap Analysis

                </h3>

                <p className="text-xs text-slate-500 leading-relaxed font-medium">

                  Identify the skills you lack compared to your dream role and bridge the gap.

                </p>

              </div>

              <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm space-y-4 mt-auto">

                <span className="text-[9px] font-bold text-slate-400 uppercase">

                  Skill Gap

                </span>

                {[
                  ["System Design", "33%", "bg-red-400"],
                  ["AWS", "66%", "bg-orange-400"],
                  ["Docker", "33%", "bg-red-400"],
                  ["CI/CD", "33%", "bg-red-400"],
                  ["GraphQL", "66%", "bg-orange-400"],
                ].map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >

                    <span className="text-[8px] font-bold">

                      {item[0]}

                    </span>

                    <div className="flex items-center gap-2">

                      <div className="w-10 h-1 bg-slate-100 rounded">

                        <div
                          className={`h-full rounded ${item[2]}`}
                          style={{ width: item[1] }}
                        ></div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* CARD 4 */}

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-8 flex flex-col gap-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">

              <div className="space-y-4">

                <div className="w-12 h-12 bg-[#f3ede2] rounded-xl flex items-center justify-center">

                  <Map className="w-6 h-6 text-[#b89968]" />

                </div>

                <h3 className="text-xl font-bold">

                  Personalized Roadmaps

                </h3>

                <p className="text-xs text-slate-500 leading-relaxed font-medium">

                  Step-by-step learning roadmaps tailored to your goals and current level.

                </p>

              </div>

              <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm space-y-4 mt-auto">

                <span className="text-[9px] font-bold text-slate-400 uppercase">

                  Frontend Developer Roadmap

                </span>

                <div className="space-y-3">

                  {[
                    ["1", "HTML, CSS, JavaScript", "Completed", "bg-green-500"],
                    ["2", "React.js", "In Progress", "bg-orange-400"],
                    ["3", "State Management", "Upcoming", "bg-slate-300"],
                  ].map((step, index) => (

                    <div
                      key={index}
                      className={`flex items-center justify-between ${index === 2 ? "opacity-40" : ""}`}
                    >

                      <div className="flex items-center gap-2">

                        <span className={`w-4 h-4 rounded-full ${step[3]} text-white flex items-center justify-center text-[7px] font-bold`}>

                          {step[0]}

                        </span>

                        <span className="text-[8px] font-bold">

                          {step[1]}

                        </span>

                      </div>

                      <span className="text-[7px] text-slate-400">

                        {step[2]}

                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

            {/* CARD 5 */}

            <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-8 flex flex-col gap-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">

              <div className="space-y-4">

                <div className="w-12 h-12 bg-[#f3ede2] rounded-xl flex items-center justify-center">

                  <Bot className="w-6 h-6 text-[#b89968]" />

                </div>

                <h3 className="text-xl font-bold">

                  AI Mock Interviews

                </h3>

                <p className="text-xs text-slate-500 leading-relaxed font-medium">

                  Practice real interview questions and get instant AI feedback.

                </p>

              </div>

              <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm space-y-4 mt-auto">

                <div className="flex justify-between items-center">

                  <span className="text-[9px] font-bold text-slate-400 uppercase">

                    Mock Interview

                  </span>

                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700">

                    Completed

                  </span>

                </div>

                <div className="flex flex-col items-center gap-2">

                  <div className="relative w-14 h-14 flex items-center justify-center">

                    <svg className="w-full h-full -rotate-90">

                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="4"
                      />

                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="transparent"
                        stroke="#b89968"
                        strokeWidth="4"
                        strokeDasharray="150"
                        strokeDashoffset="40"
                        strokeLinecap="round"
                      />

                    </svg>

                    <span className="absolute text-[12px] font-bold">

                      72%

                    </span>

                  </div>

                  <span className="text-[8px] font-bold text-slate-400">

                    Score

                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* CTA */}

          <div className="bg-[#f3ede2] rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#e8e6e1] mt-12">

            <div className="flex items-center gap-6">

              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">

                <Star className="w-5 h-5 text-amber-500 fill-current" />

              </div>

              <div>

                <h4 className="text-xl font-bold text-[#1d1d1f]">

                  All-in-one platform

                </h4>

                <p className="text-sm text-slate-500 font-medium">

                  Everything you need to analyze, prepare, and succeed — in one place.

                </p>

              </div>

            </div>

            <a href="/"
                            className="bg-[#1d1d1f] text-white px-16 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl min-w-[320px]"
                          >
            
                            Explore Platform
            
                            <ArrowRight className="w-5 h-5" />
            
                          </a>
          </div>

        </div>

      </main>

    </MainLayout>
  );
}