"use client";

import { motion } from "framer-motion";
import { Camera, Flame, MapPin, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Establishment, momentoByEstablishment, typeLabel } from "@/data/establishments";
import { formatCount, formatDistance } from "@/lib/utils";

interface Props {
  establishment: Establishment;
  index: number;
  onClick?: (id: string) => void;
}

export function EstablishmentCard({ establishment: e, index, onClick }: Props) {
  const moments = momentoByEstablishment[e.id] ?? [];
  const hasMomento = moments.length > 0;
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.2, 0, 0.2, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(e.id)}
      className="group relative w-full overflow-hidden rounded-card border border-border bg-surface text-left transition-all hover:border-brand/40 hover:shadow-soft"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={e.cover}
          alt={e.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/30 to-transparent" />

        {hasMomento && (
          <Link
            href={`/app/estabelecimento/${e.id}/momento`}
            onClick={(ev) => ev.stopPropagation()}
            className="absolute right-3 bottom-3 z-10 story-ring rounded-full"
            title="Ver No Momento"
          >
            <span className="grid size-11 place-items-center rounded-full bg-bg/85 text-white backdrop-blur">
              <Camera className="size-4" />
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-brand text-[0.55rem] font-bold ring-1 ring-bg">
                {moments.length}
              </span>
            </span>
          </Link>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-pill bg-black/55 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            {typeLabel[e.type]}
          </span>
          {e.openNow && (
            <span className="flex items-center gap-1.5 rounded-pill bg-success/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-success backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-success live-dot" />
              Aberto
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-pill bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <Star className="size-3.5 fill-warn text-warn" />
          {e.rating.toFixed(1)}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-extrabold text-white drop-shadow">
              {e.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/80">
              <MapPin className="size-3" />
              {e.city}/{e.state} · {formatDistance(e.distanceKm)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="size-7 rounded-full border-2 border-surface bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://i.pravatar.cc/64?img=${(parseInt(e.id.length.toString()) + i) % 70 + 1})`,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="flex items-center gap-1 text-sm font-bold text-text">
              <Users className="size-3.5 text-brand" />
              {formatCount(e.presentNow)}
            </span>
            <span className="text-[0.65rem] text-muted">presentes agora</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <GenderPill icon="♂" count={e.presentByGender.male} color="#3b82f6" />
          <GenderPill icon="♀" count={e.presentByGender.female} color="#ec4899" />
        </div>
      </div>

      {e.presentNow > 300 && (
        <div className="absolute -right-2 top-3 z-10 flex items-center gap-1 rounded-l-pill bg-brand px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-glow">
          <Flame className="size-3" />
          Lotado
        </div>
      )}
    </motion.button>
  );
}

function GenderPill({ icon, count, color }: { icon: string; count: number; color: string }) {
  return (
    <div
      className="flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-1 text-[0.7rem] font-semibold"
      style={{ color }}
    >
      <span className="text-sm leading-none">{icon}</span>
      <span>{formatCount(count)}</span>
    </div>
  );
}
