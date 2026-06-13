import { lazy, Suspense, useEffect, useState } from "react";
import type { Incident, WardSnapshot } from "@/lib/civic-data";

// Leaflet touches `window`, so render only on the client.
const Inner = lazy(() => import("./CivicMap.client"));

export function CivicMap(props: { ward: WardSnapshot[]; incidents: Incident[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="size-full grid place-items-center text-xs text-muted-foreground">
        Initializing city mesh…
      </div>
    );
  }
  return (
    <Suspense fallback={<div className="size-full grid place-items-center text-xs text-muted-foreground">Loading map…</div>}>
      <Inner {...props} />
    </Suspense>
  );
}