"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Cake,
  Calendar,
  Clock,
  Gift,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { establishments } from "@/data/establishments";
import { presentByEstablishment, users } from "@/data/users";
import { cn } from "@/lib/utils";
import { NAV_ESTAB } from "../../page";

const MY_PLACE = establishments[0];

export default function EstabelecimentoUsuarioPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const user = users.find((u) => u.id === id);
  if (!user) notFound();

  const isPresent = (presentByEstablishment[MY_PLACE.id] ?? []).includes(user.id);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const visits = [
    { date: "Hoje", time: user.checkedInAt ?? "21:34", duration: "ainda no local" },
    { date: "2026-05-09", time: "22:08", duration: "2h 18min" },
    { date: "2026-05-02", time: "21:15", duration: "3h 02min" },
    { date: "2026-04-25", time: "22:40", duration: "1h 45min" },
    { date: "2026-04-18", time: "23:01", duration: "2h 30min" },
  ];

  const QUICK_GIFTS = [
    { id: "drink", label: "Drink cortesia", icon: "🍸" },
    { id: "discount", label: "10% off", icon: "💸" },
    { id: "vip", label: "Mesa VIP", icon: "👑" },
    { id: "snack", label: "Petisco grátis", icon: "🍢" },
  ];

  function send() {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSelectedGift(null);
      setMessage("");
    }, 2500);
  }

  return (
    <PanelLayout
      scope="estabelecimento"
      title={`Perfil · ${user.name}`}
      subtitle={
        isPresent
          ? `Está aqui agora · chegou às ${user.checkedInAt}`
          : "Visitante recorrente do seu estabelecimento"
      }
      nav={NAV_ESTAB}
      user={{ name: "Carla Pires", role: "Gerente" }}
    >
      <Link
        href="/estabelecimento/pessoas"
        className="mb-4 inline-flex items-center gap-1 text-xs text-text-soft hover:text-text"
      >
        <ArrowLeft className="size-3.5" />
        Voltar
      </Link>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5 text-center">
            <div className="relative mx-auto size-32 overflow-hidden rounded-3xl ring-4 ring-bg">
              <Image src={user.photo} alt={user.name} fill sizes="128px" className="object-cover" />
              {isPresent && (
                <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-pill bg-success px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow whitespace-nowrap">
                  <span className="size-1.5 rounded-full bg-white live-dot" />
                  No local
                </span>
              )}
            </div>
            <h2 className="mt-4 text-xl font-black text-text">{user.name}</h2>
            <p className="text-xs text-text-soft">
              {user.age} anos · {user.profession}
            </p>

            <div className="mt-3 flex justify-center gap-2">
              <span
                className="rounded-pill px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider"
                style={{
                  background: user.status === "open" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                  color: user.status === "open" ? "#22c55e" : "#f59e0b",
                }}
              >
                {user.status === "open" ? "Aberto a conversa" : "Observando"}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Sobre</h3>
            <p className="text-sm leading-relaxed text-text-soft">{user.bio}</p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Contato</h3>
            <ul className="flex flex-col gap-3 text-xs">
              <DataRow icon={Mail} label="E-mail" value={`${user.id}@imhere.app`} />
              <DataRow icon={Phone} label="WhatsApp" value="(11) 99999-1234" />
              {user.instagram && <DataRow icon={Instagram} label="Instagram" value={user.instagram} />}
              <DataRow icon={MapPin} label="Cidade" value={`${user.city}/${user.state}`} />
              <DataRow icon={Cake} label="Idade" value={`${user.age} anos`} />
              <DataRow icon={Briefcase} label="Profissão" value={user.profession} />
            </ul>
          </div>
        </aside>

        <main className="flex flex-col gap-4">
          <section className="grid grid-cols-3 gap-3">
            {[
              { label: "Visitas", value: String(visits.length), color: "#3b82f6" },
              { label: "Tempo médio", value: "2h 12m", color: "#a855f7" },
              { label: "Cortesias", value: "3", color: "#22c55e" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-surface p-4 text-center"
              >
                <p className="text-2xl font-black" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">{s.label}</p>
              </motion.div>
            ))}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Gift className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-text">Enviar cortesia ou mensagem</h2>
            </div>
            {sent ? (
              <div className="rounded-2xl bg-success/10 px-4 py-6 text-center text-sm font-bold text-success">
                ✓ Enviado para {user.name.split(" ")[0]}!
              </div>
            ) : (
              <>
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {QUICK_GIFTS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGift(g.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 transition-all",
                        selectedGift === g.id
                          ? "border-brand bg-brand/10"
                          : "border-border bg-surface-2 hover:border-brand/40"
                      )}
                    >
                      <span className="text-2xl">{g.icon}</span>
                      <p className="text-[0.65rem] font-bold text-text">{g.label}</p>
                    </button>
                  ))}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mensagem opcional..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand/60"
                />
                <button
                  onClick={send}
                  disabled={!selectedGift}
                  className={cn(
                    "mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold uppercase tracking-wider transition-all",
                    selectedGift
                      ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                      : "bg-surface-2 text-muted"
                  )}
                >
                  <MessageCircle className="size-4" />
                  Enviar para {user.name.split(" ")[0]}
                </button>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-text">Histórico de visitas a este estabelecimento</h2>
            </div>
            <ul className="flex flex-col gap-2">
              {visits.map((v, i) => (
                <motion.li
                  key={v.date + v.time}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5"
                >
                  <div className="grid size-9 place-items-center rounded-lg bg-brand/15 text-brand">
                    <MapPin className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text">{v.date}</p>
                    <p className="flex items-center gap-1.5 text-[0.7rem] text-text-soft">
                      <Clock className="size-3" />
                      Chegou às {v.time}
                    </p>
                  </div>
                  <span className="text-[0.7rem] text-muted">{v.duration}</span>
                </motion.li>
              ))}
            </ul>
          </section>
        </main>
      </section>
    </PanelLayout>
  );
}

function DataRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <li className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted" />
      <span className="text-muted">{label}:</span>
      <span className="ml-auto truncate text-text">{value}</span>
    </li>
  );
}
