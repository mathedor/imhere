"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Cake,
  Eye,
  Instagram,
  MapPin,
  MessageCirclePlus,
  Shield,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { ContactButton } from "@/components/user/ContactButton";
import { UserGallery } from "@/components/user/UserGallery";
import { establishments } from "@/data/establishments";
import { presentByEstablishment, users } from "@/data/users";

export default function UserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const user = users.find((u) => u.id === id);

  if (!user) notFound();

  const currentPlace = Object.entries(presentByEstablishment).find(([, ids]) =>
    ids.includes(user.id)
  )?.[0];
  const place = currentPlace ? establishments.find((e) => e.id === currentPlace) : null;

  const statusLabel =
    user.status === "open" ? "Aberto a conversa" : user.status === "watching" ? "Só observando" : "Invisível";
  const statusColor = user.status === "open" ? "#22c55e" : "#f59e0b";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative">
        <div className="relative h-72 w-full overflow-hidden md:h-80 md:rounded-3xl md:mx-5">
          <Image
            src={user.gallery?.[1] || user.photo}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1024px"
            className="object-cover blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/60 to-bg" />
        </div>

        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full glass-strong text-white"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

      <div className="-mt-32 flex flex-col gap-6 px-5 pb-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6"
        >
          <div className="relative">
            <div className="relative size-36 overflow-hidden rounded-3xl border-4 border-bg shadow-2xl md:size-44">
              <Image src={user.photo} alt={user.name} fill sizes="200px" className="object-cover" />
            </div>
            <span
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-white shadow-glow whitespace-nowrap"
              style={{ background: statusColor }}
            >
              {user.status === "open" ? (
                <MessageCirclePlus className="size-3" />
              ) : (
                <Eye className="size-3" />
              )}
              {statusLabel}
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 pt-3 text-center md:items-start md:pt-0 md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">
              {user.name}, {user.age}
            </h1>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-text-soft md:justify-start">
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-3.5" />
                {user.profession}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {user.city}/{user.state}
              </span>
              {user.instagram && (
                <a
                  href={`https://instagram.com/${user.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-brand hover:underline"
                >
                  <Instagram className="size-3.5" />
                  {user.instagram}
                </a>
              )}
            </p>
          </div>
        </motion.div>

        {place && (
          <Link
            href={`/app/estabelecimento/${place.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 px-4 py-3 transition-colors hover:bg-success/10"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-success/20 text-success">
              <MapPin className="size-5" />
            </div>
            <div className="flex flex-1 flex-col leading-tight">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-success">
                Está aqui agora
              </span>
              <span className="text-sm font-bold text-text">{place.name}</span>
              <span className="text-xs text-text-soft">
                Check-in às {user.checkedInAt} · {place.city}/{place.state}
              </span>
            </div>
            <span className="size-2 rounded-full bg-success live-dot" />
          </Link>
        )}

        <ContactButton userName={user.name} hasPlan={true} sharedCheckin={true} />

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">Sobre</h2>
          <p className="rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-text-soft">
            {user.bio}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric icon={Users} label="Visitas ao perfil" value="142" hint="últimos 30 dias" />
          <Metric icon={Star} label="Conexões" value="38" hint="conversas iniciadas" />
          <Metric icon={Cake} label="Aniversário" value="12 Mar" hint="próximo em 4 dias" />
          <Metric icon={Shield} label="Verificado" value="Sim" hint="cadastro completo" />
        </section>

        {user.gallery && user.gallery.length > 0 && (
          <section>
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Galeria</h2>
              <span className="text-xs text-text-soft">{user.gallery.length} fotos</span>
            </div>
            <UserGallery photos={user.gallery} name={user.name} />
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Pessoas similares aqui
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {users
              .filter((u) => u.id !== user.id && u.status === "open")
              .slice(0, 8)
              .map((u) => (
                <Link
                  key={u.id}
                  href={`/app/usuario/${u.id}`}
                  className="group flex w-24 shrink-0 flex-col items-center gap-1.5"
                >
                  <div className="relative size-20 overflow-hidden rounded-2xl border border-border transition-all group-hover:border-brand/60">
                    <Image src={u.photo} alt={u.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <span className="truncate text-xs font-semibold text-text">
                    {u.name.split(" ")[0]}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-2 grid size-9 place-items-center rounded-xl bg-brand/15 text-brand">
        <Icon className="size-4" />
      </div>
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-black text-text">{value}</p>
      <p className="text-[0.65rem] text-text-soft">{hint}</p>
    </div>
  );
}
