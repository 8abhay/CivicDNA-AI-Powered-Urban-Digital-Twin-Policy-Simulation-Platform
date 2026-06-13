import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "mr";

type Dict = Record<string, { en: string; mr: string }>;

const DICT: Dict = {
  app_name: { en: "CivicDNA", mr: "सिविकDNA" },
  app_tag: { en: "AI Operating System for Future Governments", mr: "भविष्यातील सरकारांसाठी AI ऑपरेटिंग सिस्टम" },
  nav_dashboard: { en: "Dashboard", mr: "डॅशबोर्ड" },
  nav_map: { en: "City Map", mr: "नकाशा" },
  nav_simulator: { en: "Scheme Simulator", mr: "योजना सिम्युलेटर" },
  nav_twin: { en: "Digital Twin", mr: "डिजिटल ट्विन" },
  nav_chat: { en: "AI Officer", mr: "AI अधिकारी" },
  nav_reports: { en: "Reports", mr: "अहवाल" },
  status_live: { en: "LIVE", mr: "थेट" },
  alert_low: { en: "All clear", mr: "सर्व सुरक्षित" },
  alert_moderate: { en: "Watch", mr: "लक्ष ठेवा" },
  alert_high: { en: "Elevated", mr: "उच्च" },
  alert_critical: { en: "Critical", mr: "गंभीर" },
  kpi_traffic: { en: "Traffic Index", mr: "वाहतूक निर्देशांक" },
  kpi_pollution: { en: "Pollution AQI", mr: "प्रदूषण AQI" },
  kpi_emergency: { en: "Emergency Load", mr: "आपत्कालीन भार" },
  kpi_risk: { en: "Urban Risk Score", mr: "शहरी जोखीम" },
  kpi_health: { en: "Healthcare Stress", mr: "आरोग्य ताण" },
  kpi_crime: { en: "Crime Heat", mr: "गुन्हा उष्णता" },
  kpi_stability: { en: "City Stability", mr: "शहर स्थिरता" },
  trend_24: { en: "Last 2 hours · 5 min cadence", mr: "मागील 2 तास · 5 मिनिटे" },
  recommendations: { en: "AI Recommendations", mr: "AI शिफारसी" },
  generate: { en: "Generate", mr: "तयार करा" },
  export_pdf: { en: "Export PDF", mr: "PDF निर्यात" },
  export_csv: { en: "Export CSV", mr: "CSV निर्यात" },
  scheme_run: { en: "Run Simulation", mr: "सिम्युलेशन चालवा" },
  twin_stress: { en: "Stress mode", mr: "ताण मोड" },
  twin_normal: { en: "Normal", mr: "सामान्य" },
  twin_flood: { en: "Flood", mr: "पूर" },
  twin_traffic: { en: "Traffic surge", mr: "वाहतूक वाढ" },
  twin_outbreak: { en: "Outbreak", mr: "उद्रेक" },
  ask_placeholder: { en: "Ask the AI Governance Officer…", mr: "AI अधिकाऱ्याला विचारा…" },
  send: { en: "Send", mr: "पाठवा" },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof DICT) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => DICT[k]?.en ?? String(k),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("civicdna_lang") as Lang | null;
    if (saved === "en" || saved === "mr") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("civicdna_lang", l);
  };
  const t = (k: keyof typeof DICT) => DICT[k]?.[lang] ?? String(k);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);