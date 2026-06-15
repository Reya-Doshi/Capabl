import { Info } from "lucide-react";

// Spec evidence weights — these match the backend EVIDENCE_WEIGHTS
// (interview .35, project .25, resume .20, cert .12, roadmap .08).
const SOURCES = [
  { name: "Interview", weight: 35, key: "interview" },
  { name: "Projects", weight: 25, key: "projects" },
  { name: "Resume", weight: 20, key: "resume" },
  { name: "Certs", weight: 12, key: "certs" },
  { name: "Roadmap", weight: 8, key: "roadmap" },
];

// Fewer connected sources → wider confidence band.
export function getConfidenceBand(dataCompleteness = {}) {
  const count = Object.values(dataCompleteness).filter(Boolean).length;
  if (count >= 4) return 5;
  if (count === 3) return 10;
  return 15;
}

export default function ConfidenceMeter({ dataCompleteness = {} }) {
  const connected = SOURCES.filter((s) => dataCompleteness?.[s.key]).map((s) =>
    s.name.toLowerCase()
  );

  return (
    <div className="mt-4">
      {/* Based on: ... */}
      <p className="text-xs text-slate-500 mb-3">
        Based on: {connected.length ? connected.join(", ") : "no sources yet"}
      </p>

      {/* DataCompletenessBar — one row per source */}
      <div className="space-y-1.5">
        {SOURCES.map((s) => {
          const isConnected = !!dataCompleteness?.[s.key];
          return (
            <div key={s.key} className="flex items-center gap-2">
              <span className="w-16 text-xs text-slate-500">{s.name}</span>
              <div className="flex-1 h-2 rounded-full bg-[#f5f1ea] overflow-hidden">
                {isConnected ? (
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${s.weight}%` }}
                  />
                ) : (
                  <div
                    className="h-full w-full border border-dashed border-slate-300 rounded-full"
                    title={`Add to unlock +${s.weight}% accuracy`}
                  />
                )}
              </div>
              <span className="text-[10px] text-slate-400 w-8 text-right">{s.weight}%</span>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-400 mt-3 flex items-start gap-1">
        <Info className="w-3 h-3 mt-0.5 shrink-0" />
        Score reflects available evidence. Add interview data to narrow the
        confidence range.
      </p>
    </div>
  );
}
