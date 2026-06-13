import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Polygon, Popup, TileLayer, Tooltip as LTooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FACILITIES, WARDS, type Incident, type WardSnapshot } from "@/lib/civic-data";

// Fix default icon paths (we use CircleMarker so icons not strictly needed,
// but some plugins reference them).
// @ts-expect-error - leaflet default icon hack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FAC_COLOR = { hospital: "#6ee7b7", police: "#6ee7ff", fire: "#fda4af" } as const;

function riskColor(v: number) {
  if (v > 75) return "#fb7185";
  if (v > 55) return "#fcd34d";
  if (v > 35) return "#6ee7ff";
  return "#6ee7b7";
}

function wardPolygon(center: [number, number], r = 0.018) {
  // hex-ish polygon around ward center
  const [lat, lng] = center;
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    pts.push([lat + Math.sin(a) * r, lng + Math.cos(a) * r * 1.1]);
  }
  return pts;
}

export default function CivicMapClient({
  ward,
  incidents,
}: {
  ward: WardSnapshot[];
  incidents: Incident[];
}) {
  const wardById = useMemo(() => Object.fromEntries(ward.map((w) => [w.wardId, w])), [ward]);
  // make sure leaflet recomputes size
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <MapContainer
      center={[18.52, 73.87]}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: 14 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {WARDS.map((w) => {
        const ws = wardById[w.id];
        const c = riskColor(ws?.risk ?? 30);
        return (
          <Polygon
            key={w.id}
            positions={wardPolygon(w.center)}
            pathOptions={{ color: c, weight: 1.5, fillColor: c, fillOpacity: 0.18 }}
          >
            <LTooltip direction="top" sticky>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11 }}>
                <strong>{w.name}</strong>
                <br />
                Risk {ws?.risk ?? "—"} · Traffic {ws?.traffic ?? "—"} · AQI {ws?.pollution ?? "—"}
              </div>
            </LTooltip>
          </Polygon>
        );
      })}

      {FACILITIES.map((f) => (
        <CircleMarker
          key={f.id}
          center={f.pos}
          radius={6}
          pathOptions={{ color: FAC_COLOR[f.type], fillColor: FAC_COLOR[f.type], fillOpacity: 0.9, weight: 2 }}
        >
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong>{f.name}</strong>
              <br />
              <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>{f.type}</span>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {incidents.map((i) => (
        <CircleMarker
          key={i.id}
          center={i.pos}
          radius={i.severity === "high" ? 11 : i.severity === "med" ? 8 : 6}
          pathOptions={{
            color: i.severity === "high" ? "#fb7185" : i.severity === "med" ? "#fcd34d" : "#6ee7ff",
            fillColor: i.severity === "high" ? "#fb7185" : i.severity === "med" ? "#fcd34d" : "#6ee7ff",
            fillOpacity: 0.5,
            weight: 2,
            className: "leaflet-incident-pulse",
          }}
        >
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong>{i.message}</strong>
              <br />
              <span style={{ fontFamily: "ui-monospace,monospace" }}>
                {i.id} · {i.ward} · {new Date(i.ts).toLocaleTimeString("en-IN")}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}