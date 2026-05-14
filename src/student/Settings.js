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
  Shield,
  Trash2,
  Camera,
  Mail,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f2] flex">
      {/* SIDEBAR */}

      <aside className="w-[270px] bg-white border-r border-[#e8e6e1] min-h-screen px-6 py-8 hidden lg:flex flex-col fixed left-0 top-0">
        {/* LOGO */}

        <a href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#1d1d1f] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#1d1d1f] rounded-full"></div>
          </div>

          <span className="text-xl font-bold">Capabl</span>
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
            <button className="w-11 h-11 rounded-2xl bg-white border border-[#e8e6e1] flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-[#1d1d1f]" />

              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#c89a2b] text-white text-[10px] flex items-center justify-center font-bold">
                3
              </div>
            </button>

            <div className="flex items-center gap-3 px-3 h-12 rounded-2xl border border-[#ece7dc] bg-white">
              <img
                src="https://i.pravatar.cc/150?img=32"
                alt="profile"
                className="w-9 h-9 rounded-full object-cover"
              />

              <div>
                <p className="text-[14px] font-semibold text-[#111111]">
                  Hi, Reya 👋
                </p>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="px-8 py-7">
          {/* HEADER */}

          <div className="mb-7">
            <h1 className="text-[28px] font-semibold text-[#111111] mb-1">
              Settings
            </h1>

            <p className="text-[15px] text-[#6b7280]">
              Manage your account preferences and application settings
            </p>
          </div>

          {/* PROFILE INFO */}

          <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-7 mb-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-[20px] font-semibold text-[#111111] mb-1">
                  Profile Information
                </h2>

                <p className="text-[14px] text-[#6b7280]">
                  Update your personal information and profile picture
                </p>
              </div>

              <button className="group h-11 px-5 rounded-xl bg-[#c89a2b] text-white text-[14px] font-medium transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_25px_rgba(200,154,43,0.22)] active:scale-[0.97] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Save Changes
              </button>
            </div>

            <div className="flex gap-8">
              {/* IMAGE */}

              <div className="relative">
                <img
                  src="https://i.pravatar.cc/200?img=32"
                  alt="profile"
                  className="w-[110px] h-[110px] rounded-full object-cover"
                />

                <button className="group absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#1d1d1f] flex items-center justify-center border-4 border-white transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)] active:scale-95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <Camera className="w-4 h-4 text-white transition-all duration-300 group-hover:rotate-12" />
                </button>
              </div>

              {/* FORM */}

              <div className="grid grid-cols-2 gap-5 flex-1">
                <div>
                  <label className="text-[14px] font-medium text-[#111111] block mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value="Reya Doshi"
                    className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] focus:border-[#c89a2b] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[14px] font-medium text-[#111111] block mb-2">
                    Email
                  </label>

                  <input
                    type="text"
                    value="reya@gmail.com"
                    className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] focus:border-[#c89a2b] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[14px] font-medium text-[#111111] block mb-2">
                    College / University
                  </label>

                  <input
                    type="text"
                    value="BRECW Hyderabad"
                    className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] focus:border-[#c89a2b] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[14px] font-medium text-[#111111] block mb-2">
                    Course
                  </label>

                  <input
                    type="text"
                    value="B.Tech Information Technology"
                    className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] focus:border-[#c89a2b] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PREFERENCES */}

          <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-7 mb-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
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

                <select className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] bg-white transition-all focus:border-[#c89a2b]">
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#111111] block mb-2">
                  Time Zone
                </label>

                <select className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] bg-white transition-all focus:border-[#c89a2b]">
                  <option>
                    (GMT+05:30) India Standard Time
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#111111] block mb-2">
                  Notification Plan
                </label>

                <select className="w-full h-12 px-4 rounded-xl border border-[#dedad2] outline-none text-[14px] bg-white transition-all focus:border-[#c89a2b]">
                  <option>Standard</option>
                  <option>Important Only</option>
                  <option>All Notifications</option>
                </select>
              </div>
            </div>
          </div>

          {/* LOWER GRID */}

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* NOTIFICATIONS */}

            <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-7 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <div className="mb-6">
                <h2 className="text-[20px] font-semibold text-[#111111] mb-1">
                  Notifications
                </h2>

                <p className="text-[14px] text-[#6b7280]">
                  Manage how you want to be notified
                </p>
              </div>

              <div className="space-y-7">
                {[
                  [
                    "Email Notifications",
                    "Receive updates and important information via email",
                    true,
                  ],
                  [
                    "Push Notifications",
                    "Get notified about progress and reminders",
                    true,
                  ],
                  [
                    "Marketing Emails",
                    "Receive tips, offers and product updates",
                    false,
                  ],
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-[15px] font-medium text-[#111111] mb-1">
                        {item[0]}
                      </h3>

                      <p className="text-[13px] text-[#6b7280]">
                        {item[1]}
                      </p>
                    </div>

                    <button
                      className={`w-11 h-6 rounded-full flex items-center px-1 transition-all duration-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        item[2]
                          ? "bg-[#c89a2b] justify-end"
                          : "bg-[#e5e5e5] justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full transition-all duration-300"></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PRIVACY */}

            <div className="bg-white border border-[#e8e6e1] rounded-[22px] p-7 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <div className="mb-6">
                <h2 className="text-[20px] font-semibold text-[#111111] mb-1">
                  Privacy & Security
                </h2>

                <p className="text-[14px] text-[#6b7280]">
                  Manage your privacy and security settings
                </p>
              </div>

              <div className="space-y-6">
                {[
                  [
                    "Change Password",
                    "Update your account password",
                  ],
                  [
                    "Two-Factor Authentication",
                    "Add an extra layer of security",
                  ],
                  [
                    "Data & Privacy",
                    "Manage your data and privacy preferences",
                  ],
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-2xl transition-all duration-300 hover:bg-[#faf7f2]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#f7f5f2] flex items-center justify-center transition-all duration-300 hover:bg-[#ece7df]">
                        {index === 0 && (
                          <Shield className="w-5 h-5" />
                        )}

                        {index === 1 && (
                          <Bell className="w-5 h-5" />
                        )}

                        {index === 2 && (
                          <Mail className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-[15px] font-medium text-[#111111] mb-1">
                          {item[0]}
                        </h3>

                        <p className="text-[13px] text-[#6b7280]">
                          {item[1]}
                        </p>
                      </div>
                    </div>

                    <ChevronDown className="-rotate-90 w-5 h-5 text-slate-400 transition-all duration-300 hover:translate-x-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DANGER ZONE */}

          <div className="bg-[#fff5f3] border border-[#f4d5cf] rounded-[22px] p-7 flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(180,35,24,0.06)]">
            <div>
              <h2 className="text-[20px] font-semibold text-[#b42318] mb-1">
                Danger Zone
              </h2>

              <p className="text-[14px] text-[#7a271a]">
                Permanently delete your account and all data
              </p>
            </div>

            <button className="group h-11 px-6 rounded-xl border border-[#ef4444] text-[#dc2626] text-[14px] font-medium transition-all duration-300 hover:bg-red-50 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <Trash2 className="w-4 h-4 transition-all duration-300 group-hover:rotate-6" />
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}