import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Collapsible tradeoff reasoning for a recommendation. Collapsed by default.
 * Renders nothing when no reasoning is available.
 */
export default function ReasoningPanel({ reasoning }) {
  const [open, setOpen] = useState(false);

  if (!reasoning) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-[#b89968] hover:text-[#8a6f3e] transition-colors"
      >
        Why this over others?
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="mt-2 text-xs text-slate-600 bg-[#f7f5f2] rounded-lg px-3 py-2 leading-relaxed">
          {reasoning}
        </p>
      )}
    </div>
  );
}
