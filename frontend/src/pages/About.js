import MainLayout from "../layouts/MainLayout";

import {
  ArrowRight,
  Sparkles,
  UserCheck,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  Eye,
  Heart,
  Mail,
} from "lucide-react";

export default function About() {
  return (
    <MainLayout>
      <main className="pt-36 bg-white overflow-hidden">

        {/* HERO */}

        <section className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center mb-32">

          {/* LEFT */}

          <div className="space-y-8">

            <div className="inline-block px-4 py-1 rounded-full border border-[#b89968] text-[10px] font-bold tracking-widest text-[#b89968] uppercase">
              About Capabl
            </div>

            <h1 className="text-7xl font-extrabold tracking-tight leading-[1.1] text-[#1d1d1f]">

              Empowering potential.
              <br />

              Building{" "}

              <span className="text-[#b89968]">
                futures.
              </span>

            </h1>

            <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">

              Capabl is an AI-powered career intelligence platform that helps students discover their true potential, close skill gaps, and achieve their dream careers.

            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">

              <div className="flex items-start gap-3">

                <div className="mt-1 w-6 h-6 bg-[#f3ede2] rounded-full flex items-center justify-center">

                  <Sparkles className="w-3.5 h-3.5 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="text-sm font-bold">
                    AI-Powered
                  </h4>

                  <p className="text-xs text-slate-400">
                    Intelligent insights
                  </p>

                </div>

              </div>

              <div className="flex items-start gap-3">

                <div className="mt-1 w-6 h-6 bg-[#f3ede2] rounded-full flex items-center justify-center">

                  <UserCheck className="w-3.5 h-3.5 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="text-sm font-bold">
                    Personalized
                  </h4>

                  <p className="text-xs text-slate-400">
                    Tailored roadmaps
                  </p>

                </div>

              </div>

              <div className="flex items-start gap-3">

                <div className="mt-1 w-6 h-6 bg-[#f3ede2] rounded-full flex items-center justify-center">

                  <Briefcase className="w-3.5 h-3.5 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="text-sm font-bold">
                    Career-Focused
                  </h4>

                  <p className="text-xs text-slate-400">
                    Dream role guidance
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT IMAGE */}

          <div className="relative">

            <div className="rounded-[3rem] overflow-hidden shadow-2xl">

              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                alt="students"
                className="w-full h-full object-cover"
              />

            </div>

            {/* FLOATING CARD */}

            <div className="absolute -bottom-10 -left-10 bg-white rounded-[2rem] shadow-2xl border border-[#ece7de] p-8 hidden lg:block">

              <h3 className="text-3xl font-extrabold leading-tight text-[#b89968]">

                Your potential
                <br />

                <span className="text-[#1d1d1f]">

                  is our purpose.

                </span>

              </h3>

            </div>

          </div>

        </section>

        {/* STATS */}

        <section className="max-w-7xl mx-auto px-8 mb-32">

          <div className="bg-white border border-[#e8e6e1] rounded-[2.5rem] grid grid-cols-2 lg:grid-cols-4 overflow-hidden shadow-sm">

            {[
              ["10K+", "Students", <Users className="w-6 h-6 text-[#b89968]" />],
              ["500+", "Roadmaps", <TrendingUp className="w-6 h-6 text-[#b89968]" />],
              ["200+", "Companies", <Building2 className="w-6 h-6 text-[#b89968]" />],
              ["98%", "Success", <Heart className="w-6 h-6 text-[#b89968]" />],
            ].map((item, index) => (

              <div
                key={index}
                className="p-12 text-center bg-white"
              >

                <div className="flex justify-center mb-4">

                  {item[2]}

                </div>

                <div className="text-4xl font-extrabold">

                  {item[0]}

                </div>

                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">

                  {item[1]}

                </p>

              </div>

            ))}

          </div>

        </section>

        {/* MISSION */}

        <section className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center mb-32">

          <div className="space-y-8">

            <div className="inline-block px-4 py-1 rounded-full border border-[#b89968] text-[10px] font-bold tracking-widest text-[#b89968] uppercase">

              Our Mission

            </div>

            <h2 className="text-5xl font-extrabold tracking-tight leading-tight text-[#b89968]">

              Making career success accessible to everyone

            </h2>

            <p className="text-lg text-slate-500 font-medium leading-relaxed">

              We believe every student deserves the right guidance and opportunities to build a meaningful career.

            </p>

          </div>

          <div className="space-y-4">

            {[
              {
                icon: <Eye className="w-6 h-6 text-[#b89968]" />,
                title: "Clarity",
                desc: "Career clarity through smart recommendations.",
              },

              {
                icon: <TrendingUp className="w-6 h-6 text-[#b89968]" />,
                title: "Growth",
                desc: "Grow with personalized learning paths.",
              },

              {
                icon: <Briefcase className="w-6 h-6 text-[#b89968]" />,
                title: "Opportunity",
                desc: "Connect with real career opportunities.",
              },

              {
                icon: <Heart className="w-6 h-6 text-[#b89968]" />,
                title: "Impact",
                desc: "Creating positive impact on careers.",
              },

            ].map((item, index) => (

              <div
                key={index}
                className="flex gap-6 p-6 rounded-[1.5rem] hover:bg-[#f3ede2] transition-all duration-300"
              >

                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">

                  {item.icon}

                </div>

                <div>

                  <h4 className="text-lg font-bold">

                    {item.title}

                  </h4>

                  <p className="text-sm text-slate-500 font-medium">

                    {item.desc}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* CTA */}

        <section className="max-w-7xl mx-auto px-8 py-32">

          <div className="bg-[#f3ede2] rounded-[3rem] p-16 border border-[#e8e6e1] flex flex-col lg:flex-row items-center justify-between gap-12">

            <div className="space-y-6">

              <h2 className="text-5xl font-extrabold tracking-tight leading-tight text-[#1d1d1f ]">

                Let's build the future of careers,

                <span className="text-[#b89968]">

                 together.

                </span>

              </h2>

              <p className="text-lg text-slate-500 font-medium max-w-xl">

                Join thousands of students and partners who trust Capabl.

              </p>

            </div>

            <div className="flex gap-4 flex-wrap">

              <a href="/signup"
                className="bg-[#1d1d1f] text-white px-16 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl min-w-[320px]"
              >

                Get Started for Free

                <ArrowRight className="w-5 h-5" />

              </a>

              <button className="bg-white border border-[#e8e6e1] px-10 py-4 rounded-2xl font-bold flex items-center gap-2">

                Contact Us

                <Mail className="w-5 h-5" />

              </button>

            </div>

          </div>

        </section>

      </main>
    </MainLayout>
  );
}