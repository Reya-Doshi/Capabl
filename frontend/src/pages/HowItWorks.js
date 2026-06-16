import MainLayout from "../layouts/MainLayout";
import {
  FileUp,
  BrainCircuit,
  BarChart3,
  MapPin,
  Video,
  SlidersHorizontal,
  FolderGit2,
  TrendingUp,
  Star,
  ShieldCheck,
  Sparkles,
  Scale,
  Eye,
  ArrowRight,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Resume & GitHub",
      desc: "Upload your resume and link GitHub — we extract your skills, projects, and experience.",
      icon: <FileUp className="w-8 h-8 text-[#b89968]" />,
    },
    {
      number: "02",
      title: "AI Profile Analysis",
      desc: "AI reads your resume and GitHub and builds an explainable readiness score for your goal.",
      icon: <BrainCircuit className="w-8 h-8 text-[#b89968]" />,
    },
    {
      number: "03",
      title: "Skill Gap Analysis",
      desc: "We weigh your evidence against the skills your target role actually requires.",
      icon: <BarChart3 className="w-8 h-8 text-[#b89968]" />,
    },
    {
      number: "04",
      title: "Personalized Roadmap",
      desc: "Get a stage-by-stage learning plan with curated resources and weekly milestones.",
      icon: <MapPin className="w-8 h-8 text-[#b89968]" />,
    },
    {
      number: "05",
      title: "AI Mock Interview",
      desc: "Practice adaptive questions with Rexa and get a detailed, dimension-by-dimension scorecard.",
      icon: <Video className="w-8 h-8 text-[#b89968]" />,
    },
    {
      number: "06",
      title: "What-If Simulator",
      desc: "Toggle skills you plan to learn and watch your role-match score recompute live.",
      icon: <SlidersHorizontal className="w-8 h-8 text-[#b89968]" />,
    },
    {
      number: "07",
      title: "Project Intelligence",
      desc: "Your GitHub projects are scored for how well they prove the skills your role needs.",
      icon: <FolderGit2 className="w-8 h-8 text-[#b89968]" />,
    },
    {
      number: "08",
      title: "Track Your Readiness",
      desc: "As you add evidence — projects, interviews, certs — watch your readiness climb.",
      icon: <TrendingUp className="w-8 h-8 text-[#b89968]" />,
    },
  ];

  return (
    <MainLayout>
      <main className="pt-32 pb-24 bg-[#f5f1ea] min-h-screen overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          {/* HEADER */}
          <div className="text-center space-y-6 mb-20">
            <div className="inline-block px-4 py-1 rounded-full border border-[#b89968] text-[10px] font-bold tracking-widest text-[#b89968] uppercase">
              How it works
            </div>
            <h1 className="text-6xl font-extrabold tracking-tight text-[#1d1d1f] max-w-4xl mx-auto leading-tight">
              Your journey from potential to profession in{" "}
              <span className="text-[#b89968]">8 simple steps</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Capabl's AI-powered platform analyzes, guides, and prepares you for the career you're meant for.
            </p>
          </div>

          {/* STEPS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 mb-24 relative items-start">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center relative"
              >
                {/* DASHED LINE */}
                {index !== steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-1/2 w-full border-t-2 border-dashed border-[#e8e6e1] z-0"></div>
                )}

                {/* ICON BOX */}
                <div className="relative mb-6">
                  <div className="bg-white border border-[#e8e6e1] rounded-[1.25rem] w-20 h-20 flex items-center justify-center relative z-10 hover:-translate-y-1 transition duration-300 shrink-0 shadow-sm">
                    {step.icon}
                    <div className="absolute -bottom-2 bg-white border border-[#e8e6e1] w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shadow-sm">
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* TEXT CONTENT */}
                <div className="space-y-2 w-full px-1">
                  {/* Fixed 2-line height for Title */}
                  <h4 className="font-bold text-[14px] leading-[1.2] h-[34px] flex items-center justify-center line-clamp-2 overflow-hidden">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA SECTION */}
          <div className="bg-white border border-[#e8e6e1] rounded-[2.5rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-[#f3ede2] rounded-full flex items-center justify-center shrink-0">
                <Star className="w-8 h-8 text-[#b89968] fill-current" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold">We're with you at every step</h3>
                <p className="text-slate-500 font-medium max-w-md">
                  From discovery to dream job, Capabl is your AI career coach and growth partner.
                </p>
                <a href="/signup"
                               className="bg-[#1d1d1f] text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl"
                              >
                
                               Start Your Journey
                
                                <ArrowRight className="w-5 h-5" />
                
                              </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              {[
                { icon: <ShieldCheck className="w-5 h-5 text-[#b89968]" />, title: "Private & Secure", sub: "Your data stays yours" },
                { icon: <Sparkles className="w-5 h-5 text-[#b89968]" />, title: "Hybrid AI", sub: "LLM + auditable rules" },
                { icon: <Scale className="w-5 h-5 text-[#b89968]" />, title: "Explainable Scores", sub: "Every point traceable" },
                { icon: <Eye className="w-5 h-5 text-[#b89968]" />, title: "You Decide", sub: "Human in the loop" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.icon}
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}