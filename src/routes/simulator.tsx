import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Sliders } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ImpactBars } from "@/components/CivicCharts";
import { SCHEMES, predictSchemeImpact, generateSnapshot, type SchemeId } from "@/lib/civic-data";
import { useI18n } from "@/lib/i18n";
import { aiSchemeNarrative } from "@/lib/civic.functions";

export const Route = createFileRoute("/simulator")({
  head: () => ({ meta: [{ title: "CivicDNA — Scheme Simulator" }, { name: "description", content: "Simulate impact of government schemes." }] }),
  component: SimPage,
});

function SimPage() {
  const { t, lang } = useI18n();
  const [scheme, setScheme] = useState<SchemeId>("smart-cities");
  const [intensity, setIntensity] = useState(60);
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);
  const ai = useServerFn(aiSchemeNarrative);

  const predicted = predictSchemeImpact(scheme, intensity);
  const data = Object.entries(predicted).map(([metric, delta]) => ({ metric, delta }));
  const meta = SCHEMES.find((s) => s.id === scheme)!;
  const baseline = generateSnapshot();

  const run = async () => {
    setLoading(true);
    setNarrative("");
    try {
      const r = await ai({
        data: {
          scheme,
          schemeName: meta.name,
          intensity,
          baseline: {
            traffic: baseline.trafficIndex,
            pollution: baseline.pollutionAQI,
            risk: baseline.urbanRiskScore,
            healthcare: baseline.healthcareStress,
          },
          predicted,
          language: lang,
        },
      });
      setNarrative(r.text);
    } catch (e) {
      setNarrative(e instanceof Error ? e.message : "AI service unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <div className="glass p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="size-4 neon-cyan" />
            <h3 className="text-sm font-semibold tracking-wide">SCHEMES</h3>
          </div>
          {SCHEMES.map((s) => (
            <button
              key={s.id}
              onClick={() => setScheme(s.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition ${
                scheme === s.id ? "bg-primary/15 border-primary/30 text-foreground" : "border-transparent text-muted-foreground hover:bg-white/5"
              }`}
            >
              {lang === "mr" ? s.nameMr : s.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">Scheme Impact Simulator</div>
                <h2 className="text-xl font-semibold mt-1">{lang === "mr" ? meta.nameMr : meta.name}</h2>
              </div>
              <button
                onClick={run}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {t("scheme_run")}
              </button>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Deployment intensity</span>
                <span className="font-mono neon-cyan">{intensity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <ImpactBars data={data} />
          </div>

          {(narrative || loading) && (
            <div className="glass p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-4 neon-magenta" />
                <h3 className="text-sm font-semibold tracking-wide">EXECUTIVE BRIEFING</h3>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {loading ? "Synthesizing policy briefing…" : narrative}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}