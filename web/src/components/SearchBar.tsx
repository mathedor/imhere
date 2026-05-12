"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
import { establishments, typeLabel } from "@/data/establishments";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSelect?: (id: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = query.trim().length === 0
    ? []
    : establishments
        .filter((e) => {
          const q = query.toLowerCase();
          return (
            e.name.toLowerCase().includes(q) ||
            e.city.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q))
          );
        })
        .slice(0, 6);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative z-30">
      <motion.div
        layout
        className={cn(
          "flex items-center gap-3 rounded-pill border border-border bg-surface px-4 h-14 transition-all",
          focused && "border-brand/60 shadow-[0_0_0_4px_rgba(239,44,57,0.12)]"
        )}
      >
        <Search className="size-5 shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Buscar bar, restaurante, balada..."
          className="flex-1 bg-transparent text-base text-text placeholder:text-muted outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="rounded-full p-1 text-muted hover:bg-surface-2 hover:text-text transition-colors"
            aria-label="Limpar"
          >
            <X className="size-4" />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {focused && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0.2, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl glass-strong shadow-soft"
          >
            <ul className="max-h-[60vh] overflow-y-auto scrollbar-hide">
              {matches.map((m, idx) => (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <button
                    onClick={() => {
                      onSelect?.(m.id);
                      setQuery(m.name);
                      setFocused(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-brand/15 text-brand">
                      <MapPin className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{m.name}</p>
                      <p className="truncate text-xs text-text-soft">
                        {typeLabel[m.type]} · {m.city}/{m.state}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {m.distanceKm.toFixed(1)} km
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
