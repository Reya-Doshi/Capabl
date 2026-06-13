import { CheckCircle2, CircleAlert, Link2 } from "lucide-react";

const STATUS_TONE = {
  validated: {
    label: "Validated",
    className: "bg-[#e7f7ea] text-green-700 border-green-100",
    icon: CheckCircle2,
  },
  connected: {
    label: "Connected",
    className: "bg-[#edf3ff] text-blue-700 border-blue-100",
    icon: Link2,
  },
  missing: {
    label: "Missing",
    className: "bg-[#fff2e4] text-orange-700 border-orange-100",
    icon: CircleAlert,
  },
};

function normalizeProfileStatus(profileStatus, userInfo) {
  const fallback = {
    resume: {
      key: "resume",
      label: "Resume",
      status: userInfo?.resume ? "validated" : "missing",
      detail: userInfo?.resumeName || (userInfo?.resume ? "Resume on file" : "Resume missing"),
      url: userInfo?.resume || null,
    },
    github: {
      key: "github",
      label: "GitHub",
      status: userInfo?.github ? "connected" : "missing",
      detail: userInfo?.github ? "GitHub URL connected" : "GitHub missing",
      url: userInfo?.github || null,
    },
    linkedin: {
      key: "linkedin",
      label: "LinkedIn",
      status: userInfo?.linkedin ? "connected" : "missing",
      detail: userInfo?.linkedin ? "LinkedIn URL connected" : "LinkedIn missing",
      url: userInfo?.linkedin || null,
    },
  };

  return ["resume", "github", "linkedin"].map((key) => ({
    ...fallback[key],
    ...(profileStatus?.[key] || {}),
  }));
}

export default function ProfileStatus({ profileStatus, userInfo, icons = {} }) {
  const items = normalizeProfileStatus(profileStatus, userInfo);

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {items.map((item) => {
        const tone = STATUS_TONE[item.status] || STATUS_TONE.missing;
        const StatusIcon = tone.icon;
        const BrandIcon = icons[item.key];

        return (
          <div key={item.key} className="border border-[#e8e6e1] rounded-[2rem] p-5 bg-white">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f1ea] flex items-center justify-center">
                  {BrandIcon ? (
                    <BrandIcon className="w-6 h-6 object-contain" />
                  ) : (
                    <StatusIcon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1d1d1f]">{item.label}</h3>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${tone.className}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {tone.label}
              </span>
            </div>

            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-blue-600 break-words hover:underline"
              >
                {item.url}
              </a>
            ) : (
              <p className="text-sm text-slate-400">Not connected</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
