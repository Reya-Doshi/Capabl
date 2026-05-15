import {
  BarChart2,
  BookOpen,
  Crosshair,
  Mail,
  Lock,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { useState } from "react";
export default function Login() {
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const handleLogin = async (e) => {

  e.preventDefault();

  try {

    const { data } = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email,
        password,
      }
    );

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
  "userInfo",
  JSON.stringify(data.user)
);

    if (
      data.user?.college &&
  data.user?.github &&
  data.user?.linkedin
    ) {

      window.location.href = "/dashboard";

    } else {

      setTimeout(() => {

        window.location.href = "/onboarding";

      }, 100);

    }

  } catch (error) {

    alert(
      error.response?.data?.message ||
      "Login failed"
    );

  }

};
  return (
    <div className="min-h-screen bg-[#f7f5f2] overflow-hidden">

      {/* NAVBAR */}

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e8e6e1]">

        <div className="max-w-7xl mx-auto px-10 h-20 flex items-center">

          <a href="/" className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">

              <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full"></div>

            </div>

            <span className="text-xl font-bold tracking-tight">
              Capabl
            </span>

          </a>

        </div>

      </header>

      {/* MAIN */}

      <div className="min-h-screen grid lg:grid-cols-2 pt-20">

        {/* LEFT SIDE */}

        <div className="hidden lg:flex flex-col justify-center px-24">

          <div className="max-w-xl">

            <h1 className="text-6xl font-extrabold tracking-tight leading-tight text-[#1d1d1f]">

              Welcome back!
              <br />

              Let’s continue your
              <br />

              <span className="text-[#b89968]">

                career journey.

              </span>

            </h1>

            <p className="text-lg text-slate-500 font-medium mt-6 leading-relaxed">

              Log in to access your personalized roadmap, AI insights, mock interviews, and more.

            </p>

            {/* FEATURES */}

            <div className="mt-16 space-y-10">

              <div className="flex items-start gap-6">

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center shrink-0 shadow-sm">

                  <BarChart2 className="w-7 h-7 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="font-bold text-xl">
                    AI-Powered Insights
                  </h4>

                  <p className="text-base text-slate-400 font-medium leading-relaxed">

                    Get smart analysis and recommendations tailored just for you.

                  </p>

                </div>

              </div>

              <div className="flex items-start gap-6">

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center shrink-0 shadow-sm">

                  <BookOpen className="w-7 h-7 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="font-bold text-xl">
                    Personalized Roadmaps
                  </h4>

                  <p className="text-base text-slate-400 font-medium leading-relaxed">

                    Follow a custom plan designed to help you achieve your dream career.

                  </p>

                </div>

              </div>

              <div className="flex items-start gap-6">

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center shrink-0 shadow-sm">

                  <Crosshair className="w-7 h-7 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="font-bold text-xl">
                    Practice & Improve
                  </h4>

                  <p className="text-base text-slate-400 font-medium leading-relaxed">

                    Mock interviews, practice tests, and real-time feedback to help you grow.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center justify-center p-8">

          <div className="bg-white border border-[#e8e6e1] rounded-[2.5rem] w-full max-w-[520px] p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">

            {/* HEADER */}

            <div className="text-center mb-10">

              <h2 className="text-3xl font-bold">
                Log in to Capabl
              </h2>

              <p className="text-sm text-slate-400 font-medium mt-2">

                Glad to see you again! Please log in to continue.

              </p>

            </div>

            {/* SOCIAL */}

            <div className="space-y-4">

              <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#e8e6e1] font-semibold hover:bg-[#f7f5f2] transition-all">

                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt=""
                  className="w-5 h-5"
                />

                Continue with Google

              </button>

              <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#e8e6e1] font-semibold hover:bg-[#f7f5f2] transition-all">

                <img
                  src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                  alt=""
                  className="w-5 h-5"
                />

                Continue with LinkedIn

              </button>

            </div>

            {/* DIVIDER */}

            <div className="flex items-center gap-4 my-8">

              <div className="flex-1 h-[1px] bg-[#e8e6e1]"></div>

              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">

                or

              </span>

              <div className="flex-1 h-[1px] bg-[#e8e6e1]"></div>

            </div>

            {/* FORM */}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* EMAIL */}

              <div className="space-y-1.5">

                <label className="text-[13px] font-bold text-slate-700">

                  Email Address

                </label>

                <div className="relative">

                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e8e6e1] text-sm font-medium outline-none focus:border-[#b89968] focus:ring-4 focus:ring-[#b89968]/10"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="space-y-1.5">

                <label className="text-[13px] font-bold text-slate-700">

                  Password

                </label>

                <div className="relative">

                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-[#e8e6e1] text-sm font-medium outline-none focus:border-[#b89968] focus:ring-4 focus:ring-[#b89968]/10"
                  />

                  <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 cursor-pointer" />

                </div>

              </div>

              {/* OPTIONS */}

              <div className="flex items-center justify-between mt-2">

                <label className="flex items-center gap-2 cursor-pointer">

                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />

                  <span className="text-[13px] font-medium text-slate-600">

                    Remember me

                  </span>

                </label>

                <a
                  href="#"
                  className="text-[13px] font-bold text-[#b89968] hover:underline"
                >

                  Forgot password?

                </a>

              </div>

              {/* BUTTON */}

              <button
                type="submit"
                className="bg-[#1d1d1f] text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-8"
              >

                Log In

                <ArrowRight className="w-4 h-4" />

              </button>

            </form>

            {/* FOOTER */}

            <div className="text-center mt-6 text-[13px] text-slate-500">

              Don’t have an account?{" "}

              <a
                href="/signup"
                className="text-[#b89968] font-bold hover:underline"
              >

                Sign up

              </a>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}