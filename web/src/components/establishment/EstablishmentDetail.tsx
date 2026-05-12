"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, DollarSign, Flame, MapPin, Star, UtensilsCrossed, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckInButton } from "@/components/establishment/CheckInButton";
import { InfoIconRow } from "@/components/establishment/InfoIconRow";
import { PresentUserCard } from "@/components/establishment/PresentUserCard";
import { typeLabel, type Establishment } from "@/data/establishments";
import { type AppUser } from "@/data/users";
import { formatCount, formatDistance } from "@/lib/utils";

interface Props {
  place: Establishment;
  present: AppUser[];
  hasMomento: boolean;
  hasMenu: boolean;
  iAmCheckedInHere?: boolean;
  codeOfConductAccepted?: boolean;
}

export function EstablishmentDetail({
  place,
  present,
  hasMomento,
  hasMenu,
  iAmCheckedInHere = false,
  codeOfConductAccepted = false,
}: Props) {
  const router = useRouter();

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
            {place.distanceKm > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatDistance(place.distanceKm)} de você
              </span>
            )}
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
              <span key={t} className="rounded-pill bg-surface-2 px-2.5 py-1 text-[0.7rem] font-semibold text-text">
                {t}
              </span>
            ))}
          </div>
        </div>

        {hasMomento && (
          <Link
            href={`/app/estabelecimento/${place.id}/momento`}
            className="group flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 transition-colors hover:bg-brand/10"
          >
            <div className="story-ring rounded-full">
              <div className="grid size-10 place-items-center rounded-full bg-bg/85 text-brand">
                📸
              </div>
            </div>
            <div className="flex-1 leading-tight">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-brand">NO MOMENTO</p>
              <p className="text-sm font-bold text-text">Veja os stories ao vivo do {place.name}</p>
            </div>
            <span className="text-xs text-brand">Ver →</span>
          </Link>
        )}

        {hasMenu && (
          <Link
            href={`/cardapio/${place.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-brand/40"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-warn/15 text-warn">
              <UtensilsCrossed className="size-5" />
            </div>
            <div className="flex-1 leading-tight">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">Cardápio digital</p>
              <p className="text-sm font-bold text-text">Drinks, pratos e sobremesas</p>
            </div>
            <span className="text-xs text-text-soft">→</span>
          </Link>
        )}

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Tudo sobre o lugar
          </h2>
          <InfoIconRow />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr,1fr] md:items-stretch">
          <PresenceStats place={place} />
          <CheckInButton
            establishmentId={place.id}
            establishmentName={place.name}
            initialCheckedIn={iAmCheckedInHere}
            codeOfConductAccepted={codeOfConductAccepted}
          />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-text">Quem está aqui agora</h2>
              <p className="text-xs text-muted">
                {present.length} pessoa{present.length !== 1 && "s"} com check-in ativo · toque para ver o perfil
              </p>
            </div>
          </div>

          {present.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
              <Users className="mx-auto size-8 text-muted" />
              <p className="mt-3 text-sm font-bold text-text">Ninguém visível agora</p>
              <p className="text-xs text-text-soft">Pode haver pessoas em modo invisível.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {present.map((u, i) => (
                <PresentUserCard key={u.id} user={u} index={i} onClick={openUser} />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function PresenceStats({ place }: { place: Establishment }) {
  const total = place.presentNow;
  const m = place.presentByGender.male;
  const f = place.presentByGender.female;
  const o = place.presentByGender.other;
  const mPct = total > 0 ? (m / total) * 100 : 0;
  const fPct = total > 0 ? (f / total) * 100 : 0;

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
        <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]" style={{ width: `${mPct}%` }} />
        <div className="h-full bg-gradient-to-r from-[#ec4899] to-[#f472b6]" style={{ width: `${fPct}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
        <Stat color="#3b82f6" label="Homens" value={m} pct={mPct} />
        <Stat color="#ec4899" label="Mulheres" value={f} pct={fPct} />
        {o > 0 && <Stat color="#a855f7" label="Outros" value={o} pct={total > 0 ? (o / total) * 100 : 0} />}
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
