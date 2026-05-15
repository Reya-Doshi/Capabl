import MainLayout from "../layouts/MainLayout";

import {
  GraduationCap,
  CheckCircle,
  ArrowRight,
  FilePlus,
  Compass,
  BarChart3,
  Map,
  Bot,
} from "lucide-react";

export default function Students() {

  return (

    <MainLayout>

      <main className="pt-36 bg-white overflow-hidden">

        {/* HERO */}

        <section className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center mb-24">

          {/* LEFT */}

          <div className="space-y-8">

            <div className="inline-flex items-center gap-2 bg-[#f8ecd9] text-[#c98a3c] px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">

              <GraduationCap className="w-4 h-4" />

              For Students

            </div>

            <h1 className="text-7xl font-extrabold tracking-tight leading-[1.1] text-[#1d1d1f]">

              Your dream
              <br />
              career starts here.

            </h1>

            <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">

              Capabl helps students discover the right career path, build essential skills, and get job-ready with AI-powered guidance.

            </p>

            <ul className="space-y-3">

              <li className="flex items-center gap-3 text-slate-600 font-medium">

                <CheckCircle className="w-5 h-5 text-green-500" />

                Personalized career recommendations

              </li>

              <li className="flex items-center gap-3 text-slate-600 font-medium">

                <CheckCircle className="w-5 h-5 text-green-500" />

                Skill gap analysis and learning roadmaps

              </li>

              <li className="flex items-center gap-3 text-slate-600 font-medium">

                <CheckCircle className="w-5 h-5 text-green-500" />

                Mock interviews and real-time feedback

              </li>

            </ul>

            <div className="flex flex-wrap gap-4 pt-4">


              <a href="/signup"
                className="bg-[#1d1d1f] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl"
              >

                Get Started for Free

                <ArrowRight className="w-5 h-5" />

              </a>

              <a
  href="/howitworks"
  className="bg-white border border-[#e8e6e1] px-8 py-4 rounded-2xl font-bold hover:bg-[#f5f1ea] transition-all"
>

  See How It Works

</a>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative">

            <div className="rounded-[2.5rem] overflow-hidden">

              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                alt=""
                className="w-full aspect-[4/3] object-cover"
              />

            </div>

            {/* CARD 1 */}

            <div className="absolute top-10 -left-12 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-4 w-44">

              <span className="text-[9px] font-bold text-slate-400 uppercase">

                Career Match

              </span>

              <p className="text-[10px] font-bold mt-1">

                Full Stack Developer

              </p>

              <div className="flex items-center justify-center my-3">

                <div className="relative w-16 h-16 flex items-center justify-center">

                  <svg className="w-full h-full -rotate-90">

                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="transparent"
                      stroke="#f5f1ea"
                      strokeWidth="4"
                    />

                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="transparent"
                      stroke="#b89968"
                      strokeWidth="4"
                      strokeDasharray="176"
                      strokeDashoffset="15"
                      strokeLinecap="round"
                    />

                  </svg>

                  <span className="absolute text-sm font-bold">

                    92%

                  </span>

                </div>

              </div>

              <p className="text-[8px] text-slate-400 text-center font-bold">

                Match Score

              </p>

            </div>

            {/* CARD 2 */}

            <div className="absolute top-12 -right-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-4 w-40">

              <div className="flex justify-between items-center mb-2">

                <span className="text-[9px] font-bold text-slate-400 uppercase">

                  Readiness Score

                </span>

                <span className="text-[9px] font-bold text-green-500">

                  78%

                </span>

              </div>

              <div className="h-10 w-full flex items-end gap-1">

                <div className="w-full bg-slate-100 h-1/2 rounded"></div>
                <div className="w-full bg-slate-100 h-2/3 rounded"></div>
                <div className="w-full bg-[#b89968] h-3/4 rounded"></div>
                <div className="w-full bg-slate-100 h-1/2 rounded"></div>
                <div className="w-full bg-slate-100 h-1/3 rounded"></div>

              </div>

            </div>

            {/* CARD 3 */}

            <div className="absolute bottom-10 right-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-5 w-64">

              <span className="text-[10px] font-bold text-slate-400 uppercase">

                Next Milestone

              </span>

              <div className="flex items-center gap-3 mt-3">

                <div className="w-3 h-3 rounded-full bg-amber-400"></div>

                <span className="text-[11px] font-bold">

                  System Design

                </span>

              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">

                <div className="bg-[#b89968] h-full w-[40%]"></div>

              </div>

              <div className="flex justify-end mt-2">

                <span className="text-[9px] font-bold text-slate-400">

                  2 / 5 Completed

                </span>

              </div>

            </div>

          </div>

        </section>

        {/* FEATURES */}

        <section className="bg-white py-24">

          <div className="max-w-7xl mx-auto px-8">

            <div className="text-center space-y-6 mb-16">

              <h2 className="text-4xl font-extrabold tracking-tight text-[#1d1d1f]">

                Everything a student needs to succeed

              </h2>

              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">

                Powerful tools and resources to help you plan, learn, and achieve your goals.

              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

              {[
                {
                  icon: <FilePlus className="w-6 h-6 text-[#b89968]" />,
                  title: "Resume Analysis",
                  desc: "Upload your resume and get AI-powered insights about your skills and strengths.",
                },

                {
                  icon: <Compass className="w-6 h-6 text-[#b89968]" />,
                  title: "Career Discovery",
                  desc: "Discover the best career options that match your skills and personality.",
                },

                {
                  icon: <BarChart3 className="w-6 h-6 text-[#b89968]" />,
                  title: "Skill Gap Analysis",
                  desc: "Identify missing skills and stay ahead with clear guidance.",
                },

                {
                  icon: <Map className="w-6 h-6 text-[#b89968]" />,
                  title: "Personalized Roadmaps",
                  desc: "Step-by-step learning paths to help you build in-demand skills.",
                },

                {
                  icon: <Bot className="w-6 h-6 text-[#b89968]" />,
                  title: "AI Mock Interviews",
                  desc: "Practice with AI interviewers and improve your confidence.",
                },

              ].map((item, index) => (

                <div
                  key={index}
                  className="bg-white border border-[#e8e6e1] rounded-[1.5rem] p-8 space-y-6 hover:-translate-y-[5px] transition duration-300 hover:shadow-xl"
                >

                  <div className="w-12 h-12 bg-[#f3ede2] rounded-xl flex items-center justify-center">

                    {item.icon}

                  </div>

                  <h3 className="text-lg font-bold">

                    {item.title}

                  </h3>

                  <p className="text-sm text-slate-500 font-medium leading-relaxed">

                    {item.desc}

                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>

      </main>

    </MainLayout>
  );
}