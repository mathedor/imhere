"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AdvancedFilters, type AdvancedFilterValues } from "@/components/app/AdvancedFilters";
import { EstablishmentCard } from "@/components/EstablishmentCard";
import { NearbyButton, SortMenu, type SortKey } from "@/components/SortMenu";
import { logSearchAction } from "@/lib/actions/search-log";
import type { Establishment } from "@/data/establishments";

interface Props {
  establishments: Establishment[];
  totalOnline: number;
  isPremium?: boolean;
  credits?: number;
}

export function HomeClient({ establishments, totalOnline, isPremium = false, credits = 0 }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sort, setSort] = useState<SortKey>("nearest");
  const nearbyOnly = searchParams.get("nearby") === "1";
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<AdvancedFilterValues>({
    gender: "all",
    minAge: 18,
    maxAge: 65,
    onlyOpen: false,
  });
  const [locationLabel, setLocationLabel] = useState("Compartilhe sua localização");
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setLocationLabel("Geolocalização indisponível");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationStatus("ok");
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const wasMissing = !searchParams.get("lat");
        setCoords({ lat, lng });
        // Sincroniza coordenadas no URL pra server-side ranking real
        if (wasMissing) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("lat", lat.toFixed(6));
          params.set("lng", lng.toFixed(6));
          startTransition(() => router.replace(`?${params.toString()}`, { scroll: false }));
        }
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const d = await r.json();
          const city = d.address?.suburb ?? d.address?.city ?? d.address?.town ?? "Sua região";
          const state = d.address?.state ?? "";
          setLocationLabel(`${city}${state ? " · " + state : ""}`);
        } catch {
          setLocationLabel("Sua localização");
        }
      },
      () => {
        setLocationStatus("denied");
        setLocationLabel("Toque para liberar localização");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleNearby() {
    const params = new URLSearchParams(searchParams.toString());
    if (nearbyOnly) {
      params.delete("nearby");
    } else {
      params.set("nearby", "1");
      if (coords) {
        params.set("lat", coords.lat.toFixed(6));
        params.set("lng", coords.lng.toFixed(6));
      }
    }
    startTransition(() => router.push(`?${params.toString()}`, { scroll: false }));

    if (!nearbyOnly && !coords && navigator.geolocation) {
      // Pede geo se ainda não tem
      navigator.geolocation.getCurrentPosition((pos) => {
        const p = new URLSearchParams(searchParams.toString());
        p.set("nearby", "1");
        p.set("lat", pos.coords.latitude.toFixed(6));
        p.set("lng", pos.coords.longitude.toFixed(6));
        router.push(`?${p.toString()}`, { scroll: false });
      });
    }
  }

  const list = useMemo(() => {
    let arr = establishments;
    if (query) {
      const q = query.toLowerCase();
      arr = arr.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    // Server já filtra por raio quando nearby=1, mas mantemos cliente como safety net
    if (nearbyOnly) arr = arr.filter((e) => e.distanceKm <= 5);
    const sorted = [...arr];
    if (sort === "nearest") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === "busiest") sorted.sort((a, b) => b.presentNow - a.presentNow);
    if (sort === "rated") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [establishments, sort, nearbyOnly, query]);

  // Log de buscas com debounce (300ms após parar de digitar, query >= 2 chars)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const t = setTimeout(() => {
      logSearchAction({
        query: q,
        filters: { sort, nearbyOnly, ...filters },
        resultCount: list.length,
        lat: coords?.lat,
        lng: coords?.lng,
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [query, sort, nearbyOnly, filters, list.length, coords]);

  function open(id: string) {
    router.push(`/app/estabelecimento/${id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 md:px-8">
      <section className="flex flex-col gap-4">
        <div className="flex w-full items-center gap-2 rounded-pill bg-surface-2/60 px-4 py-2">
          <div className="grid size-7 place-items-center rounded-full bg-brand/15 text-brand">
            {locationStatus === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : <MapPin className="size-3.5" />}
          </div>
          <span className="text-xs uppercase tracking-wider text-muted">Você está em</span>
          <span className="flex-1 truncate text-sm font-semibold text-text">{locationLabel}</span>
          {locationStatus === "ok" && <span className="size-2 rounded-full bg-success live-dot" />}
        </div>

        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <h1 className="text-[1.75rem] font-black leading-tight tracking-tight text-text text-balance md:text-4xl">
              Quem está <span className="text-brand">aqui</span> agora?
            </h1>
            <p className="mt-1 text-sm text-text-soft md:text-base">
              Encontre lugares com gente movimentando perto de você.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-pill bg-surface/60 px-4 py-2 text-xs text-text-soft border border-border">
            <span className="size-1.5 rounded-full bg-success live-dot" />
            {totalOnline.toLocaleString("pt-BR")} pessoas online agora
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 rounded-pill border border-border bg-surface px-4 h-14">
            <Search className="size-5 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar bar, restaurante, balada..."
              className="flex-1 bg-transparent text-base text-text placeholder:text-muted outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="rounded-full p-1 text-muted hover:bg-surface-2 hover:text-text">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <NearbyButton active={nearbyOnly} onClick={toggleNearby} />
        <AdvancedFilters isPremium={isPremium} balance={credits} value={filters} onChange={setFilters} />
        <SortMenu value={sort} onChange={setSort} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            {list.length} lugares
          </h2>
          <div className="flex items-center gap-1.5 text-[0.7rem] text-text-soft">
            <span className="size-1.5 rounded-full bg-success live-dot" />
            Ao vivo
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e, i) => (
              <EstablishmentCard key={e.id} establishment={e} index={i} onClick={open} />
            ))}
            {list.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center"
              >
                <Users className="mx-auto size-8 text-muted" />
                <p className="mt-3 text-sm font-bold text-text">Nenhum lugar encontrado</p>
                <p className="text-xs text-text-soft">Ajuste o filtro ou amplie a busca.</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
