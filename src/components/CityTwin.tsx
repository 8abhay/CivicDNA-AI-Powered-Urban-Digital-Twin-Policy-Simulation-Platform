import { lazy, Suspense, useEffect, useState } from "react";
import type { StressMode } from "./CityTwin.client";

const Inner = lazy(() => import("./CityTwin.client"));

export type { StressMode };

export function CityTwin({ stress, mode }: { stress: number; mode: StressMode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok) return <div className="size-full grid place-items-center text-xs text-muted-foreground">Booting digital twin…</div>;
  return (
    <Suspense fallback={<div className="size-full grid place-items-center text-xs text-muted-foreground">Loading 3D engine…</div>}>
      <Inner stress={stress} mode={mode} />
    </Suspense>
  );
}