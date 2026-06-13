import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Download, FileSpreadsheet, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { AppShell } from "@/components/AppShell";
import {
  generateSnapshot,
  generateTrend,
  generateWardSnapshots,
  generateIncidents,
  WARDS,
} from "@/lib/civic-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "CivicDNA — Reports" },
      { name: "description", content: "Export civic intelligence as PDF and CSV briefings." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { t, lang } = useI18n();
  const [snap] = useState(() => generateSnapshot());
  const [wards] = useState(() => generateWardSnapshots());
  const [trend] = useState(() => generateTrend());
  const [incidents] = useState(() => generateIncidents(12));

  const wardRows = useMemo(
    () =>
      wards.map((w) => {
        const meta = WARDS.find((x) => x.id === w.wardId);
        return {
          Ward: lang === "mr" ? meta?.nameMr ?? w.wardId : meta?.name ?? w.wardId,
          Traffic: w.traffic,
          Pollution: w.pollution,
          Emergency: w.emergency,
          Healthcare: w.healthcare,
          Crime: w.crime,
          Risk: w.risk,
        };
      }),
    [wards, lang],
  );

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("CivicDNA — City Briefing", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date().toLocaleString("en-IN")}`, 14, 25);

    doc.setTextColor(20);
    doc.setFontSize(12);
    doc.text("Headline Indicators", 14, 36);
    autoTable(doc, {
      startY: 40,
      head: [["Indicator", "Value"]],
      body: [
        ["Urban Risk Score", `${snap.urbanRiskScore} / 100`],
        ["City Stability", `${snap.cityStability} / 100`],
        ["Traffic Index", `${snap.trafficIndex} / 100`],
        ["Pollution AQI", String(snap.pollutionAQI)],
        ["Emergency Load", `${snap.emergencyLoad} / hr`],
        ["Healthcare Stress", `${snap.healthcareStress} / 100`],
        ["Crime Heat", `${snap.crimeHeatIndex} / 100`],
        ["Alert Level", snap.alertLevel.toUpperCase()],
      ],
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.text("Ward Stress Signatures", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [["Ward", "Traffic", "Pollution", "Emergency", "Healthcare", "Crime", "Risk"]],
      body: wardRows.map((r) => [r.Ward, r.Traffic, r.Pollution, r.Emergency, r.Healthcare, r.Crime, r.Risk]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.text("Live Incidents", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [["Time", "Type", "Severity", "Ward", "Message"]],
      body: incidents.map((i) => [
        new Date(i.ts).toLocaleTimeString("en-IN", { hour12: false }),
        i.type,
        i.severity,
        i.ward,
        lang === "mr" ? i.messageMr : i.message,
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9 },
    });

    doc.save(`civicdna-briefing-${Date.now()}.pdf`);
  };

  const exportCsv = (kind: "wards" | "trend" | "incidents") => {
    let rows: Record<string, unknown>[] = [];
    if (kind === "wards") rows = wardRows;
    if (kind === "trend")
      rows = trend.map((d) => ({
        Time: new Date(d.ts).toISOString(),
        Risk: d.urbanRiskScore,
        Traffic: d.trafficIndex,
        Pollution: d.pollutionAQI,
        Emergency: d.emergencyLoad,
        Stability: d.cityStability,
      }));
    if (kind === "incidents")
      rows = incidents.map((i) => ({
        Time: new Date(i.ts).toISOString(),
        Type: i.type,
        Severity: i.severity,
        Ward: i.ward,
        Message: lang === "mr" ? i.messageMr : i.message,
      }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civicdna-${kind}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="glass p-5 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-300">CivicDNA · Reports</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold leading-tight">
                Briefings & Civic Data Exports
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate PDF executive briefings or download raw CSV datasets for offline analysis.
              </p>
            </div>
            <button
              onClick={exportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              <FileDown className="size-4" />
              {t("export_pdf")} · Full Briefing
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {([
            { id: "wards", title: "Ward Signatures", desc: "All 8 wards · stress dimensions", count: wardRows.length },
            { id: "trend", title: "City Trend", desc: "Last 2 hours · 5-minute cadence", count: trend.length },
            { id: "incidents", title: "Live Incidents", desc: "Active civic incidents feed", count: incidents.length },
          ] as const).map((card) => (
            <div key={card.id} className="glass p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="size-4 neon-cyan" />
                <h3 className="text-sm font-semibold tracking-wide">{card.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{card.desc}</p>
              <div className="text-3xl font-semibold tabular-nums neon-cyan">{card.count}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">rows</div>
              <button
                onClick={() => exportCsv(card.id)}
                className="mt-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border text-sm hover:bg-white/10"
              >
                <Download className="size-3.5" />
                {t("export_csv")}
              </button>
            </div>
          ))}
        </div>

        <div className="glass p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="size-4 neon-magenta" />
            <h3 className="text-sm font-semibold tracking-wide">WARD SIGNATURE PREVIEW</h3>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  {["Ward", "Traffic", "Pollution", "Emergency", "Healthcare", "Crime", "Risk"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 border-b border-border/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wardRows.map((r) => (
                  <tr key={r.Ward} className="border-b border-border/30">
                    <td className="py-2 px-3 font-medium">{r.Ward}</td>
                    <td className="py-2 px-3 font-mono">{r.Traffic}</td>
                    <td className="py-2 px-3 font-mono">{r.Pollution}</td>
                    <td className="py-2 px-3 font-mono">{r.Emergency}</td>
                    <td className="py-2 px-3 font-mono">{r.Healthcare}</td>
                    <td className="py-2 px-3 font-mono">{r.Crime}</td>
                    <td className="py-2 px-3 font-mono neon-cyan">{r.Risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}