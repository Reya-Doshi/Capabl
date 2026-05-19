import { useState } from "react";

import {
  Rocket,
  BarChart3,
  ShieldCheck,
  User,
  Mail,
  Lock,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import axios from "axios";
import toast from "react-hot-toast";

export default function Signup() {

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const handleSignup = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
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
      

      console.log(
        localStorage.getItem("token")
      );

      setTimeout(() => {

        window.location.href =
          "/onboarding";

      }, 100);

    } catch (error) {

      console.log(error.response?.data);

      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

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

        {/* LEFT */}

        <div className="hidden lg:flex flex-col justify-center px-24">

          <div className="max-w-xl">

            <h1 className="text-6xl font-extrabold tracking-tight leading-tight text-[#1d1d1f]">

              Start your journey
              <br />

              with{" "}

              <span className="text-[#b89968]">
                Capabl
              </span>

            </h1>

            <p className="text-lg text-slate-500 font-medium mt-6 leading-relaxed">

              Join thousands of students who are discovering their potential and building the careers they deserve.

            </p>

            {/* FEATURES */}

            <div className="mt-16 space-y-10">

              <div className="flex items-start gap-6">

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center shrink-0 shadow-sm">

                  <Rocket className="w-7 h-7 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="font-bold text-xl">

                    AI-Powered Guidance

                  </h4>

                  <p className="text-base text-slate-400 font-medium leading-relaxed">

                    Smart insights to help you discover the right career path.

                  </p>

                </div>

              </div>

              <div className="flex items-start gap-6">

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center shrink-0 shadow-sm">

                  <BarChart3 className="w-7 h-7 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="font-bold text-xl">

                    Personalized Roadmaps

                  </h4>

                  <p className="text-base text-slate-400 font-medium leading-relaxed">

                    Custom learning plans designed for your goals and skills.

                  </p>

                </div>

              </div>

              <div className="flex items-start gap-6">

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center shrink-0 shadow-sm">

                  <ShieldCheck className="w-7 h-7 text-[#b89968]" />

                </div>

                <div>

                  <h4 className="font-bold text-xl">

                    Track & Achieve

                  </h4>

                  <p className="text-base text-slate-400 font-medium leading-relaxed">

                    Track your progress and become 100% career ready.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex items-center justify-center p-8">

          <div className="bg-white border border-[#e8e6e1] rounded-[2.5rem] w-full max-w-[520px] p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">

            {/* HEADER */}

            <div className="text-center mb-10">

              <h2 className="text-3xl font-bold text-[#1d1d1f]">

                Create your account

              </h2>

              <p className="text-sm text-slate-400 font-medium mt-2">

                Let's get you one step closer to your dream career.

              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSignup}
              className="space-y-5"
            >

              {/* NAME */}

              <div className="space-y-1.5">

                <label className="text-[13px] font-bold text-slate-700">

                  Full Name

                </label>

                <div className="relative">

                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e8e6e1] text-sm font-medium outline-none focus:border-[#b89968] focus:ring-4 focus:ring-[#b89968]/10"
                  />

                </div>

              </div>

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
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
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
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-[#e8e6e1] text-sm font-medium outline-none focus:border-[#b89968] focus:ring-4 focus:ring-[#b89968]/10"
                  />

                  <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 cursor-pointer" />

                </div>

              </div>

              {/* PASSWORD RULES */}

              <div className="grid grid-cols-2 gap-y-2 mt-2">

                <div
                  className={`flex items-center gap-2 text-[11px] font-semibold ${
                    hasLength
                      ? "text-green-500"
                      : "text-slate-400"
                  }`}
                >

                  <CheckCircle2 className="w-3 h-3" />

                  At least 8 characters

                </div>

                <div
                  className={`flex items-center gap-2 text-[11px] font-semibold ${
                    hasNumber
                      ? "text-green-500"
                      : "text-slate-400"
                  }`}
                >

                  <CheckCircle2 className="w-3 h-3" />

                  Includes a number

                </div>

                <div
                  className={`flex items-center gap-2 text-[11px] font-semibold ${
                    hasUppercase
                      ? "text-green-500"
                      : "text-slate-400"
                  }`}
                >

                  <CheckCircle2 className="w-3 h-3" />

                  Includes uppercase

                </div>

              </div>

              {/* BUTTON */}

              <div className="space-y-4 pt-4">

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1d1d1f] text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >

                  {loading
                    ? "Creating..."
                    : "Sign Up"}

                  <ArrowRight className="w-4 h-4" />

                </button>

                <div className="text-center">

                  <span className="text-[13px] font-medium text-slate-500">

                    Already have an account?

                  </span>

                  <a
                    href="/login"
                    className="text-[13px] font-bold text-[#b89968] hover:underline ml-1"
                  >

                    Login

                  </a>

                </div>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}