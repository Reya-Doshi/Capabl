import { useState } from "react";
import axios from "axios";

import {
  GraduationCap,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";

export default function Onboarding() {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const [college, setCollege] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOnboarding = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          college,
          age,
          bio,
          github,
          linkedin,
          resume,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...userInfo,
          ...data,
        })
      );

      alert("Profile completed successfully!");

      window.location.href = "/dashboard";

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-3xl bg-white rounded-[2rem] p-10 border border-[#e8e6e1] shadow-sm">

        {/* TOP */}

        <div className="mb-10 text-center">

          <div className="w-20 h-20 rounded-full bg-[#f5f1ea] flex items-center justify-center mx-auto mb-5">

            <User className="w-10 h-10 text-[#1d1d1f]" />

          </div>

          <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">

            Complete Your Profile

          </h1>

          <p className="text-slate-500 text-lg leading-relaxed">

            Welcome, {userInfo?.name} 👋
            <br />
            Help Capabl personalize your career journey.

          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleOnboarding}
          className="space-y-6"
        >

          {/* COLLEGE */}

          <div>

            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">

              College Name

            </label>

            <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">

              <GraduationCap className="w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Enter your college name"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="bg-transparent outline-none flex-1"
              />

            </div>

          </div>

          {/* AGE */}

          <div>

            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">

              Age

            </label>

            <input
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full h-14 border border-[#e8e6e1] rounded-2xl px-5 bg-[#fafafa] outline-none"
            />

          </div>

          {/* BIO */}

          <div>

            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">

              Short Bio

            </label>

            <textarea
              rows="4"
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-[#e8e6e1] rounded-2xl px-5 py-4 bg-[#fafafa] outline-none resize-none"
            />

          </div>

          {/* GITHUB */}

          <div>

            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">

              GitHub Profile

            </label>

            <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">

              <img
                src="/github.jpg"
                alt="github"
                className="w-5 h-5"
              />

              <input
                type="text"
                placeholder="https://github.com/yourusername"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="bg-transparent outline-none flex-1"
              />

            </div>

          </div>

          {/* LINKEDIN */}

          <div>

            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">

              LinkedIn Profile

            </label>

            <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">

              <img
                src="/linkedin.jpg"
                alt="linkedin"
                className="w-5 h-5"
              />

              <input
                type="text"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="bg-transparent outline-none flex-1"
              />

            </div>

          </div>

          {/* RESUME */}

          <div>

            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">

              Resume Link

            </label>

            <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">

              <FileText className="w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Paste resume drive/cloud link"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className="bg-transparent outline-none flex-1"
              />

            </div>

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#1d1d1f] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
          >

            {loading
              ? "Saving..."
              : "Continue To Dashboard"}

            <ArrowRight className="w-5 h-5" />

          </button>

        </form>

      </div>

    </div>
  );
}