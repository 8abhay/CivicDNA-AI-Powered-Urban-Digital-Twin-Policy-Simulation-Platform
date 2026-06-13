import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Boxes, Waves, Car, Activity } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CityTwin, type StressMode } from "@/components/CityTwin";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/twin")({
  head: () => ({
    meta: [
      { title: "CivicDNA — Digital City Twin" },
      { name: "description", content: "3D digital twin of the city reacting to civic stress modes." },
    ],
  }),
  component: TwinPage,
});

function TwinPage() {
  const { t } = useI18n();
  const [stress, setStress] = useState(35);
  const [mode, setMode] = useState<StressMode>("normal");

  const modes: { id: StressMode; label: string; icon: typeof Boxes }[] = [
    { id: "normal", label: t("twin_normal"), icon: Activity },
    { id: "flood", label: t("twin_flood"), icon: Waves },
    { id: "traffic", label: t("twin_traffic"), icon: Car },
    { id: "outbreak", label: t("twin_outbreak"), icon: Boxes },
  ];

  return (
    <AppShell>
      <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-[calc(100vh-180px)]">
        <div className="glass overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide">DIGITAL CITY TWIN · {mode.toUpperCase()}</h2>
            <span className="text-[10px] font-mono text-muted-foreground">react-three-fiber · WebGL</span>
          </div>
          <div className="h-[calc(100%-49px)] bg-[#0a0f1c]">
            <CityTwin stress={stress} mode={mode} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="glass p-4">
            <h3 className="text-sm font-semibold tracking-wide mb-3">{t("twin_stress")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {modes.map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg text-xs border transition ${
                      active
                        ? "bg-primary/15 border-primary/30 text-foreground shadow-[0_0_30px_-12px_var(--cyan)]"
                        : "border-border text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`size-4 ${active ? "neon-cyan" : ""}`} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="glass p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Stress intensity</span>
              <span className="font-mono neon-cyan">{stress}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={stress}
              onChange={(e) => setStress(parseInt(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
              Adjust stress to watch the digital twin react: emissive heat, flood plane, and structural wobble shift in real time.
            </p>
          </div>
          <div className="glass p-4 text-[11px] text-muted-foreground leading-relaxed">
            <div className="font-mono uppercase tracking-wider text-foreground mb-1">Tip</div>
            Drag to orbit · scroll to zoom. The central spire is the city's data core; building emissives map to district stress.
          </div>
        </div>
      </div>
    </AppShell>
  );
}