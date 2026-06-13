import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Flame, HeartPulse, Shield, Droplets, Zap, Car } from "lucide-react";
import type { Incident } from "@/lib/civic-data";
import { useI18n } from "@/lib/i18n";

const ICON = {
  traffic: Car,
  fire: Flame,
  medical: HeartPulse,
  crime: Shield,
  flood: Droplets,
  outage: Zap,
} as const;

const TONE = {
  high: "text-rose-300 border-rose-400/40 bg-rose-500/10",
  med: "text-amber-200 border-amber-300/30 bg-amber-400/10",
  low: "text-cyan-200 border-cyan-400/30 bg-cyan-400/10",
} as const;

export function AlertsFeed({ incidents }: { incidents: Incident[] }) {
  const { lang } = useI18n();
  return (
    <div className="glass p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 neon-magenta" />
          <h3 className="text-sm font-semibold tracking-wide">LIVE ALERTS</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{incidents.length} events</span>
      </div>
      <div className="space-y-2 overflow-auto pr-1 max-h-[420px]">
        <AnimatePresence initial={false}>
          {incidents.map((i) => {
            const Icon = ICON[i.type];
            return (
              <motion.div
                key={i.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-3 p-3 rounded-lg border ${TONE[i.severity]}`}
              >
                <div className="mt-0.5">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium leading-snug">{lang === "mr" ? i.messageMr : i.message}</div>
                  <div className="mt-1 text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                    <span>{i.id}</span>
                    <span>·</span>
                    <span>{i.ward}</span>
                    <span>·</span>
                    <span>{new Date(i.ts).toLocaleTimeString("en-IN", { hour12: false })}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}