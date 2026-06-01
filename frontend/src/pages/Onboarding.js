import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";

import {
  GraduationCap,
  FileText,
  User,
  ArrowRight,
  Upload,
  Target,
  X,
  Loader2,
} from "lucide-react";

const POPULAR_SKILLS = [
  "JavaScript",
  "React",
  "Node",
  "Express",
  "Python",
  "Java",
  "C++",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "HTML",
  "CSS",
  "TypeScript",
  "Git",
  "DSA",
  "Machine Learning",
  "TensorFlow",
  "Docker",
  "AWS",
];

export default function Onboarding() {
  const navigate = useNavigate();

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo") || "null"
  );

  const [name, setName] = useState(userInfo?.name || "");
  const [college, setCollege] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const addSkill = (raw) => {
    const value = raw.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) return;
    setSkills([...skills, value]);
    setSkillInput("");
  };

  const removeSkill = (s) => {
    setSkills(skills.filter((x) => x !== s));
  };

  const onSkillKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      toast.error("Only PDF, DOC, or DOCX files allowed");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("File too large (max 8 MB)");
      return;
    }
    setResumeFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }
    if (!careerGoal) {
      toast.error("Please select a career goal");
      return;
    }
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const form = new FormData();
      form.append("name", name);
      form.append("college", college);
      form.append("age", age);
      form.append("bio", bio);
      form.append("github", github);
      form.append("linkedin", linkedin);
      form.append("careerGoal", careerGoal);
      form.append("skills", JSON.stringify(skills));
      form.append("resume", resumeFile);

      const { data } = await axios.post(
        apiUrl("/api/profile"),
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...(userInfo || {}),
          ...data.user,
          skills: data.user.skills?.map((s) => s.name) || skills,
        })
      );

      toast.success("Profile saved successfully");
      setAnalyzing(true);

      setTimeout(() => {
        toast.success("Analysis ready");
        navigate("/dashboard");
      }, 1800);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center px-6">
        <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#f5f1ea] flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-[#b89968] animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3">
            Analyzing your profile...
          </h2>
          <p className="text-slate-500 leading-relaxed">
            Capabl is reviewing your skills, resume, and career goal
            to build your personalized roadmap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl bg-white rounded-[2rem] p-10 border border-[#e8e6e1] shadow-sm">
        <div className="mb-10 text-center">
          <div className="w-20 h-20 rounded-full bg-[#f5f1ea] flex items-center justify-center mx-auto mb-5">
            <User className="w-10 h-10 text-[#1d1d1f]" />
          </div>
          <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
            Complete Your Profile
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Welcome, {userInfo?.name || "there"} 👋
            <br />
            Help Capabl personalize your career journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Full Name
            </label>
            <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">
              <User className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-transparent outline-none flex-1"
              />
            </div>
          </div>

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

          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              GitHub Profile
            </label>
            <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">
              <img src="/github.jpg" alt="github" className="w-5 h-5" />
              <input
                type="text"
                placeholder="https://github.com/yourusername"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="bg-transparent outline-none flex-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              LinkedIn Profile
            </label>
            <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">
              <img src="/linkedin.jpg" alt="linkedin" className="w-5 h-5" />
              <input
                type="text"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="bg-transparent outline-none flex-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Career Goal
            </label>
            <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">
              <Target className="w-5 h-5 text-slate-400" />
              <select
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="bg-transparent outline-none flex-1"
              >
                <option value="">Select a career goal</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Mobile Developer">Mobile Developer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Skills
            </label>
            <div className="border border-[#e8e6e1] rounded-2xl px-4 py-3 bg-[#fafafa]">
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1d1d1f] text-white text-xs font-medium"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={onSkillKey}
                placeholder="Type a skill and press Enter"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {POPULAR_SKILLS.filter(
                (p) => !skills.some((s) => s.toLowerCase() === p.toLowerCase())
              )
                .slice(0, 10)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="px-3 py-1 rounded-full border border-[#e8e6e1] text-xs font-medium hover:bg-[#f5f1ea]"
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Resume Upload <span className="text-red-500">*</span>
            </label>
            <label
              htmlFor="resume-upload"
              className="block border-2 border-dashed border-[#e8e6e1] rounded-2xl px-5 py-8 bg-[#fafafa] cursor-pointer hover:border-[#b89968] hover:bg-[#fdfaf4] transition-all text-center"
            >
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={onFileChange}
                className="hidden"
              />
              {resumeFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6 text-[#b89968]" />
                  <div className="text-left">
                    <p className="font-semibold text-[#1d1d1f]">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(resumeFile.size / 1024).toFixed(1)} KB · click to replace
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#1d1d1f]">
                    Click to upload your resume
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, DOC, or DOCX up to 8 MB
                  </p>
                </>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-14 bg-[#1d1d1f] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue To Dashboard
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
