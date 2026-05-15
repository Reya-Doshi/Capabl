import MainLayout from "../layouts/MainLayout";

import {
  Upload,
  Star,
  LayoutGrid,
  FileText,
  Target,
  BarChart3,
  Map,
  MessagesSquare,
  FileBarChart,
  User,
  Settings,
  Bell,
  ArrowRight,
  Flag,
  Bot,
} from "lucide-react";

export default function Home() {

  return (

    <MainLayout>

      <main className="pt-36 pb-24 overflow-x-hidden bg-white">

        <div className="max-w-[1440px] mx-auto px-10">

          {/* HERO SECTION */}

          <div className="grid lg:grid-cols-2 gap-10 items-center mb-40">

            {/* LEFT */}

            <div className="space-y-8">

              <div className="inline-flex items-center gap-2 bg-[#f3ede2] border border-[#e8e6e1] px-4 py-1.5 rounded-full">

                <span className="text-xs">✦</span>

                <span className="text-[13px] font-semibold text-slate-600 uppercase tracking-widest">

                  AI-Powered Career
                  <span className="text-[#b89968]">
                    {" "}Intelligence
                  </span>

                </span>

              </div>

              <h1 className="text-7xl font-extrabold leading-[1.02] tracking-tight text-[#1d1d1f]">

                From potential
                <br />
                to profession.

              </h1>

              <p className="text-[18px] text-slate-500 max-w-md leading-relaxed">

                Capabl analyzes your skills, understands your potential, and maps the perfect career path for you with AI intelligence.

              </p>

              <div className="flex flex-wrap gap-4 pt-4">

                <button className="bg-[#1d1d1f] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl">

                  Upload Your Resume

                  <Upload className="w-5 h-5" />

                </button>

            
                  <a href="/"
                            className="bg-white border border-[#e8e6e1] px-8 py-4 rounded-2xl font-bold hover:bg-[#f5f1ea] transition-all">
            
                            Explore Platform
            
            
                          </a>

                

              </div>

              {/* RATINGS */}

              <div className="flex items-center gap-6 pt-6">

                <div className="flex">

                  <img
                    src="https://i.pravatar.cc/100?u=1"
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />

                  <img
                    src="https://i.pravatar.cc/100?u=2"
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white -ml-3"
                  />

                  <img
                    src="https://i.pravatar.cc/100?u=3"
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white -ml-3"
                  />

                  <img
                    src="https://i.pravatar.cc/100?u=4"
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white -ml-3"
                  />

                </div>

                <div>

                  <div className="flex items-center gap-1">

                    <Star className="w-4 h-4 fill-[#c98a3c] text-[#c98a3c]" />
                    <Star className="w-4 h-4 fill-[#c98a3c] text-[#c98a3c]" />
                    <Star className="w-4 h-4 fill-[#c98a3c] text-[#c98a3c]" />
                    <Star className="w-4 h-4 fill-[#c98a3c] text-[#c98a3c]" />
                    <Star className="w-4 h-4 fill-[#c98a3c] text-[#c98a3c]" />

                    <span className="text-sm font-bold ml-1">

                      4.8/5

                    </span>

                  </div>

                  <p className="text-[13px] text-slate-500 font-medium">

                    Loved by 1K+ students

                  </p>

                </div>

              </div>

            </div>

            {/* RIGHT DASHBOARD */}

            <div className="relative">

              <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-[#e8e6e1] flex h-[620px] overflow-hidden scale-110 origin-right">

                {/* SIDEBAR */}

                <aside className="w-48 border-r border-slate-100 p-6 flex flex-col bg-white shrink-0">

                  <div className="flex items-center gap-2 mb-10">

                    <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">

                      <div className="w-1 h-1 bg-black rounded-full"></div>

                    </div>

                    <span className="text-sm font-bold">
                      Capabl
                    </span>

                  </div>

                  <div className="space-y-1.5 text-[11px] font-semibold text-slate-500">

                    <div className="bg-[#f3ede2] text-black px-3 py-2.5 rounded-xl flex items-center gap-3">

                      <LayoutGrid className="w-4 h-4" />
                      Dashboard

                    </div>

                    <div className="px-3 py-2 flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      Resume Analysis
                    </div>

                    <div className="px-3 py-2 flex items-center gap-3">
                      <Target className="w-4 h-4" />
                      Career Matches
                    </div>

                    <div className="px-3 py-2 flex items-center gap-3">
                      <BarChart3 className="w-4 h-4" />
                      Skill Gap
                    </div>

                    <div className="px-3 py-2 flex items-center gap-3">
                      <Map className="w-4 h-4" />
                      Roadmap
                    </div>

                    <div className="px-3 py-2 flex items-center gap-3">
                      <MessagesSquare className="w-4 h-4" />
                      Mock Interview
                    </div>

                    <div className="px-3 py-2 flex items-center gap-3">
                      <FileBarChart className="w-4 h-4" />
                      Reports
                    </div>

                    <div className="px-3 py-2 flex items-center gap-3">
                      <User className="w-4 h-4" />
                      Profile
                    </div>

                    <div className="px-3 py-2 flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      Settings
                    </div>

                  </div>

                </aside>

                {/* MAIN DASHBOARD */}

                <main className="flex-1 p-8 bg-white overflow-hidden flex flex-col gap-6">

                  {/* TOP */}

                  <div className="flex justify-between items-center">

                    <div>

                      <h3 className="text-[14px] font-bold">

                        Welcome back, Samit 👋

                      </h3>

                      <p className="text-[10px] text-slate-400 font-medium">

                        Ready to take the next step in your career?

                      </p>

                    </div>

                    <div className="flex items-center gap-4">

                      <Bell className="w-4 h-4 text-slate-300" />

                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#b89968] to-slate-400"></div>

                    </div>

                  </div>

                  {/* FIRST ROW */}

                  <div className="grid grid-cols-3 gap-6">

                    {/* READINESS */}

                    <div className="bg-white border border-[#e8e6e1] p-5 rounded-[2.5rem] flex flex-col items-center">

                      <span className="text-[9px] font-bold text-slate-500 uppercase mb-4 self-start">

                        Readiness

                      </span>

                      <div className="relative w-20 h-20 flex items-center justify-center">

                        <svg className="w-full h-full -rotate-90">

                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="transparent"
                            stroke="#f5f1ea"
                            strokeWidth="6"
                          />

                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="transparent"
                            stroke="#b89968"
                            strokeWidth="6"
                            strokeDasharray="226"
                            strokeDashoffset="50"
                            strokeLinecap="round"
                          />

                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">

                          <span className="text-xl font-bold">
                            78%
                          </span>

                          <span className="text-[7px] font-bold text-green-500 uppercase">

                            Good

                          </span>

                        </div>

                      </div>

                    </div>

                    {/* MATCHES */}

                    <div className="bg-white border border-[#e8e6e1] p-5 rounded-[2.5rem]">

                      <div className="flex justify-between items-center mb-6">

                        <span className="text-[9px] font-bold uppercase text-slate-500">

                          Matched Roles

                        </span>

                      </div>

                      <div className="space-y-3">

                        <div className="flex items-center justify-between p-3 bg-[#f5f1ea] rounded-xl">

                          <span className="text-[9px] font-bold">

                            Full Stack Dev

                          </span>

                          <span className="text-[8px] font-bold text-slate-400">

                            92%

                          </span>

                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#f5f1ea] rounded-xl">

                          <span className="text-[9px] font-bold">

                            Backend Dev

                          </span>

                          <span className="text-[8px] font-bold text-slate-400">

                            86%

                          </span>

                        </div>

                      </div>

                    </div>

                    {/* STRENGTH */}

                    <div className="bg-white border border-[#e8e6e1] p-5 rounded-[2.5rem] flex flex-col">

                      <span className="text-[9px] font-bold text-slate-500 mb-2 uppercase">

                        Strength

                      </span>

                      <div className="flex-1 flex items-center justify-center pt-2">

                        <svg viewBox="0 0 100 100" className="w-20 h-20">

                          <polygon
                            points="50,10 85,30 85,70 50,90 15,70 15,30"
                            fill="none"
                            stroke="#e8e6e1"
                            strokeWidth="1"
                          />

                          <polygon
                            points="50,30 70,40 70,60 50,70 30,60 30,40"
                            fill="none"
                            stroke="#e8e6e1"
                            strokeWidth="1"
                          />

                          <polygon
                            points="50,20 80,35 75,65 55,80 25,65 35,35"
                            fill="rgba(184,153,104,0.2)"
                            stroke="#b89968"
                            strokeWidth="2"
                          />

                        </svg>

                      </div>

                    </div>

                  </div>

                  {/* SECOND ROW */}

                  <div className="grid grid-cols-3 gap-6">

                    {/* GAP OVERVIEW */}

                    <div className="bg-white border border-[#e8e6e1] p-5 rounded-[2.5rem]">

                      <span className="text-[9px] font-bold text-slate-500 mb-4 block uppercase">

                        Gap Overview

                      </span>

                      <div className="space-y-4">

                        <div className="flex items-center justify-between">

                          <span className="text-[9px] font-bold">

                            System Design

                          </span>

                          <span className="text-[7px] px-2 py-1 bg-[#f7e2dc] text-[#c0533a] rounded-full font-bold">

                            High

                          </span>

                        </div>

                        <div className="flex items-center justify-between">

                          <span className="text-[9px] font-bold">

                            DevOps

                          </span>

                          <span className="text-[7px] px-2 py-1 bg-[#f8ecd9] text-[#c98a3c] rounded-full font-bold">

                            Med

                          </span>

                        </div>

                      </div>

                      <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center items-center gap-1">

                        <span className="text-[8px] font-bold text-slate-400">

                          View report

                        </span>

                        <ArrowRight className="w-3 h-3 text-slate-400" />

                      </div>

                    </div>

                    {/* NEXT STEP */}

                    <div className="bg-white border border-[#e8e6e1] p-5 rounded-[2.5rem] flex flex-col">

                      <span className="text-[9px] font-bold text-slate-500 mb-4 block uppercase">

                        Next Step

                      </span>

                      <div className="flex gap-2">

                        <div className="flex-1">

                          <h4 className="text-[10px] font-bold leading-tight mb-3">

                            Improve
                            <br />
                            System Design

                          </h4>

                          <button className="bg-black text-white text-[8px] font-bold px-3 py-1.5 rounded-lg">

                            Start

                          </button>

                        </div>

                        <div className="relative w-[70px] h-[70px] scale-90">

                          <div className="absolute bottom-0 right-0 w-9 h-9 bg-[#f5f1ea] rounded-lg rotate-12"></div>

                          <div className="absolute bottom-2 right-2 w-9 h-9 bg-[#f3ede2] rounded-lg -rotate-6"></div>

                          <div className="absolute bottom-5 right-4 w-6 h-6 bg-[#b89968] rounded-md flex items-center justify-center text-white shadow-lg">

                            <Flag className="w-3 h-3" />

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* ROADMAP */}

                    <div className="bg-white border border-[#e8e6e1] p-5 rounded-[2.5rem] flex flex-col items-center">

                      <span className="text-[9px] font-bold text-slate-500 mb-4 self-start uppercase">

                        Roadmap

                      </span>

                      <div className="relative w-20 h-20 flex items-center justify-center">

                        <svg className="w-full h-full -rotate-90">

                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="transparent"
                            stroke="#f5f1ea"
                            strokeWidth="6"
                          />

                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="transparent"
                            stroke="#b89968"
                            strokeWidth="6"
                            strokeDasharray="226"
                            strokeDashoffset="124"
                            strokeLinecap="round"
                          />

                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center">

                          <span className="text-xl font-bold">

                            45%

                          </span>

                        </div>

                      </div>

                      <div className="mt-4 flex items-center gap-1 text-[8px] font-bold">

                        <span>
                          Continue Roadmap
                        </span>

                        <ArrowRight className="w-2.5 h-2.5" />

                      </div>

                    </div>

                  </div>

                </main>

              </div>

            </div>

          </div>

          {/* FEATURES */}

          <section className="py-24 border-t border-[#e8e6e1]">

            <div className="text-center mb-20">

              <h2 className="text-4xl font-extrabold tracking-tight">

                Everything You Need to Build Your Career

              </h2>

              <div className="w-24 h-[2px] bg-[#b89968] rounded-full mx-auto mt-4"></div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">

              {[
                "Resume Analysis",
                "Career Match",
                "Skill Gap",
                "Personalized Roadmap",
                "AI Mock Interview",
              ].map((item, index) => (

                <div
                  key={index}
                  className="bg-white border border-[#e8e6e1] p-10 rounded-[2.5rem] hover:-translate-y-2 transition-all duration-300 hover:bg-[#f5f1ea]"
                >

                  <div className="w-14 h-14 bg-[#f3ede2] rounded-2xl flex items-center justify-center mb-8">

                    <Bot className="w-7 h-7 text-[#b89968]" />

                  </div>

                  <h3 className="font-bold text-xl mb-4">

                    {item}

                  </h3>

                  <p className="text-[14px] text-slate-500 leading-relaxed">

                    AI-powered tools helping students become career ready.

                  </p>

                </div>

              ))}

            </div>

          </section>

        </div>

      </main>

    </MainLayout>
  );
}