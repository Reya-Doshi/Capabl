import { useState } from "react";
import { Info, ChevronDown } from "lucide-react";

/**
 * Responsible AI panel — static, no API call. Explains the model's limits and
 * what Capabl never decides for the user. Collapsed by default, unobtrusive.
 */
export default function ResponsibleAIPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-[#e8e6e1] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f7f5f2] transition-all"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]">
          <Info className="w-4 h-4 text-[#b89968]" />
          How Capabl thinks
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 text-sm">
          <div>
            <h4 className="text-xs font-bold tracking-wide text-slate-400 mb-1">RISK</h4>
            <p className="text-slate-600">
              Users may over-rely on the readiness score and avoid applying for
              roles they are actually qualified for.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wide text-slate-400 mb-1">
              MITIGATION
            </h4>
            <p className="text-slate-600">
              Capabl shows confidence intervals based on available evidence and
              clearly displays which data sources are missing, so users
              understand the limits of each score.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wide text-slate-400 mb-2">
              WHAT CAPABL NEVER DECIDES FOR YOU
            </h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Your target role</li>
              <li>• Whether to apply for a job</li>
              <li>• Your personal timeline</li>
              <li>• Which offer to accept</li>
            </ul>
            <p className="text-slate-500 mt-3">
              These decisions stay with you. Capabl models the tradeoffs — you
              make the call.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
