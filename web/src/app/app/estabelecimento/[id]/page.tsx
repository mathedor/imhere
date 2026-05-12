"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Flame,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { CheckInButton } from "@/components/establishment/CheckInButton";
import { InfoIconRow } from "@/components/establishment/InfoIconRow";
import { PresentUserCard } from "@/components/establishment/PresentUserCard";
import { establishments, typeLabel } from "@/data/establishments";
import { presentByEstablishment, users } from "@/data/users";
import { formatCount, formatDistance } from "@/lib/utils";

export default function EstablishmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const place = establishments.find((e) => e.id === id);

  if (!place) notFound();

  const presentIds = presentByEstablishment[place.id] ?? [];
  const present = users.filter((u) => presentIds.includes(u.id));

  function openUser(uid: string) {
    router.push(`/app/usuario/${uid}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative">
        <div className="relative h-64 w-full overflow-hidden md:h-96 md:rounded-3xl md:mx-5">
          <Image
            src={place.cover}
            alt={place.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1024px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/30" />
        </div>

        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full glass-strong text-white transition-transform active:scale-90"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="absolute right-4 top-4 flex items-center gap-2">
          {place.openNow && (
            <span className="flex items-center gap-1.5 rounded-pill bg-success/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-success backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-success live-dot" />
              Aberto
            </span>
          )}
          {place.presentNow > 300 && (
            <span className="flex items-center gap-1.5 rounded-pill bg-brand/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-glow">
              <Flame className="size-3" />
              Lotado
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 md:px-10 md:pb-10">
          <span className="rounded-pill bg-black/55 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            {typeLabel[place.type]}
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white drop-shadow md:text-5xl">
            {place.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {place.city}/{place.state}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatDistance(place.distanceKm)} de você
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-warn text-warn" />
              {place.rating.toFixed(1)} ({formatCount(place.reviewCount)})
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="size-4" />
              {"$".repeat(place.priceLevel)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-7 px-5 py-6 md:px-10 md:py-8">
        <div className="rounded-2xl border border-border bg-surface/60 p-4 text-sm text-text-soft">
          <p className="leading-relaxed">{place.address}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {place.tags.map((t) => (
              <span
                key={t}
                className="rounded-pill bg-surface-2 px-2.5 py-1 text-[0.7rem] font-semibold text-text"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Tudo sobre o lugar
          </h2>
          <InfoIconRow />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr,1fr] md:items-stretch">
          <PresenceStats place={place} />
          <CheckInButton establishmentName={place.name} />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-text">Quem está aqui agora</h2>
              <p className="text-xs text-muted">
                {present.length} pessoa{present.length !== 1 && "s"} com check-in ativo · toque para
                ver o perfil
              </p>
            </div>
            <Link
              href="#"
              className="rounded-pill border border-border px-3 py-1.5 text-xs font-semibold text-text-soft transition-colors hover:border-brand/40 hover:text-text"
            >
              Filtrar
            </Link>
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {present.map((u, i) => (
              <PresentUserCard key={u.id} user={u} index={i} onClick={openUser} />
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function PresenceStats({ place }: { place: (typeof establishments)[number] }) {
  const total = place.presentNow;
  const m = place.presentByGender.male;
  const f = place.presentByGender.female;
  const o = place.presentByGender.other;
  const mPct = (m / total) * 100;
  const fPct = (f / total) * 100;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-xl bg-brand/15 text-brand">
          <Users className="size-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-2xl font-black text-text">{formatCount(total)}</span>
          <span className="text-xs text-muted">pessoas com check-in agora</span>
        </div>
      </div>

      <div className="mt-5 flex h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]"
          style={{ width: `${mPct}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-[#ec4899] to-[#f472b6]"
          style={{ width: `${fPct}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
        <Stat color="#3b82f6" label="Homens" value={m} pct={mPct} />
        <Stat color="#ec4899" label="Mulheres" value={f} pct={fPct} />
        {o > 0 && <Stat color="#a855f7" label="Outros" value={o} pct={(o / total) * 100} />}
      </div>
    </div>
  );
}

function Stat({ color, label, value, pct }: { color: string; label: string; value: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full" style={{ background: color }} />
      <span className="text-text font-semibold">{value}</span>
      <span className="text-muted">{label}</span>
      <span className="text-muted">· {pct.toFixed(0)}%</span>
    </div>
  );
}
