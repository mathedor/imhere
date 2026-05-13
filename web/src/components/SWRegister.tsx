"use client";

import { useEffect } from "react";

/** Registra service worker silenciosamente. Falha silenciosa em browsers sem suporte. */
export function SWRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const reg = navigator.serviceWorker.register("/sw.js", { scope: "/" });
    reg.catch((err) => console.warn("[SW] register falhou:", err));
  }, []);
  return null;
}
