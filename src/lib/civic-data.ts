// Synthetic civic data engine for CivicDNA. Pure TS, deterministic-ish but jittery
// so the dashboard "lives". Used by every page; no DB roundtrip needed for v1.

export type Ward = {
  id: string;
  name: string;
  nameMr: string;
  center: [number, number]; // lat, lng
  population: number;
};

// Stylized Indian smart city wards (Pune-ish geography for plausible coords)
export const WARDS: Ward[] = [
  { id: "W01", name: "Shivaji Nagar", nameMr: "शिवाजी नगर", center: [18.5314, 73.8446], population: 182000 },
  { id: "W02", name: "Kothrud", nameMr: "कोथरूड", center: [18.5074, 73.8077], population: 245000 },
  { id: "W03", name: "Hadapsar", nameMr: "हडपसर", center: [18.5089, 73.926], population: 312000 },
  { id: "W04", name: "Aundh", nameMr: "औंध", center: [18.5593, 73.8077], population: 158000 },
  { id: "W05", name: "Kondhwa", nameMr: "कोंढवा", center: [18.467, 73.897], population: 221000 },
  { id: "W06", name: "Yerwada", nameMr: "येरवडा", center: [18.5562, 73.8847], population: 196000 },
  { id: "W07", name: "Kharadi", nameMr: "खराडी", center: [18.5515, 73.9426], population: 174000 },
  { id: "W08", name: "Dhankawadi", nameMr: "धनकवडी", center: [18.4548, 73.8567], population: 188000 },
];

export type Facility = {
  id: string;
  type: "hospital" | "police" | "fire";
  name: string;
  pos: [number, number];
};

export const FACILITIES: Facility[] = [
  { id: "H1", type: "hospital", name: "Sassoon General Hospital", pos: [18.5293, 73.8606] },
  { id: "H2", type: "hospital", name: "Ruby Hall Clinic", pos: [18.5331, 73.8807] },
  { id: "H3", type: "hospital", name: "KEM Hospital", pos: [18.5076, 73.857] },
  { id: "H4", type: "hospital", name: "Jehangir Hospital", pos: [18.5246, 73.8786] },
  { id: "P1", type: "police", name: "Shivaji Nagar PS", pos: [18.5304, 73.847] },
  { id: "P2", type: "police", name: "Kothrud PS", pos: [18.508, 73.81] },
  { id: "P3", type: "police", name: "Hadapsar PS", pos: [18.51, 73.928] },
  { id: "P4", type: "police", name: "Yerwada PS", pos: [18.557, 73.886] },
  { id: "F1", type: "fire", name: "Erandwane Fire Station", pos: [18.508, 73.83] },
  { id: "F2", type: "fire", name: "Bhosari Fire Station", pos: [18.564, 73.857] },
];

export type CivicSnapshot = {
  ts: number;
  trafficIndex: number; // 0-100 (higher = worse)
  pollutionAQI: number; // 0-500
  emergencyLoad: number; // calls/hr
  urbanRiskScore: number; // 0-100
  healthcareStress: number; // 0-100
  crimeHeatIndex: number; // 0-100
  cityStability: number; // 0-100 (higher = better)
  alertLevel: "low" | "moderate" | "high" | "critical";
};

export type WardSnapshot = {
  wardId: string;
  traffic: number;
  pollution: number;
  emergency: number;
  risk: number;
  healthcare: number;
  crime: number;
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function pseudo(seed: number) {
  // simple deterministic noise
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

export function generateSnapshot(now = Date.now(), stress = 0): CivicSnapshot {
  const minute = Math.floor(now / 60000);
  const hour = (now / 3600000) % 24;
  // rush hour traffic curve
  const rush = Math.exp(-Math.pow(hour - 9, 2) / 6) + Math.exp(-Math.pow(hour - 19, 2) / 6);
  const j = (k: number) => pseudo(minute * 0.13 + k) * 8 - 4;

  const trafficIndex = clamp(38 + rush * 28 + j(1) + stress * 0.4);
  const pollutionAQI = clamp(80 + rush * 60 + j(2) * 4 + stress * 1.2, 20, 480);
  const emergencyLoad = clamp(22 + rush * 14 + j(3) + stress * 0.35, 0, 200);
  const healthcareStress = clamp(48 + j(4) + stress * 0.5);
  const crimeHeatIndex = clamp(34 + Math.sin(hour / 24 * Math.PI * 2) * 12 + j(5));
  const urbanRiskScore = clamp(
    trafficIndex * 0.25 + (pollutionAQI / 5) * 0.25 + emergencyLoad * 0.2 + healthcareStress * 0.15 + crimeHeatIndex * 0.15,
  );
  const cityStability = clamp(100 - urbanRiskScore + j(6));
  const alertLevel: CivicSnapshot["alertLevel"] =
    urbanRiskScore > 78 ? "critical" : urbanRiskScore > 60 ? "high" : urbanRiskScore > 40 ? "moderate" : "low";

  return {
    ts: now,
    trafficIndex: +trafficIndex.toFixed(1),
    pollutionAQI: Math.round(pollutionAQI),
    emergencyLoad: Math.round(emergencyLoad),
    urbanRiskScore: Math.round(urbanRiskScore),
    healthcareStress: Math.round(healthcareStress),
    crimeHeatIndex: Math.round(crimeHeatIndex),
    cityStability: Math.round(cityStability),
    alertLevel,
  };
}

export function generateTrend(points = 24, stress = 0): CivicSnapshot[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) =>
    generateSnapshot(now - (points - i) * 5 * 60_000, stress * (i / points)),
  );
}

export function generateWardSnapshots(stress = 0): WardSnapshot[] {
  const minute = Math.floor(Date.now() / 60000);
  return WARDS.map((w, idx) => {
    const j = (k: number) => pseudo(minute * 0.17 + idx * 7 + k) * 30;
    const traffic = clamp(40 + j(1) + stress * 0.4);
    const pollution = clamp(90 + j(2) * 2 + stress * 1.2, 20, 480);
    const emergency = clamp(20 + j(3) * 0.6 + stress * 0.3, 0, 100);
    const healthcare = clamp(45 + j(4) + stress * 0.4);
    const crime = clamp(30 + j(5) + stress * 0.3);
    const risk = clamp(traffic * 0.3 + (pollution / 5) * 0.25 + emergency * 0.2 + healthcare * 0.15 + crime * 0.1);
    return {
      wardId: w.id,
      traffic: Math.round(traffic),
      pollution: Math.round(pollution),
      emergency: Math.round(emergency),
      risk: Math.round(risk),
      healthcare: Math.round(healthcare),
      crime: Math.round(crime),
    };
  });
}

export type Incident = {
  id: string;
  ts: number;
  type: "traffic" | "fire" | "medical" | "crime" | "flood" | "outage";
  ward: string;
  pos: [number, number];
  severity: "low" | "med" | "high";
  message: string;
  messageMr: string;
};

const INCIDENT_TEMPLATES: Array<Omit<Incident, "id" | "ts" | "ward" | "pos">> = [
  { type: "traffic", severity: "high", message: "Traffic standstill on JM Road", messageMr: "जेएम रोडवर वाहतूक ठप्प" },
  { type: "fire", severity: "high", message: "Industrial fire reported", messageMr: "औद्योगिक आग नोंदवली" },
  { type: "medical", severity: "med", message: "Ambulance dispatched — cardiac event", messageMr: "रुग्णवाहिका रवाना — हृदयविकाराची घटना" },
  { type: "crime", severity: "med", message: "Theft reported near market", messageMr: "बाजाराजवळ चोरीची नोंद" },
  { type: "flood", severity: "high", message: "Waterlogging — drain overflow", messageMr: "पाणी साचले — नाला तुंबला" },
  { type: "outage", severity: "low", message: "Grid fluctuation in sector", messageMr: "क्षेत्रात वीज पुरवठा खंडित" },
  { type: "traffic", severity: "med", message: "Signal failure at junction", messageMr: "चौकातील सिग्नल बंद" },
];

export function generateIncidents(count = 8): Incident[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const t = INCIDENT_TEMPLATES[Math.floor(pseudo(now / 60000 + i) * INCIDENT_TEMPLATES.length)];
    const w = WARDS[Math.floor(pseudo(now / 60000 + i + 99) * WARDS.length)];
    const dx = (pseudo(now / 60000 + i + 1) - 0.5) * 0.03;
    const dy = (pseudo(now / 60000 + i + 2) - 0.5) * 0.03;
    return {
      id: `INC-${(now % 1_000_000) + i}`,
      ts: now - i * 90_000,
      ward: w.id,
      pos: [w.center[0] + dx, w.center[1] + dy],
      ...t,
    };
  });
}

export const SCHEMES = [
  { id: "smart-cities", name: "Smart Cities Mission", nameMr: "स्मार्ट सिटीज मिशन", icon: "Building2" },
  { id: "jal-jeevan", name: "Jal Jeevan Mission", nameMr: "जल जीवन मिशन", icon: "Droplets" },
  { id: "pmay", name: "PMAY (Housing for All)", nameMr: "पीएमएवाय", icon: "Home" },
  { id: "ayushman", name: "Ayushman Bharat", nameMr: "आयुष्मान भारत", icon: "HeartPulse" },
  { id: "swachh", name: "Swachh Bharat", nameMr: "स्वच्छ भारत", icon: "Recycle" },
  { id: "ebus", name: "PM eBus Sewa", nameMr: "पीएम ई-बस सेवा", icon: "Bus" },
  { id: "gati-shakti", name: "PM Gati Shakti", nameMr: "पीएम गतिशक्ती", icon: "Zap" },
] as const;

export type SchemeId = (typeof SCHEMES)[number]["id"];

// Heuristic predictor — used as a fast baseline; AI returns richer narrative.
export function predictSchemeImpact(scheme: SchemeId, intensity: number) {
  const k = intensity / 100;
  const tables: Record<SchemeId, Record<string, number>> = {
    "smart-cities": {
      "Traffic congestion": -18 * k,
      "Pollution AQI": -12 * k,
      "Emergency response time": -22 * k,
      "Citizen satisfaction": +14 * k,
    },
    "jal-jeevan": {
      "Water stress": -28 * k,
      "Disease outbreak risk": -16 * k,
      "Healthcare load": -9 * k,
      "Citizen satisfaction": +18 * k,
    },
    pmay: {
      "Housing deficit": -22 * k,
      "Slum density": -15 * k,
      "Crime heat index": -7 * k,
      "Economic activity": +11 * k,
    },
    ayushman: {
      "Healthcare accessibility": +26 * k,
      "Out-of-pocket cost": -19 * k,
      "Disease outbreak risk": -12 * k,
      "Citizen satisfaction": +17 * k,
    },
    swachh: {
      "Sanitation index": +24 * k,
      "Disease outbreak risk": -15 * k,
      "Pollution AQI": -8 * k,
      "Citizen satisfaction": +12 * k,
    },
    ebus: {
      "Pollution AQI": -17 * k,
      "Traffic congestion": -11 * k,
      "Transport accessibility": +21 * k,
      "Energy efficiency": +14 * k,
    },
    "gati-shakti": {
      "Logistics efficiency": +23 * k,
      "Economic activity": +18 * k,
      "Traffic congestion": -9 * k,
      "Emergency response time": -8 * k,
    },
  };
  return tables[scheme];
}