import {
  LayoutDashboard,
  Brain,
  Route,
  FileSearch,
  FileText,
  Video,
  FolderKanban,
  Bookmark,
  User,
  Settings,
  Bell,
  MapPin,
  Mail,
  Calendar,
  CheckCircle2,
  LogOut,
  Camera,
  Pencil,
  X,
  Loader2,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import logout from "../utils/logout";
import { apiUrl, assetUrl } from "../config/api";

export default function Profile() {

  const [userInfo, setUserInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Inline profile editor — lets users update college / GitHub / LinkedIn /
  // portfolio / bio etc. after onboarding without re-running the wizard.
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); // { name, careerGoal, college, age, bio, github, linkedin, portfolio, phone }
  const [formSkills, setFormSkills] = useState([]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(apiUrl("/api/analysis"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(data.user);
      setAnalysis(data.analysis);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) logout();
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Pull the FULL user record (includes phone/portfolio, which the analysis
  // payload omits) so the editor pre-fills every field accurately.
  const openEditor = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(apiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const u = data.user || userInfo || {};
      setForm({
        name: u.name || "",
        careerGoal: u.careerGoal || "",
        college: u.college || "",
        age: u.age ?? "",
        bio: u.bio || "",
        github: u.github || "",
        linkedin: u.linkedin || "",
        portfolio: u.portfolio || "",
        phone: u.phone || "",
      });
      setFormSkills((u.skills || []).map((s) => (typeof s === "string" ? s : s?.name)).filter(Boolean));
      setEditing(true);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) logout();
      else toast.error("Could not load your profile for editing");
    }
  };

  const saveEditor = async () => {
    if (!form) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      // Send every field the editor owns. upsertProfile nulls any omitted field
      // and rebuilds skills from req.body.skills, so we resend existing skills
      // to avoid wiping them.
      const fd = new FormData();
      fd.append("name", form.name || "");
      fd.append("careerGoal", form.careerGoal || "");
      fd.append("college", form.college || "");
      fd.append("age", form.age === "" || form.age == null ? "" : String(form.age));
      fd.append("bio", form.bio || "");
      fd.append("github", form.github || "");
      fd.append("linkedin", form.linkedin || "");
      fd.append("portfolio", form.portfolio || "");
      fd.append("phone", form.phone || "");
      fd.append("skills", JSON.stringify(formSkills));

      const { data } = await axios.post(apiUrl("/api/profile"), fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data?.analysis) setAnalysis(data.analysis);

      // Keep localStorage userInfo in sync for the rest of the app.
      try {
        const stored = JSON.parse(localStorage.getItem("userInfo") || "null") || {};
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...stored,
            name: form.name,
            college: form.college,
            careerGoal: form.careerGoal,
            github: form.github,
            linkedin: form.linkedin,
          })
        );
      } catch {
        /* ignore localStorage issues */
      }

      // Re-fetch the canonical analysis payload so userInfo.skills stays a
      // string array (upsertProfile returns skills as objects).
      await fetchProfile();

      toast.success("Profile updated");
      setEditing(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  const skills = Array.isArray(userInfo?.skills)
    ? userInfo.skills
    : Array.isArray(analysis?.extractedSkills)
    ? analysis.extractedSkills
    : [];

  const resumeUrl = userInfo?.resume
    ? assetUrl(userInfo.resume)
    : null;

  return (

    <div className="min-h-screen bg-[#f7f5f2] flex">

      {/* SIDEBAR */}

      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">

        {/* LOGO */}

        <a href="/" className="flex items-center gap-2 mb-12">

          <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">

            <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full"></div>

          </div>

          <span className="text-xl font-bold">
            Capabl
          </span>

        </a>

        {/* NAV */}

        <div className="space-y-2">

          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>

          <a
            href="/analyzer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Brain className="w-5 h-5" />
            AI Analyzer
          </a>

          <a
            href="/road-map"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Route className="w-5 h-5" />
            Roadmap
          </a>

          <a
            href="/skill-gap"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <FileSearch className="w-5 h-5" />
            Skill Gap
          </a>

          <a
            href="/resume"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <FileText className="w-5 h-5" />
            Resume
          </a>

          <a
            href="/interview"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Video className="w-5 h-5" />
            Mock Interview
          </a>

          <a
            href="/projects"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <FolderKanban className="w-5 h-5" />
            Projects
          </a>

          <a
            href="/recommendations"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Bookmark className="w-5 h-5" />
            Recommendations
          </a>

          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
          >
            <User className="w-5 h-5 text-white" />
            Profile
          </a>

          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <Settings className="w-5 h-5" />
            Settings
          </a>

        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-semibold mt-6"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

      </aside>

      {/* MAIN */}

      <main className="flex-1 lg:ml-[270px] p-8 lg:p-12">



        {/* CONTENT */}

        <div>

          {/* HEADER */}

          
{/* HEADER */}

<div className="flex items-start justify-between mb-10">

  <div>

    <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
      My Profile
    </h1>

    <p className="text-slate-500 text-lg font-medium">
      Manage your personal information and career insights.
    </p>

  </div>

  {/* RIGHT */}

  <div className="flex items-center gap-5">

    {/* EDIT PROFILE */}

    <button
      onClick={openEditor}
      className="h-12 px-5 rounded-2xl bg-[#1d1d1f] text-white flex items-center gap-2 font-semibold hover:opacity-90 transition-all duration-300"
    >
      <Pencil className="w-4 h-4" />
      Edit Profile
    </button>

    {/* BELL */}

    <button className="w-12 h-12 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300">

      <Bell className="w-5 h-5 text-[#1d1d1f]" />

    </button>

    {/* PROFILE */}

    <div className="flex items-center gap-3">

      <div className="w-12 h-12 rounded-full bg-[#77410e] flex items-center justify-center text-white font-bold text-lg">

        {(userInfo?.name || "U")
          .charAt(0)
          .toUpperCase()}

      </div>

      <div>

        <h3 className="font-semibold text-[#1d1d1f]">
          {userInfo?.name}
        </h3>

        <p className="text-sm text-slate-500">
          Student
        </p>

      </div>

    </div>

  </div>

</div>
          {/* PROFILE CARD */}

          <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-7 mb-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">

            <div className="flex items-center justify-between">

              {/* LEFT */}

              <div className="flex items-center gap-8">

                <div className="relative">


              <div className="w-[120px] h-[120px] rounded-full bg-[#917a59] flex items-center justify-center text-white text-[48px] font-bold shadow-[0_15px_35px_rgba(145,122,89,0.28)] select-none transition-all duration-300 group-hover:scale-[1.02]">

  {(userInfo?.name || "U")
    .charAt(0)
    .toUpperCase()}

</div>
                  

                 <button className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-white border border-[#ececec] flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300">

                    <Camera className="w-5 h-5" />

                  </button>

                </div>

                {/* INFO */}

                <div>

                  <div className="flex items-center gap-4 mb-3">

                    <h2 className="text-[22px] font-semibold text-[#111111]">

                      {userInfo?.name}

                    </h2>

                    <div className="h-8 px-3 rounded-full bg-[#e8f8ef] text-green-700 flex items-center gap-2 text-[12px] font-semibold">

                      <CheckCircle2 className="w-4 h-4" />

                      Verified

                    </div>

                  </div>

                  <p className="text-[15px] text-slate-700 font-medium mb-4">

                    {userInfo?.careerGoal || analysis?.careerFit || "Career goal not set"}

                  </p>

                  <div className="flex items-center gap-6 text-slate-500 font-medium text-[14px]">

                    <div className="flex items-center gap-2">

                      <MapPin className="w-4 h-4" />

                      {userInfo?.college || "College not added"}

                    </div>

                    <div className="flex items-center gap-2">

                      <Mail className="w-4 h-4" />

                      {userInfo?.email}

                    </div>

                    <div className="flex items-center gap-2">

                      <Calendar className="w-4 h-4" />

                      Age {userInfo?.age || "—"}

                    </div>

                  </div>

                </div>

              </div>

              {/* RIGHT */}

              <div className="w-[320px]">

                <div className="flex items-center justify-between mb-3">

                  <h3 className="text-[16px] font-semibold text-[#111111]">

                    Readiness Score

                  </h3>

                  <span className="text-[#c89a2b] text-[16px] font-semibold">

                    {analysis?.readinessScore ?? 0}%

                  </span>

                </div>

                <div className="h-3 rounded-full bg-[#ece7df] overflow-hidden mb-4">

                  <div
                    style={{
                      width: `${analysis?.readinessScore ?? 0}%`,
                    }}
                    className="h-full bg-[#c89a2b] rounded-full"
                  ></div>

                </div>

                <p className="text-[#6b7280] text-[14px] leading-6">

                  AI-generated career readiness based on your profile and resume.

                </p>

              </div>

            </div>

          </div>

          {/* GRID */}

          <div className="grid lg:grid-cols-[1fr,1fr,1fr] gap-5">

            {/* ABOUT */}

            <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">

              <h2 className="text-[18px] font-semibold text-[#111111] mb-6">

                About Me

              </h2>

              <p className="text-[14px] text-[#6b7280] leading-7 mb-7">

                {userInfo?.bio || "No bio added yet."}

              </p>

              <div className="border-t border-[#ececec] pt-6 mb-6">

                <div className="grid grid-cols-2 gap-6">

                  <div>

                    <p className="text-[12px] text-slate-400 mb-2">

                      Match Score

                    </p>

                    <h3 className="text-[15px] font-medium">

                      {analysis?.matchScore ?? 0}%

                    </h3>

                  </div>

                  <div>

                    <p className="text-[12px] text-slate-400 mb-2">

                      Skills

                    </p>

                    <h3 className="text-[15px] font-medium">

                      {skills.length} added

                    </h3>

                  </div>

                </div>

              </div>

              {/* SOCIAL */}

              <div className="flex items-center gap-4 mt-6">

                <a
  href={userInfo?.linkedin}
  target="_blank"
  rel="noreferrer"
>

                  <img
                    src="/linkedin.jpg"
                    alt="LinkedIn"
className="w-11 h-11 rounded-full object-cover border border-[#ece7dc] p-2 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)]"                  />

                </a>

                <a
  href={userInfo?.github}
  target="_blank"
  rel="noreferrer"
>

                  <img
                    src="/github.jpg"
                    alt="GitHub"
className="w-11 h-11 rounded-full object-cover border border-[#ece7dc] p-2 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)]"                  />

                </a>

                {resumeUrl ? (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d1d1f] text-white text-sm font-medium"
                  >
                    View Resume
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-sm font-medium">
                    No resume
                  </span>
                )}

              </div>

            </div>

            {/* EDUCATION */}

            <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">

              <h2 className="text-[18px] font-semibold text-[#111111] mb-6">

                Education

              </h2>

              <div className="border border-[#ececec] rounded-2xl p-5">

                <h3 className="text-[17px] font-semibold mb-2">

                  {userInfo?.college || "College not added"}

                </h3>

                <p className="text-[14px] text-[#6b7280] mb-3">

                  Career goal: {userInfo?.careerGoal || "Not set"}

                </p>

                <div className="flex items-center gap-4">

                  <span className="text-[13px] text-slate-500">

                    Age: {userInfo?.age || "—"}

                  </span>

                  <div className="px-3 py-1 rounded-full bg-[#e8f8ef] text-green-700 text-[12px] font-semibold">

                    {analysis?.careerFit || "—"}

                  </div>

                </div>

              </div>

            </div>

            {/* SKILLS */}

            <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">

              <h2 className="text-[18px] font-semibold text-[#111111] mb-6">

                Skills

              </h2>

              <div className="flex flex-wrap gap-3">

                {skills.length > 0 ? (

                  skills.map((skill, index) => (

                    <div
                      key={index}
                      className="px-4 py-2 rounded-full bg-[#f7f5f2] text-[13px] font-medium transition-all duration-300 hover:bg-[#ece7df] hover:-translate-y-[2px]"
                    >
                      {skill}
                    </div>

                  ))

                ) : (

                  <p className="text-slate-400 text-sm">

                    Skills not analyzed yet.

                  </p>

                )}

              </div>

            </div>

          </div>

        </div>

        {/* EDIT PROFILE MODAL */}

        {editing && form && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] border border-[#e8e6e1] shadow-xl max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between px-7 py-5 border-b border-[#f1f1f1] sticky top-0 bg-white rounded-t-[2rem]">
                <h2 className="text-xl font-bold text-[#1d1d1f]">Edit Profile</h2>
                <button
                  onClick={() => !saving && setEditing(false)}
                  className="w-10 h-10 rounded-full hover:bg-[#f5f1ea] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-7 space-y-5">

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-transparent outline-none"
                    />
                  </Field>
                  <Field label="Career Goal">
                    <input
                      type="text"
                      value={form.careerGoal}
                      onChange={(e) => setField("careerGoal", e.target.value)}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full bg-transparent outline-none"
                    />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="College / Institution">
                    <input
                      type="text"
                      value={form.college}
                      onChange={(e) => setField("college", e.target.value)}
                      placeholder="Your college"
                      className="w-full bg-transparent outline-none"
                    />
                  </Field>
                  <Field label="Age">
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setField("age", e.target.value)}
                      placeholder="Age"
                      className="w-full bg-transparent outline-none"
                    />
                  </Field>
                </div>

                <Field label="Bio">
                  <textarea
                    value={form.bio}
                    onChange={(e) => setField("bio", e.target.value)}
                    placeholder="A short bio"
                    rows={3}
                    className="w-full bg-transparent outline-none resize-none"
                  />
                </Field>

                <Field label="GitHub">
                  <input
                    type="text"
                    value={form.github}
                    onChange={(e) => setField("github", e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full bg-transparent outline-none"
                  />
                </Field>

                <Field label="LinkedIn">
                  <input
                    type="text"
                    value={form.linkedin}
                    onChange={(e) => setField("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full bg-transparent outline-none"
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Portfolio">
                    <input
                      type="text"
                      value={form.portfolio}
                      onChange={(e) => setField("portfolio", e.target.value)}
                      placeholder="https://your-portfolio.com"
                      className="w-full bg-transparent outline-none"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="Phone number"
                      className="w-full bg-transparent outline-none"
                    />
                  </Field>
                </div>

                <p className="text-xs text-slate-400">
                  Saving re-runs your AI analysis with the updated profile. Your
                  skills and resume are preserved.
                </p>
              </div>

              <div className="flex gap-3 px-7 py-5 border-t border-[#f1f1f1] sticky bottom-0 bg-white rounded-b-[2rem]">
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="h-12 px-5 rounded-2xl border border-[#e8e6e1] font-semibold hover:bg-[#f5f1ea] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditor}
                  disabled={saving}
                  className="flex-1 h-12 rounded-2xl bg-[#1d1d1f] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving &amp; re-analyzing...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#1d1d1f] block mb-2">
        {label}
      </label>
      <div className="min-h-14 border border-[#e8e6e1] rounded-2xl px-4 py-3 bg-[#fafafa]">
        {children}
      </div>
    </div>
  );
}
