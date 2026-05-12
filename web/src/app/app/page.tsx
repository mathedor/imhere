"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EstablishmentCard } from "@/components/EstablishmentCard";
import { LocationBar } from "@/components/LocationBar";
import { SearchBar } from "@/components/SearchBar";
import { NearbyButton, SortMenu, type SortKey } from "@/components/SortMenu";
import { establishments } from "@/data/establishments";

export default function HomePage() {
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>("nearest");
  const [nearbyOnly, setNearbyOnly] = useState(false);

  const list = useMemo(() => {
    const base = nearbyOnly ? establishments.filter((e) => e.distanceKm <= 2) : establishments;
    const sorted = [...base];
    if (sort === "nearest") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === "busiest") sorted.sort((a, b) => b.presentNow - a.presentNow);
    if (sort === "rated") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [sort, nearbyOnly]);

  function open(id: string) {
    router.push(`/app/estabelecimento/${id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 md:px-8">
      <section className="flex flex-col gap-4">
        <LocationBar />
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
            {establishments.reduce((acc, e) => acc + e.presentNow, 0).toLocaleString("pt-BR")} pessoas
            online agora
          </div>
        </div>
        <SearchBar onSelect={open} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-2">
        <NearbyButton active={nearbyOnly} onClick={() => setNearbyOnly((v) => !v)} />
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
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {list.map((e, i) => (
              <EstablishmentCard key={e.id} establishment={e} index={i} onClick={open} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
