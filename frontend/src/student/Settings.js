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
  ChevronDown,
  Trash2,
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

      <main className="flex-1 lg:ml-[270px]">

        {/* TOPBAR */}

        <div className="h-[86px] bg-white border-b border-[#e8e6e1] px-10 flex items-center justify-end">

          <div className="flex items-center gap-5">

            

<div className="w-11 h-11 rounded-full bg-[#ac731e] flex items-center justify-center text-white font-bold text-lg">
                {(userInfo?.name || "U")
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div>

                <p className="text-[14px] font-semibold text-[#111111]">
                  {userInfo?.name}
                </p>

              </div>


            </div>

          </div>

        

        {/* CONTENT */}

        <div className="px-8 py-7">

          <div className="mb-7">

            <h1 className="text-[28px] font-semibold text-[#111111] mb-1">
              Settings
            </h1>

            <p className="text-[15px] text-[#6b7280]">
              Manage your account preferences and application settings
            </p>

          </div>

          {/* PREFERENCES */}

          <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-7 mb-6">

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

                <select className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] bg-white">

                  <option>Standard</option>
                  <option>Important Only</option>
                  <option>All Notifications</option>

                </select>

              </div>

            </div>

          </div>

          {/* PASSWORD */}

          <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-7 mb-6">

            <div className="mb-6">

              <h2 className="text-[20px] font-semibold text-[#111111] mb-1">
                Privacy & Security
              </h2>

              <p className="text-[14px] text-[#6b7280]">
                Protect your account and data
              </p>

            </div>

            <div className="border border-[#ececec] rounded-2xl p-5 mb-5">

              <h3 className="text-[16px] font-semibold text-[#111111] mb-4">
                Change Password
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-5">

                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px]"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px]"
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px]"
                />

              </div>

              <button
                onClick={handlePasswordChange}
                className="h-11 px-5 rounded-xl bg-[#1d1d1f] text-white text-[14px] font-medium"
              >
                Update Password
              </button>

            </div>

            <div className="border border-[#ececec] rounded-2xl p-5 mb-5 flex items-center justify-between">

              <div>

                <h3 className="text-[16px] font-semibold text-[#111111] mb-1">
                  Two-Factor Authentication
                </h3>

                <p className="text-[13px] text-[#6b7280]">
                  Google OTP verification for additional security
                </p>

              </div>

              <button className="h-11 px-5 rounded-xl border border-[#dedad2] text-[14px] font-medium">
                Coming Soon
              </button>

            </div>

            <div className="border border-[#ececec] rounded-2xl p-5 flex items-center justify-between">

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
                className="h-11 px-5 rounded-xl border border-[#dedad2] text-[14px] font-medium"
              >
                Manage
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}