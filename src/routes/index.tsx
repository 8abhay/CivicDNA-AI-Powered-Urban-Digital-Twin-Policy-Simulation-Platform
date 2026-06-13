import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Wind, Siren, ShieldAlert, HeartPulse, Flame, Gauge, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { KpiCard } from "@/components/KpiCard";
import { TrendChart, WardBars, IncidentPie } from "@/components/CivicCharts";
import { AlertsFeed } from "@/components/AlertsFeed";
import {
  generateIncidents,
  generateSnapshot,
  generateTrend,
  generateWardSnapshots,
  WARDS,
} from "@/lib/civic-data";
import { useI18n } from "@/lib/i18n";
import { aiRecommendations } from "@/lib/civic.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicDNA — Command Dashboard" },
      { name: "description", content: "Live civic intelligence dashboard for smart-city operations." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useI18n();
  const [snap, setSnap] = useState(() => generateSnapshot());
  const [trend, setTrend] = useState(() => generateTrend());
  const [wards, setWards] = useState(() => generateWardSnapshots());
  const [incidents, setIncidents] = useState(() => generateIncidents());
  const [aiText, setAiText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const recommend = useServerFn(aiRecommendations);

  useEffect(() => {
    const id = setInterval(() => {
      setSnap(generateSnapshot());
      setTrend(generateTrend());
      setWards(generateWardSnapshots());
      setIncidents(generateIncidents());
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const wardData = useMemo(
    () =>
      wards.map((w) => ({
        ...w,
        name: (lang === "mr" ? WARDS.find((x) => x.id === w.wardId)?.nameMr : WARDS.find((x) => x.id === w.wardId)?.name) ?? w.wardId,
      })),
    [wards, lang],
  );

  const pie = useMemo(() => {
    const map = new Map<string, number>();
    incidents.forEach((i) => map.set(i.type, (map.get(i.type) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const generate = async () => {
    setAiLoading(true);
    setAiText("");
    try {
      const r = await recommend({ data: { ...snap, language: lang } });
      setAiText(r.text);
    } catch (e) {
      setAiText(e instanceof Error ? e.message : "AI service unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Hero strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass relative overflow-hidden p-5 md:p-7"
        >
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-300">CivicDNA · Command</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold leading-tight">
                Urban Risk{" "}
                <span className="neon-cyan tabular-nums">{snap.urbanRiskScore}</span>
                <span className="text-muted-foreground text-base"> / 100</span>{" "}
                · Stability{" "}
                <span className="neon-magenta tabular-nums">{snap.cityStability}</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("trend_24")} · alert level: <span className="font-mono">{t(`alert_${snap.alertLevel}` as const)}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={generate}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {t("recommendations")}
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label={t("kpi_traffic")} value={snap.trafficIndex.toFixed(1)} unit="/100" icon={Activity} tone="cyan" delta={2.3} />
          <KpiCard label={t("kpi_pollution")} value={snap.pollutionAQI} unit="AQI" icon={Wind} tone="amber" delta={-1.2} />
          <KpiCard label={t("kpi_emergency")} value={snap.emergencyLoad} unit="/hr" icon={Siren} tone="danger" delta={4.6} />
          <KpiCard label={t("kpi_risk")} value={snap.urbanRiskScore} unit="/100" icon={ShieldAlert} tone="magenta" delta={1.4} />
          <KpiCard label={t("kpi_health")} value={snap.healthcareStress} unit="/100" icon={HeartPulse} tone="emerald" delta={0.8} />
          <KpiCard label={t("kpi_crime")} value={snap.crimeHeatIndex} unit="/100" icon={Flame} tone="danger" delta={-0.4} />
          <KpiCard label={t("kpi_stability")} value={snap.cityStability} unit="/100" icon={Gauge} tone="emerald" delta={-1.1} />
          <KpiCard label="AI Confidence" value={92} unit="%" icon={Sparkles} tone="magenta" hint="ensemble · 4 models" />
        </div>

        {/* AI recs */}
        {(aiText || aiLoading) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 neon-magenta" />
              <h3 className="text-sm font-semibold tracking-wide">{t("recommendations")}</h3>
            </div>
            <div className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {aiLoading ? "Generating ensemble recommendations…" : aiText}
            </div>
          </motion.div>
        )}

        {/* Charts + alerts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="glass p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold tracking-wide">RISK · TRAFFIC · POLLUTION TREND</h3>
              <span className="text-[10px] font-mono text-muted-foreground">{t("trend_24")}</span>
            </div>
            <TrendChart data={trend} />
          </div>
          <AlertsFeed incidents={incidents} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="glass p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide mb-2">WARD-WISE STRESS SIGNATURES</h3>
            <WardBars data={wardData} />
          </div>
          <div className="glass p-4">
            <h3 className="text-sm font-semibold tracking-wide mb-2">INCIDENT MIX (LIVE)</h3>
            <IncidentPie data={pie} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
