"use client";

import { motion } from "framer-motion";
import { Check, Clock, Gift, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { presentByEstablishment, users } from "@/data/users";
import { establishments } from "@/data/establishments";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

const MY_PLACE = establishments[0];

const HISTORY = [
  { id: "h1", userId: "u-mari", type: "Drink cortesia", message: "Passa lá no balcão!", at: "22:18", status: "redeemed" },
  { id: "h2", userId: "u-lucas", type: "10% off conta", message: "Aproveite, válido até 02h", at: "22:08", status: "sent" },
  { id: "h3", userId: "u-julia", type: "Mesa VIP", message: "Reservei a 12 pra vocês", at: "21:55", status: "redeemed" },
  { id: "h4", userId: "u-bea", type: "Petisco grátis", message: "", at: "21:30", status: "expired" },
  { id: "h5", userId: "u-rafa", type: "Drink cortesia", message: "Tem caipirinha boa hoje 😉", at: "21:14", status: "sent" },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  sent: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "Enviada" },
  redeemed: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Resgatada" },
  expired: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Expirou" },
};

export default function CortesiasPage() {
  const presentIds = presentByEstablishment[MY_PLACE.id] ?? [];
  const present = users.filter((u) => presentIds.includes(u.id));

  return (
    <PanelLayout
      scope="estabelecimento"
      title="Mensagens & cortesias"
      subtitle="Envie convites, descontos e atrações pros usuários no seu estabelecimento"
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Carla Pires", role: "Gerente" }}
    >
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Cortesias hoje", value: "23", color: "#ef2c39" },
          { label: "Taxa de resgate", value: "62%", color: "#22c55e" },
          { label: "Mensagens enviadas", value: "47", color: "#3b82f6" },
          { label: "Conversões em check-in", value: "+18", color: "#a855f7" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <span
              className="grid size-9 place-items-center rounded-xl"
              style={{ background: `${s.color}25`, color: s.color }}
            >
              <Gift className="size-4" />
            </span>
            <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-widest text-muted">{s.label}</p>
            <p className="text-2xl font-black text-text">{s.value}</p>
          </motion.div>
        ))}
      </section>

      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-bold text-text">Disparo rápido</h2>
        <p className="mb-4 text-xs text-text-soft">
          Envie uma cortesia geral pra <strong className="text-text">todos</strong> com check-in agora ({present.length} pessoas).
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            { icon: "🍸", label: "Drink", desc: "Cortesia" },
            { icon: "💸", label: "-10%", desc: "Conta" },
            { icon: "👑", label: "VIP", desc: "Mesa" },
            { icon: "🎉", label: "Convite", desc: "Evento" },
          ].map((g) => (
            <motion.button
              key={g.label}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface-2 px-3 py-4 transition-all hover:border-brand/40 hover:shadow-glow"
            >
              <span className="text-3xl">{g.icon}</span>
              <p className="text-xs font-bold text-text">{g.label}</p>
              <p className="text-[0.6rem] text-text-soft">{g.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">Histórico recente</h2>
          <Link href="/estabelecimento/pessoas" className="text-xs font-bold text-brand hover:underline">
            Enviar nova →
          </Link>
        </div>

        <ul className="flex flex-col gap-2">
          {HISTORY.map((h, i) => {
            const user = users.find((u) => u.id === h.userId);
            if (!user) return null;
            const st = STATUS_STYLES[h.status];
            return (
              <motion.li
                key={h.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
              >
                <div className="relative size-11 shrink-0 overflow-hidden rounded-xl">
                  <Image src={user.photo} alt={user.name} fill sizes="44px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-text">{user.name}</p>
                    <span
                      className="rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.status === "redeemed" ? <Check className="inline size-2.5" /> : null}
                      {st.label}
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-text-soft">
                    <Gift className="size-3 text-brand" />
                    {h.type}
                    {h.message && <span className="text-muted">· "{h.message}"</span>}
                  </p>
                </div>
                <span className="shrink-0 text-[0.65rem] text-muted">
                  <Clock className="mr-1 inline size-3" />
                  {h.at}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </PanelLayout>
  );
}
