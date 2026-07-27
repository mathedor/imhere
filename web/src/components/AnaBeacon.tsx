"use client";

import { useEffect } from "react";

/** Prefixos de áreas internas (painéis) — o beacon da Ana NÃO dispara nelas. */
const INTERNAL_PREFIXES = ["/app", "/admin", "/estabelecimento", "/comercial", "/api", "/auth"];

/**
 * Beacon de acessos da Ana (https://www.ana.show) — dispara 1x no load,
 * apenas nas páginas públicas. A Ana computa `acessos_hoje` a partir dele.
 */
export function AnaBeacon() {
  useEffect(() => {
    const path = window.location.pathname;
    if (INTERNAL_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return;
    try {
      navigator.sendBeacon("https://www.ana.show/api/b/imhere");
    } catch {
      /* noop */
    }
  }, []);
  return null;
}
