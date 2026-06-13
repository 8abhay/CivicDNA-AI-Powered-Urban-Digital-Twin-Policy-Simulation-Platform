import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CivicSnapshot, WardSnapshot } from "@/lib/civic-data";

const palette = ["#6ee7ff", "#f0abfc", "#fcd34d", "#6ee7b7", "#fda4af", "#a5b4fc", "#67e8f9", "#fdba74"];

const tooltipStyle = {
  background: "rgba(20,24,40,0.92)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  fontSize: 12,
  color: "#e2e8f0",
} as const;

export function TrendChart({ data }: { data: CivicSnapshot[] }) {
  const fmt = data.map((d) => ({
    t: new Date(d.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
    Risk: d.urbanRiskScore,
    Traffic: d.trafficIndex,
    Pollution: Math.round(d.pollutionAQI / 5),
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={fmt} margin={{ left: -10, right: 6, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gRisk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7ff" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#6ee7ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gTraffic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#f0abfc" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gPoll" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fcd34d" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#fcd34d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="t" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="Risk" stroke="#6ee7ff" strokeWidth={2} fill="url(#gRisk)" />
        <Area type="monotone" dataKey="Traffic" stroke="#f0abfc" strokeWidth={2} fill="url(#gTraffic)" />
        <Area type="monotone" dataKey="Pollution" stroke="#fcd34d" strokeWidth={2} fill="url(#gPoll)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WardBars({ data }: { data: Array<WardSnapshot & { name: string }> }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ left: -10, right: 6, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        <Line type="monotone" dataKey="risk" stroke="#6ee7ff" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="traffic" stroke="#f0abfc" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="healthcare" stroke="#fcd34d" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function IncidentPie({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={88} paddingAngle={3} stroke="rgba(0,0,0,0)">
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ImpactBars({ data }: { data: Array<{ metric: string; delta: number }> }) {
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const positive = d.delta >= 0;
        const w = Math.min(100, Math.abs(d.delta) * 3);
        return (
          <div key={d.metric}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{d.metric}</span>
              <span className={`font-mono ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                {positive ? "+" : ""}
                {d.delta.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden relative">
              <div
                className={`absolute top-0 bottom-0 ${positive ? "left-1/2 bg-gradient-to-r from-emerald-500/70 to-emerald-300" : "right-1/2 bg-gradient-to-l from-rose-500/70 to-rose-300"}`}
                style={{ width: `${w / 2}%` }}
              />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
            </div>
          </div>
        );
      })}
    </div>
  );
}