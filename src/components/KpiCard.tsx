import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Tone = "cyan" | "magenta" | "amber" | "emerald" | "danger";

const TONES: Record<Tone, { glow: string; ring: string; text: string }> = {
  cyan: { glow: "from-cyan-400/30", ring: "ring-cyan-400/30", text: "text-cyan-300" },
  magenta: { glow: "from-fuchsia-400/30", ring: "ring-fuchsia-400/30", text: "text-fuchsia-300" },
  amber: { glow: "from-amber-300/30", ring: "ring-amber-300/30", text: "text-amber-200" },
  emerald: { glow: "from-emerald-400/30", ring: "ring-emerald-400/30", text: "text-emerald-300" },
  danger: { glow: "from-rose-500/30", ring: "ring-rose-400/30", text: "text-rose-300" },
};

export function KpiCard({
  label,
  value,
  unit,
  delta,
  icon: Icon,
  tone = "cyan",
  hint,
}: {
  label: string;
  value: number | string;
  unit?: string;
  delta?: number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}) {
  const tn = TONES[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass relative overflow-hidden p-5 ring-1 ${tn.ring}`}
    >
      <div className={`absolute -top-16 -right-16 size-44 rounded-full bg-gradient-radial blur-2xl bg-gradient-to-br ${tn.glow} to-transparent`} />
      <div className="flex items-start justify-between gap-3 relative">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-3xl md:text-4xl font-semibold tabular-nums ${tn.text}`}>{value}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
        </div>
        <div className={`size-10 rounded-xl flex items-center justify-center bg-white/5 border border-border ${tn.text}`}>
          <Icon className="size-5" />
        </div>
      </div>
      {typeof delta === "number" && (
        <div className="mt-3 text-xs font-mono">
          <span className={delta >= 0 ? "text-emerald-300" : "text-rose-300"}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>{" "}
          <span className="text-muted-foreground">vs last hr</span>
        </div>
      )}
    </motion.div>
  );
}