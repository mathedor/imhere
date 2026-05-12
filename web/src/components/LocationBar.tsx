"use client";

import { motion } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface LocationBarProps {
  onLocate?: (coords: { lat: number; lng: number } | null) => void;
}

export function LocationBar({ onLocate }: LocationBarProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [label, setLabel] = useState("Compartilhe sua localização");

  useEffect(() => {
    requestLocation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function requestLocation(silent = false) {
    if (!navigator.geolocation) {
      setStatus("denied");
      setLabel("Geolocalização indisponível");
      return;
    }
    setStatus("loading");
    if (!silent) setLabel("Buscando sua localização...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus("ok");
        setLabel("Vila Madalena · São Paulo");
        onLocate?.({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setStatus("denied");
        setLabel("Toque para liberar localização");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => requestLocation(false)}
      className="flex w-full items-center gap-2 rounded-pill bg-surface-2/60 px-4 py-2 text-left transition-colors hover:bg-surface-2"
    >
      <div className="grid size-7 place-items-center rounded-full bg-brand/15 text-brand">
        {status === "loading" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <MapPin className="size-3.5" />
        )}
      </div>
      <span className="text-xs uppercase tracking-wider text-muted">Você está em</span>
      <span className="flex-1 truncate text-sm font-semibold text-text">{label}</span>
      {status === "ok" && <span className="size-2 rounded-full bg-success live-dot" />}
    </motion.button>
  );
}
