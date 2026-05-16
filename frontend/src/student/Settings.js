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
} from "lucide-react";

import { useState } from "react";

import axios from "axios";

export default function SettingsPage() {

  const storedUser = localStorage.getItem("userInfo");

  const userInfo = storedUser
    ? JSON.parse(storedUser)
    : null;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteText, setDeleteText] = useState("");

  const handlePasswordChange = async () => {

    if (newPassword !== confirmPassword) {

      alert("Passwords do not match");

      return;

    }

    try {

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/users/change-password",

        {
          currentPassword,
          newPassword,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );

    }

  };
  const handleDeleteAccount = async () => {

  if (deleteText !== "DELETE") {

    alert('Please type "DELETE" correctly');

    return;

  }

  try {

    const token = localStorage.getItem("token");

    await axios.delete(
      "http://localhost:5000/api/users/delete-account",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    alert("Account deleted successfully");

    window.location.href = "/";

  } catch (error) {

    alert(
      error.response?.data?.message ||
      "Something went wrong"
    );

  }

};

  return (

    <div className="min-h-screen bg-[#f7f5f2] flex">

      {/* SIDEBAR */}

      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">

        <a href="/" className="flex items-center gap-2 mb-12">

          <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full"></div>
          </div>

          <span className="text-xl font-bold">
            Capabl
          </span>

        </a>

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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f5f1ea] transition-all font-medium"
          >
            <User className="w-5 h-5" />
            Profile
          </a>

          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-white font-semibold"
          >
            <Settings className="w-5 h-5 text-white" />
            Settings
          </a>

        </div>

      </aside>

      {/* MAIN */}

      <main className="flex-1 lg:ml-[270px] p-8 lg:p-12">


       {/* HEADER */}

<div className="flex items-start justify-between mb-10">

  <div>

    <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
      Settings
    </h1>

    <p className="text-slate-500 text-lg font-medium">
      Manage your preferences and personalize your experience.
    </p>

  </div>

  {/* RIGHT */}

  <div className="flex items-center gap-5">

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

          {/* PREFERENCES */}

<div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-7 mb-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
            <div className="mb-6">

              <h2 className="text-[20px] font-semibold text-[#111111] mb-1">
                Preferences
              </h2>

              <p className="text-[14px] text-[#6b7280]">
                Customize your learning experience
              </p>

            </div>

            <div className="grid grid-cols-3 gap-6">

              <div>

                <label className="text-[14px] font-medium text-[#111111] block mb-2">
                  Language
                </label>

                <div className="w-full h-12 px-4 rounded-xl border border-[#dedad2] bg-[#fafafa] flex items-center text-[14px] font-medium text-[#111111]">
                  English
                </div>

              </div>

              <div>

                <label className="text-[14px] font-medium text-[#111111] block mb-2">
                  Time Zone
                </label>

                <div className="w-full h-12 px-4 rounded-xl border border-[#dedad2] bg-[#fafafa] flex items-center text-[14px] font-medium text-[#111111]">
                  (GMT+05:30) India Standard Time
                </div>

              </div>

              <div>

                <label className="text-[14px] font-medium text-[#111111] block mb-2">
                  Notification Plan
                </label>

                <select className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] bg-white transition-all duration-300 focus:border-[#c89a2b] focus:shadow-[0_0_0_4px_rgba(200,154,43,0.12)]">

                  <option>Standard</option>
                  <option>Important Only</option>
                  <option>All Notifications</option>

                </select>

              </div>

            </div>

          </div>

          {/* PASSWORD */}

          <div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-7 mb-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">

            <div className="mb-6">

              <h2 className="text-[20px] font-semibold text-[#111111] mb-1">
                Privacy & Security
              </h2>

              <p className="text-[14px] text-[#6b7280]">
                Protect your account and data
              </p>

            </div>

            <div className="border border-[#ececec] rounded-2xl p-5 transition-all duration-300 hover:border-[#e6d7b7] hover:shadow-[0_10px_25px_rgba(0,0,0,0.04)]">

              <h3 className="text-[16px] font-semibold text-[#111111] mb-4">
                Change Password
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-5">

                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] transition-all duration-300 focus:border-[#c89a2b] focus:shadow-[0_0_0_4px_rgba(200,154,43,0.12)]"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] transition-all duration-300 focus:border-[#c89a2b] focus:shadow-[0_0_0_4px_rgba(200,154,43,0.12)]"
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] transition-all duration-300 focus:border-[#c89a2b] focus:shadow-[0_0_0_4px_rgba(200,154,43,0.12)]"
                />

              </div>

              <button
  onClick={handlePasswordChange}
  className="h-11 px-5 rounded-xl bg-[#1d1d1f] text-white text-[14px] font-medium transition-all duration-300 hover:shadow-[0_12px_25px_rgba(0,0,0,0.15)] hover:-translate-y-[2px]"
>
  Update Password
</button>

            </div>

            <div className="border border-[#ececec] rounded-2xl p-5 mb-5 flex items-center justify-between transition-all duration-300 hover:border-[#e6d7b7] hover:shadow-[0_10px_25px_rgba(0,0,0,0.04)]">

  <div>

    <h3 className="text-[16px] font-semibold text-[#111111] mb-1">
      Two-Factor Authentication
    </h3>

    <p className="text-[13px] text-[#6b7280]">
      Google OTP verification for additional security
    </p>

  </div>

  <button
    className="h-11 px-5 rounded-xl border border-[#dedad2] text-[14px] font-medium transition-all duration-300 hover:bg-[#faf7f2] hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
  >
    Coming Soon
  </button>

</div>
{/* PLANS */}

<div className="group bg-white border border-[#e8e6e1] rounded-[2rem] p-7 mb-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">

  <div className="mb-7">

    <h2 className="text-[20px] font-semibold text-[#111111] mb-1">
      Subscription Plans
    </h2>

    <p className="text-[14px] text-[#6b7280]">
      Unlock premium AI features and advanced career tools
    </p>

  </div>

  <div className="grid lg:grid-cols-3 gap-5">

    {/* FREE */}

    <div className="border-2 border-[#c89a2b] rounded-[1.7rem] p-6 bg-[#fffaf2] relative transition-all duration-300 hover:shadow-[0_15px_35px_rgba(200,154,43,0.15)]">

      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#c89a2b] text-white text-[11px] font-semibold">

        ACTIVE

      </div>

      <div className="mb-5">

        <h3 className="text-[20px] font-semibold text-[#111111] mb-2">
          Free
        </h3>

        <p className="text-[14px] text-[#6b7280] leading-6">
          Essential AI tools for students getting started with career preparation.
        </p>

      </div>

      <h2 className="text-4xl font-bold text-[#111111] mb-5">
        ₹0
      </h2>

      <div className="space-y-3 mb-7">

        <div className="text-[14px] text-[#4b5563]">
          ✓ AI Resume Analysis
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Career Recommendations
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Skill Gap Detection
        </div>

        <div className="text-[14px] text-[#9ca3af]">
          ✕ Personalized Roadmaps
        </div>

        <div className="text-[14px] text-[#9ca3af]">
          ✕ 1-on-1 AI Mentorship
        </div>

        <div className="text-[14px] text-[#9ca3af]">
          ✕ Advanced Mock Interviews
        </div>

      </div>

      <button className="w-full h-11 rounded-xl bg-[#1d1d1f] text-white text-[14px] font-medium">

        ✓ Active Plan

      </button>

    </div>

    {/* PRO */}

    <div className="border border-[#ececec] rounded-[1.7rem] p-6 transition-all duration-300 hover:border-[#d8c5a2] hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)]">

      <div className="mb-5">

        <h3 className="text-[20px] font-semibold text-[#111111] mb-2">
          Pro
        </h3>

        <p className="text-[14px] text-[#6b7280] leading-6">
          Advanced AI guidance with deeper personalization and career growth tools.
        </p>

      </div>

      <h2 className="text-4xl font-bold text-[#111111] mb-5">
        ₹499
        <span className="text-base font-medium text-[#6b7280]">
          /month
        </span>
      </h2>

      <div className="space-y-3 mb-7">

        <div className="text-[14px] text-[#4b5563]">
          ✓ Personalized Career Roadmaps
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ AI Mock Interviews
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Smart Progress Tracking
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Advanced Skill Insights
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ 1-on-1 AI Mentorship
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Premium Learning Suggestions
        </div>

      </div>

      <button className="w-full h-11 rounded-xl border border-[#dedad2] text-[14px] font-medium transition-all duration-300 hover:bg-[#faf7f2]">

        Coming Soon

      </button>

    </div>

    {/* ENTERPRISE */}

    <div className="border border-[#ececec] rounded-[1.7rem] p-6 transition-all duration-300 hover:border-[#d8c5a2] hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)]">

      <div className="mb-5">

        <h3 className="text-[20px] font-semibold text-[#111111] mb-2">
          Enterprise
        </h3>

        <p className="text-[14px] text-[#6b7280] leading-6">
          Powerful recruiter and institution-focused AI ecosystem for teams.
        </p>

      </div>

      <h2 className="text-4xl font-bold text-[#111111] mb-5">
        Custom
      </h2>

      <div className="space-y-3 mb-7">

        <div className="text-[14px] text-[#4b5563]">
          ✓ Bulk Candidate Analysis
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Recruiter Dashboard
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ AI Hiring Intelligence
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Team Collaboration
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Institution Analytics
        </div>

        <div className="text-[14px] text-[#4b5563]">
          ✓ Priority Support
        </div>

      </div>

      <button className="w-full h-11 rounded-xl border border-[#dedad2] text-[14px] font-medium transition-all duration-300 hover:bg-[#faf7f2]">

        Coming Soon

      </button>

    </div>

  </div>

</div>

</div>
            <div className="border border-[#ececec] rounded-2xl p-5 flex items-center justify-between transition-all duration-300 hover:border-[#e6d7b7] hover:shadow-[0_10px_25px_rgba(0,0,0,0.04)]">

              <div>

                <h3 className="text-[16px] font-semibold text-[#111111] mb-1">
                  Data & Privacy
                </h3>

                <p className="text-[13px] text-[#6b7280]">
                  Manage AI history and exported data
                </p>

              </div>

              <button
  onClick={() => alert("Coming Soon")}
  className="h-11 px-5 rounded-xl border border-[#dedad2] text-[14px] font-medium transition-all duration-300 hover:bg-[#faf7f2] hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
>
  Manage
</button>

            </div>

{/* DELETE ACCOUNT */}

<div className="border border-red-200 rounded-2xl p-5 mt-5 bg-red-50/40 transition-all duration-300 hover:shadow-[0_10px_25px_rgba(239,68,68,0.08)]">

  <div className="mb-5">

    <h3 className="text-[18px] font-semibold text-red-600 mb-2">
      Delete Account
    </h3>

    <p className="text-[14px] text-slate-600 leading-6">
      This action is permanent and cannot be undone.
      Type <span className="font-semibold text-red-600">DELETE</span> to confirm account deletion.
    </p>

  </div>

  <div className="flex items-center gap-4">

    <input
      type="text"
      placeholder='Type "DELETE"'
      value={deleteText}
      onChange={(e) => setDeleteText(e.target.value)}
      className="flex-1 h-12 px-4 rounded-xl border border-red-200 outline-none text-[14px] bg-white focus:border-red-400"
    />

    <button
      onClick={handleDeleteAccount}
      className="h-12 px-6 rounded-xl bg-red-500 text-white text-[14px] font-medium transition-all duration-300 hover:bg-red-600 hover:shadow-[0_12px_25px_rgba(239,68,68,0.2)]"
    >

      Delete

    </button>

  </div>

</div>
      </main>

    </div>

  );

}