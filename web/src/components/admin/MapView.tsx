"use client";

import dynamic from "next/dynamic";
import type { CityHeatPoint, MapMarker } from "@/lib/db/match-analysis";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-surface-2 text-xs text-text-soft">
      Carregando mapa…
    </div>
  ),
});

interface Props {
  markers: MapMarker[];
  heat: CityHeatPoint[];
}

export function MapView({ markers, heat }: Props) {
  return (
    <div className="h-[500px] overflow-hidden rounded-2xl border border-border">
      <MapInner markers={markers} heat={heat} />
    </div>
  );
}
