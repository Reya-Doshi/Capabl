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
  ArrowLeft,
  Upload,
  Target,
  X,
  Loader2,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
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

const CAREER_GOALS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "AI Engineer",
  "Data Scientist",
  "Data Analyst",
  "DevOps Engineer",
  "Mobile Developer",
  "Product Manager",
  "Cybersecurity Analyst",
];

const STEP_LABELS = ["Upload", "Review", "Connect", "Goal"];

export default function Onboarding() {
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  // Wizard position: 1 Upload · 2 Review · 3 Optional links · 4 Career goal
  const [step, setStep] = useState(1);

  // Evidence
  const [resumeFile, setResumeFile] = useState(null);

  // Extracted / confirmed profile
  const [name, setName] = useState(userInfo?.name || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState(userInfo?.college || "");
  const [education, setEducation] = useState({
    degree: "",
    field: "",
    institution: "",
    startYear: "",
    endYear: "",
    cgpa: "",
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [careerGoal, setCareerGoal] = useState("");

  // Async UI states
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // ── Skills chip helpers ───────────────────────────────────────────────
  const addSkill = (raw) => {
    const value = raw.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) return;
    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };
  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));
  const onSkillKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const removeCert = (c) => setCertifications(certifications.filter((x) => x !== c));
  const removeProject = (i) =>
    setProjects(projects.filter((_, idx) => idx !== i));

  // ── Step 1: upload → extract ──────────────────────────────────────────
  const onFileChange = async (e) => {
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
    await runExtraction(f);
  };

  const applyExtraction = (ex) => {
    if (!ex) return;
    if (ex.fullName) setName(ex.fullName);
    if (ex.email) setEmail(ex.email);
    if (ex.phone) setPhone(ex.phone);

    const edu = Array.isArray(ex.education) ? ex.education[0] : null;
    if (edu) {
      setEducation({
        degree: edu.degree || "",
        field: edu.field || "",
        institution: edu.institution || "",
        startYear: edu.startYear || "",
        endYear: edu.endYear || "",
        cgpa: edu.cgpa || "",
      });
      if (edu.institution) setCollege(edu.institution);
    }

    if (Array.isArray(ex.skills) && ex.skills.length) setSkills(ex.skills);
    if (Array.isArray(ex.projects)) setProjects(ex.projects);
    if (Array.isArray(ex.certifications)) {
      setCertifications(
        ex.certifications
          .map((c) => (typeof c === "string" ? c : c?.name))
          .filter(Boolean)
      );
    }

    if (ex.githubUrl) setGithub(ex.githubUrl);
    if (ex.linkedinUrl) setLinkedin(ex.linkedinUrl);
    if (ex.portfolioUrl) setPortfolio(ex.portfolioUrl);
  };

  const runExtraction = async (file) => {
    try {
      setExtracting(true);
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("resume", file);

      const { data } = await axios.post(
        apiUrl("/api/profile/resume/extract"),
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      applyExtraction(data.extraction);
      toast.success("Resume analyzed — review your details");
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Could not read that resume. You can still fill details manually."
      );
      setStep(2); // let the user proceed manually rather than dead-end
    } finally {
      setExtracting(false);
    }
  };

  // ── Step 4: confirm → save → analyze ──────────────────────────────────
  const handleSubmit = async () => {
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
      form.append("college", college || education.institution || "");
      form.append("bio", "");
      form.append("phone", phone);
      form.append("github", github);
      form.append("linkedin", linkedin);
      form.append("portfolio", portfolio);
      form.append("careerGoal", careerGoal);
      form.append("skills", JSON.stringify(skills));
      form.append("education", JSON.stringify([education]));
      form.append("certifications", JSON.stringify(certifications));
      form.append("projects", JSON.stringify(projects));
      // Resume was already saved during extraction — no file re-upload needed.

      const { data } = await axios.post(apiUrl("/api/profile"), form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

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
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── Full-screen states ────────────────────────────────────────────────
  if (analyzing) {
    return (
      <FullScreenSpinner
        title="Building your readiness profile..."
        subtitle="Capabl is matching your evidence against your target role to build an explainable readiness score."
      />
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────
  // Which links were auto-detected from the resume — used only to label the
  // fields ("detected" vs "not found"). The fields themselves are ALWAYS shown
  // and editable so a saved/extracted URL never becomes invisible (BUG-009).
  const detectedLinks = {
    github: Boolean(github),
    linkedin: Boolean(linkedin),
    portfolio: Boolean(portfolio),
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
      <div className="w-full max-w-3xl bg-white rounded-[2rem] p-6 sm:p-10 border border-[#e8e6e1] shadow-sm">
        <Stepper step={step} />

        {step === 1 && (
          <UploadStep
            resumeFile={resumeFile}
            extracting={extracting}
            onFileChange={onFileChange}
            userName={userInfo?.name}
          />
        )}

        {step === 2 && (
          <ReviewStep
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            setCollege={setCollege}
            education={education}
            setEducation={setEducation}
            skills={skills}
            skillInput={skillInput}
            setSkillInput={setSkillInput}
            addSkill={addSkill}
            removeSkill={removeSkill}
            onSkillKey={onSkillKey}
            projects={projects}
            removeProject={removeProject}
            certifications={certifications}
            removeCert={removeCert}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <OptionalLinksStep
            detectedLinks={detectedLinks}
            github={github}
            setGithub={setGithub}
            linkedin={linkedin}
            setLinkedin={setLinkedin}
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <GoalStep
            careerGoal={careerGoal}
            setCareerGoal={setCareerGoal}
            saving={saving}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// Sub-components
// ===========================================================================

function FullScreenSpinner({ title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center px-6">
      <div className="bg-white border border-[#e8e6e1] rounded-[2rem] p-12 text-center max-w-md w-full shadow-sm">
        <div className="w-20 h-20 rounded-full bg-[#f5f1ea] flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-[#b89968] animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3">{title}</h2>
        <p className="text-slate-500 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
      {STEP_LABELS.map((label, i) => {
        const index = i + 1;
        const active = index === step;
        const done = index < step;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  done
                    ? "bg-[#b89968] text-white"
                    : active
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-[#f5f1ea] text-slate-400"
                }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : index}
              </div>
              <span
                className={`hidden sm:block text-sm font-medium ${
                  active ? "text-[#1d1d1f]" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {index < STEP_LABELS.length && (
              <div
                className={`w-5 sm:w-8 h-px ${
                  done ? "bg-[#b89968]" : "bg-[#e8e6e1]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldShell({ icon: Icon, children }) {
  return (
    <div className="h-14 border border-[#e8e6e1] rounded-2xl px-5 flex items-center gap-3 bg-[#fafafa]">
      {Icon && <Icon className="w-5 h-5 text-slate-400" />}
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full h-14 bg-[#1d1d1f] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-14 px-5 border border-[#e8e6e1] text-[#1d1d1f] rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-[#f5f1ea] transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
      Back
    </button>
  );
}

function UploadStep({ resumeFile, extracting, onFileChange, userName }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#f5f1ea] flex items-center justify-center mx-auto mb-5">
          <FileText className="w-10 h-10 text-[#1d1d1f]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-3">
          Upload Your Resume
        </h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
          Welcome, {userName || "there"} 👋
          <br />
          We'll build your profile from your resume — no long forms.
        </p>
      </div>

      {extracting ? (
        <div className="border-2 border-dashed border-[#e8e6e1] rounded-2xl px-5 py-12 bg-[#fdfaf4] text-center">
          <Loader2 className="w-10 h-10 text-[#b89968] animate-spin mx-auto mb-4" />
          <p className="font-semibold text-[#1d1d1f]">Reading your resume...</p>
          <p className="text-sm text-slate-500 mt-1">
            Extracting your skills, projects, and contact details
          </p>
        </div>
      ) : (
        <label
          htmlFor="resume-upload"
          className="block border-2 border-dashed border-[#e8e6e1] rounded-2xl px-5 py-12 bg-[#fafafa] cursor-pointer hover:border-[#b89968] hover:bg-[#fdfaf4] transition-all text-center"
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
                <p className="font-semibold text-[#1d1d1f]">{resumeFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(resumeFile.size / 1024).toFixed(1)} KB · click to replace
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-9 h-9 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-[#1d1d1f]">
                Click to upload your resume
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, DOC, or DOCX up to 8 MB
              </p>
            </>
          )}
        </label>
      )}

      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
        <Sparkles className="w-4 h-4 text-[#b89968]" />
        Your resume is the primary source of truth. Everything else is optional.
      </div>
    </div>
  );
}

function ReviewStep(props) {
  const {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    setCollege,
    education,
    setEducation,
    skills,
    skillInput,
    setSkillInput,
    addSkill,
    removeSkill,
    onSkillKey,
    projects,
    removeProject,
    certifications,
    removeCert,
    onBack,
    onNext,
  } = props;

  const setEdu = (key, value) => {
    setEducation({ ...education, [key]: value });
    if (key === "institution") setCollege(value);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-2">
          Review Your Profile
        </h1>
        <p className="text-slate-500 leading-relaxed">
          We extracted this from your resume. Edit anything before saving.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Full Name
            </label>
            <FieldShell icon={User}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-transparent outline-none flex-1"
              />
            </FieldShell>
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Email
            </label>
            <FieldShell icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent outline-none flex-1"
              />
            </FieldShell>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Phone <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <FieldShell icon={Phone}>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="bg-transparent outline-none flex-1"
              />
            </FieldShell>
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              College / Institution
            </label>
            <FieldShell icon={GraduationCap}>
              <input
                type="text"
                value={education.institution}
                onChange={(e) => setEdu("institution", e.target.value)}
                placeholder="Your college"
                className="bg-transparent outline-none flex-1"
              />
            </FieldShell>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Degree
            </label>
            <input
              type="text"
              value={education.degree}
              onChange={(e) => setEdu("degree", e.target.value)}
              placeholder="e.g. B.Tech"
              className="w-full h-14 border border-[#e8e6e1] rounded-2xl px-5 bg-[#fafafa] outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Field
            </label>
            <input
              type="text"
              value={education.field}
              onChange={(e) => setEdu("field", e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full h-14 border border-[#e8e6e1] rounded-2xl px-5 bg-[#fafafa] outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Grad Year
            </label>
            <input
              type="text"
              value={education.endYear}
              onChange={(e) => setEdu("endYear", e.target.value)}
              placeholder="e.g. 2026"
              className="w-full h-14 border border-[#e8e6e1] rounded-2xl px-5 bg-[#fafafa] outline-none"
            />
          </div>
        </div>

        {/* Skills */}
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

        {/* Projects (read + remove) */}
        {projects.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Projects Detected
            </label>
            <div className="space-y-2">
              {projects.map((p, i) => (
                <div
                  key={i}
                  className="border border-[#e8e6e1] rounded-2xl px-4 py-3 bg-[#fafafa] flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-[#1d1d1f] text-sm">
                      {p.title || "Untitled project"}
                    </p>
                    {p.description && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.description}
                      </p>
                    )}
                    {Array.isArray(p.technologies) && p.technologies.length > 0 && (
                      <p className="text-xs text-[#b89968] mt-1">
                        {p.technologies.join(" · ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProject(i)}
                    className="text-slate-400 hover:text-slate-600 mt-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications (chips + remove) */}
        {certifications.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
              Certifications
            </label>
            <div className="flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e8e6e1] bg-[#fafafa] text-xs font-medium text-[#1d1d1f]"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => removeCert(c)}
                    className="hover:opacity-70 text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <BackButton onClick={onBack} />
        <PrimaryButton onClick={onNext}>
          Looks good
          <ArrowRight className="w-5 h-5" />
        </PrimaryButton>
      </div>
    </div>
  );
}

function OptionalLinksStep(props) {
  const {
    detectedLinks,
    github,
    setGithub,
    linkedin,
    setLinkedin,
    portfolio,
    setPortfolio,
    onBack,
    onNext,
  } = props;

  // Labels reflect whether we auto-detected the link, but the fields are ALWAYS
  // rendered and editable so an extracted/saved URL can never disappear (BUG-009).
  const label = (detected, found, missing) => (detected ? found : missing);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-2">
          Connect Your Profiles
        </h1>
        <p className="text-slate-500 leading-relaxed">
          These strengthen your confidence score. Edit anything we detected, or
          add what's missing — links never lower your readiness.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
            {label(detectedLinks.github, "GitHub detected — edit if needed", "GitHub — want to connect it?")}
          </label>
          <FieldShell>
            <img src="/github.jpg" alt="github" className="w-5 h-5" />
            <input
              type="text"
              placeholder="https://github.com/yourusername"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="bg-transparent outline-none flex-1"
            />
          </FieldShell>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
            {label(detectedLinks.linkedin, "LinkedIn detected — edit if needed", "LinkedIn — want to connect it?")}
          </label>
          <FieldShell>
            <img src="/linkedin.jpg" alt="linkedin" className="w-5 h-5" />
            <input
              type="text"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="bg-transparent outline-none flex-1"
            />
          </FieldShell>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
            {label(detectedLinks.portfolio, "Portfolio detected — edit if needed", "Portfolio — want to add it?")}
          </label>
          <FieldShell icon={Sparkles}>
            <input
              type="text"
              placeholder="https://your-portfolio.com"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="bg-transparent outline-none flex-1"
            />
          </FieldShell>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <BackButton onClick={onBack} />
        <PrimaryButton onClick={onNext}>
          Continue
          <ArrowRight className="w-5 h-5" />
        </PrimaryButton>
      </div>
    </div>
  );
}

function GoalStep({ careerGoal, setCareerGoal, saving, onBack, onSubmit }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#f5f1ea] flex items-center justify-center mx-auto mb-5">
          <Target className="w-10 h-10 text-[#1d1d1f]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] mb-2">
          What role are you preparing for?
        </h1>
        <p className="text-slate-500 leading-relaxed">
          This becomes your target role for semantic evidence matching.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {CAREER_GOALS.map((goal) => {
          const active = careerGoal === goal;
          return (
            <button
              key={goal}
              type="button"
              onClick={() => setCareerGoal(goal)}
              className={`h-14 rounded-2xl px-5 text-left font-semibold border transition-all ${
                active
                  ? "border-[#1d1d1f] bg-[#1d1d1f] text-white"
                  : "border-[#e8e6e1] bg-[#fafafa] text-[#1d1d1f] hover:border-[#b89968]"
              }`}
            >
              {goal}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-8">
        <BackButton onClick={onBack} />
        <PrimaryButton onClick={onSubmit} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Build My Readiness Profile
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}
