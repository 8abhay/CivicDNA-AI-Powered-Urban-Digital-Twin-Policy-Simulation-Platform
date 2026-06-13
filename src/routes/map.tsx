import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CivicMap } from "@/components/CivicMap";
import { AlertsFeed } from "@/components/AlertsFeed";
import { generateIncidents, generateWardSnapshots, WARDS } from "@/lib/civic-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "CivicDNA — City Map" }, { name: "description", content: "Live ward-level civic risk map." }] }),
  component: MapPage,
});

function MapPage() {
  const { t, lang } = useI18n();
  const [wards, setWards] = useState(() => generateWardSnapshots());
  const [incidents, setIncidents] = useState(() => generateIncidents());
  useEffect(() => {
    const id = setInterval(() => {
      setWards(generateWardSnapshots());
      setIncidents(generateIncidents());
    }, 6000);
    return () => clearInterval(id);
  }, []);
  return (
    <AppShell>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 h-[calc(100vh-180px)]">
        <div className="glass overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide">{t("nav_map")} · ward-level risk mesh</h2>
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span><span className="inline-block size-2 rounded-full bg-emerald-300 mr-1" />Hospital</span>
              <span><span className="inline-block size-2 rounded-full bg-cyan-300 mr-1" />Police</span>
              <span><span className="inline-block size-2 rounded-full bg-rose-300 mr-1" />Fire</span>
            </div>
          </div>
          <div className="h-[calc(100%-49px)]">
            <CivicMap ward={wards} incidents={incidents} />
          </div>
        </div>
        <div className="space-y-4 min-h-0 flex flex-col">
          <div className="glass p-4">
            <h3 className="text-sm font-semibold tracking-wide mb-3">TOP-RISK WARDS</h3>
            <div className="space-y-2">
              {[...wards].sort((a, b) => b.risk - a.risk).slice(0, 4).map((w) => {
                const meta = WARDS.find((x) => x.id === w.wardId);
                return (
                  <div key={w.wardId} className="flex items-center justify-between text-xs">
                    <span>{lang === "mr" ? meta?.nameMr : meta?.name}</span>
                    <span className="font-mono neon-cyan">{w.risk}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <AlertsFeed incidents={incidents} />
        </div>
      </div>
    </AppShell>
  );
}