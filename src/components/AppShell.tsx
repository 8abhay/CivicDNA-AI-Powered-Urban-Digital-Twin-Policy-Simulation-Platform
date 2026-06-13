import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Map, Sliders, Boxes, Bot, FileText, Languages, Dna } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useEffect, useState, type ReactNode } from "react";

const NAV = [
  { to: "/", icon: Activity, key: "nav_dashboard" as const },
  { to: "/map", icon: Map, key: "nav_map" as const },
  { to: "/simulator", icon: Sliders, key: "nav_simulator" as const },
  { to: "/twin", icon: Boxes, key: "nav_twin" as const },
  { to: "/chat", icon: Bot, key: "nav_chat" as const },
  { to: "/reports", icon: FileText, key: "nav_reports" as const },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col gap-2 p-4 border-r border-border/60 bg-sidebar/60 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="relative">
            <Dna className="size-7 neon-cyan" strokeWidth={1.5} />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight">{t("app_name")}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Gov OS · v1</div>
          </div>
        </Link>
        <nav className="mt-4 flex flex-col gap-1">
          {NAV.map(({ to, icon: Icon, key }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                  active
                    ? "bg-primary/15 text-foreground border border-primary/30 shadow-[0_0_30px_-12px_var(--cyan)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent",
                ].join(" ")}
              >
                <Icon className={["size-4", active ? "neon-cyan" : ""].join(" ")} />
                <span className="font-medium">{t(key)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto glass-soft p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 pulse-dot" />
            <span>{t("status_live")} · synthetic civic mesh</span>
          </div>
          <div className="mt-2 font-mono text-[10px] opacity-70">
            CivicDNA · v1.0 · Built for IAS/IPS/Smart Cities
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-border/60 backdrop-blur-xl bg-background/40 sticky top-0 z-40">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">CivicDNA</div>
            <h1 className="text-base md:text-lg font-semibold">{t("app_tag")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 glass-soft px-3 py-1.5 text-xs">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono" suppressHydrationWarning>{now || "--:--:--"}</span>
            </div>
            <div className="glass-soft inline-flex p-0.5 text-xs">
              {(["en", "mr"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={[
                    "px-2.5 py-1 rounded-md font-medium transition",
                    lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  aria-label={`Language ${l}`}
                >
                  <Languages className="size-3 inline mr-1 -mt-0.5" />
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex overflow-x-auto gap-1 px-3 py-2 border-b border-border/60 bg-background/60">
          {NAV.map(({ to, icon: Icon, key }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs",
                  active ? "bg-primary/20 text-foreground" : "text-muted-foreground bg-white/5",
                ].join(" ")}
              >
                <Icon className="size-3.5" />
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-5 md:px-8 py-6 md:py-8 grid-bg">{children}</main>
      </div>
    </div>
  );
}