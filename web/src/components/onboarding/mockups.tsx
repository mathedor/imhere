"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Building2,
  Crown,
  Gift,
  Heart,
  MapPin,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

type Tone = "brand" | "blue" | "purple" | "green" | "amber";

const tones: Record<Tone, { from: string; to: string; soft: string; ring: string }> = {
  brand: { from: "#ef2c39", to: "#b41822", soft: "#ef2c3915", ring: "#ef2c3940" },
  blue: { from: "#3b82f6", to: "#1d4ed8", soft: "#3b82f615", ring: "#3b82f640" },
  purple: { from: "#a855f7", to: "#7c3aed", soft: "#a855f715", ring: "#a855f740" },
  green: { from: "#22c55e", to: "#15803d", soft: "#22c55e15", ring: "#22c55e40" },
  amber: { from: "#f59e0b", to: "#b45309", soft: "#f59e0b15", ring: "#f59e0b40" },
};

interface FrameProps {
  tone: Tone;
  children: React.ReactNode;
  variant?: "phone" | "panel";
}

function Frame({ tone, children, variant = "phone" }: FrameProps) {
  const t = tones[tone];
  return (
    <div
      className="relative grid place-items-center px-6 py-8"
      style={{
        background: `radial-gradient(ellipse at top, ${t.soft}, transparent 70%)`,
      }}
    >
      <div
        className="absolute inset-x-12 top-4 h-32 rounded-full opacity-30 blur-3xl"
        style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
      />
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className={
          variant === "phone"
            ? "relative w-[240px] overflow-hidden rounded-[28px] border-[6px] border-black bg-[#0b0d10] shadow-2xl"
            : "relative w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d10] shadow-2xl"
        }
        style={{ boxShadow: `0 30px 80px -20px ${t.ring}` }}
      >
        {variant === "phone" && (
          <div className="absolute left-1/2 top-1.5 z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-black" />
        )}
        {children}
      </motion.div>
    </div>
  );
}

function StatusBar({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-3 pb-2 pt-5 text-[0.55rem] font-bold uppercase tracking-wider text-white/40">
      <span>{label}</span>
      <span>•••</span>
    </div>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="grid size-7 place-items-center rounded-full text-[0.55rem] font-bold text-white"
      style={{ background: color }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ============================================================================
// MOCKUPS — USER / APP
// ============================================================================

export function CheckInMockup() {
  return (
    <Frame tone="brand">
      <StatusBar label="Explorar" />
      <div className="space-y-2 p-3">
        <div className="rounded-xl bg-white/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[0.55rem] text-white/50">
            <MapPin className="size-2.5" /> Você está aqui
          </div>
          <div className="mt-1 text-xs font-bold text-white">Bar do Zé</div>
          <div className="text-[0.55rem] text-white/40">Centro, Florianópolis</div>
        </div>
        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-white"
          style={{ background: "linear-gradient(135deg, #ef2c39, #b41822)" }}
        >
          <Sparkles className="size-3" /> Estou aqui
        </motion.button>
        <div className="space-y-1 pt-1">
          <div className="text-[0.55rem] font-bold uppercase tracking-wider text-white/40">
            Quem tá no rolê
          </div>
          {[
            { n: "Ana", c: "#ef2c39", t: "23 · vibe top" },
            { n: "Léo", c: "#3b82f6", t: "27 · solteiro" },
            { n: "Bia", c: "#a855f7", t: "25 · com amigas" },
          ].map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2 rounded-lg bg-white/5 p-1.5"
            >
              <Avatar name={p.n} color={p.c} />
              <div className="min-w-0 flex-1">
                <div className="text-[0.6rem] font-bold text-white">{p.n}</div>
                <div className="truncate text-[0.5rem] text-white/40">{p.t}</div>
              </div>
              <div className="size-1.5 rounded-full bg-emerald-400" />
            </motion.div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function PeopleMockup() {
  return (
    <Frame tone="brand">
      <StatusBar label="No rolê" />
      <div className="space-y-1.5 p-3">
        <div className="flex gap-1.5">
          {["Filtrar", "23-30", "Solteiro"].map((f) => (
            <span
              key={f}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[0.5rem] font-bold text-white/80"
            >
              {f}
            </span>
          ))}
        </div>
        {[
          { n: "Ana", c: "#ef2c39", t: "23 · solteira", v: "🍻" },
          { n: "Léo", c: "#3b82f6", t: "27 · com amigos", v: "🎵" },
          { n: "Bia", c: "#a855f7", t: "25 · open", v: "✨" },
          { n: "Caio", c: "#22c55e", t: "29 · casado", v: "🍕" },
        ].map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-2 rounded-xl bg-white/5 p-2"
          >
            <Avatar name={p.n} color={p.c} />
            <div className="min-w-0 flex-1">
              <div className="text-[0.6rem] font-bold text-white">
                {p.n} {p.v}
              </div>
              <div className="text-[0.5rem] text-white/50">{p.t}</div>
            </div>
            <button className="rounded-lg bg-brand/20 px-1.5 py-0.5 text-[0.5rem] font-bold text-brand">
              Oi!
            </button>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

export function ChatMockup() {
  return (
    <Frame tone="brand">
      <StatusBar label="Chat com Ana" />
      <div className="space-y-2 p-3">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white/10 px-2.5 py-1.5"
        >
          <div className="text-[0.6rem] text-white">Eaí! Curtindo o som?</div>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm px-2.5 py-1.5"
          style={{ background: "linear-gradient(135deg, #ef2c39, #b41822)" }}
        >
          <div className="text-[0.6rem] text-white">Bastante! Tá na pista?</div>
        </motion.div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white/10 px-2.5 py-1.5"
        >
          <div className="text-[0.6rem] text-white">Pegando uma cerveja 🍻</div>
        </motion.div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1.5">
          <div className="flex-1 text-[0.55rem] text-white/40">Mande uma msg...</div>
          <MessageCircle className="size-3 text-brand" />
        </div>
      </div>
    </Frame>
  );
}

export function CreditsMockup() {
  return (
    <Frame tone="amber">
      <StatusBar label="Seus créditos" />
      <div className="space-y-2 p-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl p-3 text-center text-white"
          style={{ background: "linear-gradient(135deg, #f59e0b, #b45309)" }}
        >
          <div className="text-[0.55rem] font-bold uppercase tracking-wider opacity-80">
            Saldo
          </div>
          <div className="flex items-center justify-center gap-1 text-xl font-black">
            <Wallet className="size-4" /> 250
          </div>
          <div className="text-[0.55rem] opacity-80">créditos</div>
        </motion.div>
        <div className="space-y-1">
          {[
            { l: "Pacote 100", v: "R$ 19,90" },
            { l: "Pacote 500", v: "R$ 79,90" },
            { l: "Pacote 1k", v: "R$ 139,90" },
          ].map((p, i) => (
            <motion.div
              key={p.l}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5"
            >
              <div className="text-[0.6rem] font-bold text-white">{p.l}</div>
              <div className="text-[0.55rem] font-bold text-amber-400">{p.v}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function ProfileMockup() {
  return (
    <Frame tone="brand">
      <StatusBar label="Meu perfil" />
      <div className="space-y-2 p-3">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-brand-strong to-brand text-base font-bold text-white"
          >
            VC
          </motion.div>
          <div className="mt-1 text-xs font-bold text-white">Seu nome</div>
          <div className="text-[0.55rem] text-white/50">@vocenoapp</div>
          <div className="mt-1 flex items-center gap-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[0.5rem] font-bold text-emerald-400">
            <ShieldCheck className="size-2" /> Verificado
          </div>
        </div>
        <div className="space-y-1 pt-1">
          {[
            { l: "Idade", v: "25 anos" },
            { l: "Vibe", v: "🎵 música" },
            { l: "Status", v: "Solteiro" },
          ].map((p) => (
            <div
              key={p.l}
              className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5"
            >
              <div className="text-[0.55rem] text-white/60">{p.l}</div>
              <div className="text-[0.55rem] font-bold text-white">{p.v}</div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// MOCKUPS — ESTABELECIMENTO
// ============================================================================

export function EstabDashboardMockup() {
  return (
    <Frame tone="blue" variant="panel">
      <StatusBar label="Bar do Zé · Dashboard" />
      <div className="grid grid-cols-2 gap-1.5 p-3">
        {[
          { l: "No local", v: "47", c: "#22c55e", i: UserCheck },
          { l: "Hoje", v: "152", c: "#3b82f6", i: TrendingUp },
          { l: "Semana", v: "1.2k", c: "#a855f7", i: BarChart3 },
          { l: "Avaliação", v: "4.8", c: "#f59e0b", i: Star },
        ].map((s, i) => {
          const Icon = s.i;
          return (
            <motion.div
              key={s.l}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="rounded-xl bg-white/5 p-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-[0.5rem] font-bold uppercase text-white/40">{s.l}</div>
                <Icon className="size-2.5" style={{ color: s.c }} />
              </div>
              <div className="text-base font-black text-white">{s.v}</div>
            </motion.div>
          );
        })}
      </div>
    </Frame>
  );
}

export function EstabPeopleMockup() {
  return (
    <Frame tone="blue" variant="panel">
      <StatusBar label="Pessoas no local · 12 agora" />
      <div className="space-y-1.5 p-3">
        {[
          { n: "Ana", c: "#ef2c39", t: "23 · há 12min", b: true },
          { n: "Léo", c: "#3b82f6", t: "27 · há 30min", b: false },
          { n: "Bia", c: "#a855f7", t: "25 · há 5min", b: true },
          { n: "Caio", c: "#22c55e", t: "29 · há 1h", b: false },
        ].map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5"
          >
            <Avatar name={p.n} color={p.c} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[0.6rem] font-bold text-white">
                {p.n}
                {p.b && <Heart className="size-2 fill-pink-500 text-pink-500" />}
              </div>
              <div className="text-[0.5rem] text-white/50">{p.t}</div>
            </div>
            <div className="size-1.5 rounded-full bg-emerald-400" />
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

export function BroadcastMockup() {
  return (
    <Frame tone="blue" variant="panel">
      <StatusBar label="Disparar aviso" />
      <div className="space-y-2 p-3">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2"
        >
          <div className="flex items-center gap-1.5">
            <Megaphone className="size-3 text-blue-400" />
            <div className="text-[0.55rem] font-bold uppercase text-blue-400">
              Pra todos no local
            </div>
          </div>
          <div className="mt-1 text-[0.6rem] text-white">
            "🍻 Happy hour rolando! Chopp em dobro até 20h"
          </div>
        </motion.div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { l: "Promo", c: "#22c55e" },
            { l: "Show", c: "#a855f7" },
            { l: "Evento", c: "#f59e0b" },
          ].map((t) => (
            <div
              key={t.l}
              className="rounded-lg bg-white/5 py-1 text-center text-[0.5rem] font-bold"
              style={{ color: t.c }}
            >
              {t.l}
            </div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg bg-emerald-500/10 px-2 py-1 text-center text-[0.55rem] font-bold text-emerald-400"
        >
          ✓ Enviado a 47 pessoas
        </motion.div>
      </div>
    </Frame>
  );
}

export function LoyaltyMockup() {
  return (
    <Frame tone="amber" variant="panel">
      <StatusBar label="Programa fidelidade" />
      <div className="space-y-2 p-3">
        <div className="text-center">
          <Heart className="mx-auto size-6 fill-pink-500 text-pink-500" />
          <div className="mt-0.5 text-[0.6rem] font-bold text-white">Ana · cliente VIP</div>
          <div className="text-[0.5rem] text-white/50">12ª visita este mês</div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[0.5rem] text-white/60">
            <span>Próxima recompensa</span>
            <span>8 / 10 visitas</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="h-full"
              style={{ background: "linear-gradient(90deg, #f59e0b, #ec4899)" }}
            />
          </div>
        </div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 p-1.5"
        >
          <Gift className="size-3 text-amber-400" />
          <div className="text-[0.55rem] text-white">Recompensa: chopp grátis</div>
        </motion.div>
      </div>
    </Frame>
  );
}

export function BoostMockup() {
  return (
    <Frame tone="purple" variant="panel">
      <StatusBar label="Boost · destaque" />
      <div className="space-y-2 p-3">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="rounded-xl p-2.5 text-center text-white"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          <Zap className="mx-auto size-5" />
          <div className="mt-0.5 text-[0.65rem] font-black uppercase">Bar do Zé EM DESTAQUE</div>
          <div className="text-[0.5rem] opacity-90">Aparece no topo da busca</div>
        </motion.div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { l: "1h", v: "50¢" },
            { l: "4h", v: "150¢" },
            { l: "Dia", v: "300¢" },
          ].map((p, i) => (
            <motion.div
              key={p.l}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-lg bg-white/5 p-1.5 text-center"
            >
              <div className="text-[0.5rem] text-white/60">{p.l}</div>
              <div className="text-[0.55rem] font-bold text-purple-400">{p.v}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function EstabReportsMockup() {
  return (
    <Frame tone="blue" variant="panel">
      <StatusBar label="Relatórios · semana" />
      <div className="space-y-2 p-3">
        <div className="flex items-end gap-1.5 px-1 pt-1">
          {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
              className="flex-1 rounded-t"
              style={{
                background: `linear-gradient(180deg, #3b82f6, #1d4ed8)`,
                minHeight: 8,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[0.5rem] text-white/40">
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
            <span key={i} className="w-3 text-center">
              {d}
            </span>
          ))}
        </div>
        <div className="rounded-lg bg-white/5 p-1.5">
          <div className="text-[0.5rem] text-white/50">Crescimento</div>
          <div className="flex items-center gap-1 text-[0.65rem] font-bold text-emerald-400">
            <TrendingUp className="size-2.5" /> +23% vs semana passada
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// MOCKUPS — COMERCIAL
// ============================================================================

export function PipelineMockup() {
  return (
    <Frame tone="purple" variant="panel">
      <StatusBar label="Pipeline" />
      <div className="space-y-1.5 p-3">
        {[
          { e: "Bar Central", s: "Lead", c: "#94a3b8" },
          { e: "Pizzaria Mio", s: "Proposta", c: "#f59e0b" },
          { e: "Pub do João", s: "Fechado", c: "#22c55e" },
          { e: "Boteco do Sul", s: "Negociação", c: "#3b82f6" },
        ].map((c, i) => (
          <motion.div
            key={c.e}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-2 rounded-xl bg-white/5 p-2"
          >
            <Building2 className="size-3 text-white/40" />
            <div className="min-w-0 flex-1">
              <div className="text-[0.6rem] font-bold text-white">{c.e}</div>
              <div className="text-[0.5rem] text-white/50">{c.s}</div>
            </div>
            <span
              className="size-2 rounded-full"
              style={{ background: c.c, boxShadow: `0 0 8px ${c.c}` }}
            />
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

export function NewClientMockup() {
  return (
    <Frame tone="purple" variant="panel">
      <StatusBar label="Novo cliente" />
      <div className="space-y-2 p-3">
        {[
          { l: "Nome do local", v: "Bar do Zé" },
          { l: "Telefone", v: "(48) 99...." },
          { l: "Categoria", v: "Bar / Pub" },
        ].map((f, i) => (
          <motion.div
            key={f.l}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="rounded-lg border border-white/10 bg-white/5 p-1.5"
          >
            <div className="text-[0.5rem] uppercase tracking-wide text-white/40">{f.l}</div>
            <div className="text-[0.6rem] font-bold text-white">{f.v}</div>
          </motion.div>
        ))}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full rounded-lg py-1.5 text-[0.55rem] font-bold uppercase tracking-wider text-white"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          Cadastrar
        </motion.button>
      </div>
    </Frame>
  );
}

export function CommissionMockup() {
  return (
    <Frame tone="green" variant="panel">
      <StatusBar label="Comissões · mês" />
      <div className="space-y-2 p-3">
        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          className="rounded-xl p-3 text-center text-white"
          style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}
        >
          <div className="text-[0.55rem] font-bold uppercase opacity-80">A receber</div>
          <div className="text-xl font-black">R$ 2.840</div>
          <div className="text-[0.5rem] opacity-80">7 contratos ativos</div>
        </motion.div>
        <div className="space-y-1">
          {[
            { e: "Bar Central", v: "R$ 480" },
            { e: "Pub do João", v: "R$ 320" },
            { e: "Pizzaria Mio", v: "R$ 290" },
          ].map((p, i) => (
            <motion.div
              key={p.e}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1"
            >
              <div className="text-[0.55rem] text-white/80">{p.e}</div>
              <div className="text-[0.55rem] font-bold text-emerald-400">{p.v}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function ClientsListMockup() {
  return (
    <Frame tone="purple" variant="panel">
      <StatusBar label="Meus clientes" />
      <div className="space-y-1.5 p-3">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5">
          <Search className="size-2.5 text-white/40" />
          <div className="text-[0.55rem] text-white/40">Buscar cliente...</div>
        </div>
        {[
          { e: "Bar Central", s: "Ativo · plano Pro", c: "#22c55e" },
          { e: "Pub do João", s: "Ativo · plano Básico", c: "#22c55e" },
          { e: "Pizzaria Mio", s: "Pendente", c: "#f59e0b" },
        ].map((c, i) => (
          <motion.div
            key={c.e}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-center gap-2 rounded-lg bg-white/5 p-1.5"
          >
            <div
              className="grid size-6 place-items-center rounded-md text-[0.5rem] font-bold text-white"
              style={{ background: "#a855f7" }}
            >
              {c.e[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.55rem] font-bold text-white">{c.e}</div>
              <div className="truncate text-[0.5rem]" style={{ color: c.c }}>
                {c.s}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

export function ComercialReportsMockup() {
  return (
    <Frame tone="purple" variant="panel">
      <StatusBar label="Performance" />
      <div className="space-y-2 p-3">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { l: "Leads", v: "23" },
            { l: "Convertidos", v: "7" },
            { l: "Taxa", v: "30%" },
            { l: "Ticket md.", v: "R$ 405" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="rounded-lg bg-white/5 p-1.5"
            >
              <div className="text-[0.5rem] uppercase text-white/40">{s.l}</div>
              <div className="text-sm font-black text-white">{s.v}</div>
            </motion.div>
          ))}
        </div>
        <div className="rounded-lg bg-purple-500/10 p-1.5">
          <div className="text-[0.5rem] text-white/50">Rank do mês</div>
          <div className="flex items-center gap-1 text-[0.6rem] font-bold text-purple-400">
            <Crown className="size-2.5" /> #3 de 12 comerciais
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// MOCKUPS — ADMIN
// ============================================================================

export function AdminDashboardMockup() {
  return (
    <Frame tone="brand" variant="panel">
      <StatusBar label="Admin · Visão geral" />
      <div className="grid grid-cols-2 gap-1.5 p-3">
        {[
          { l: "Usuários", v: "12.4k", i: Users, c: "#ef2c39" },
          { l: "Estabs", v: "847", i: Building2, c: "#3b82f6" },
          { l: "Receita", v: "R$ 84k", i: BarChart3, c: "#22c55e" },
          { l: "Online", v: "2.1k", i: TrendingUp, c: "#f59e0b" },
        ].map((s, i) => {
          const Icon = s.i;
          return (
            <motion.div
              key={s.l}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="rounded-xl bg-white/5 p-2"
            >
              <Icon className="mb-1 size-3" style={{ color: s.c }} />
              <div className="text-base font-black text-white">{s.v}</div>
              <div className="text-[0.5rem] uppercase tracking-wide text-white/40">{s.l}</div>
            </motion.div>
          );
        })}
      </div>
    </Frame>
  );
}

export function AdminUsersMockup() {
  return (
    <Frame tone="brand" variant="panel">
      <StatusBar label="Usuários · 12.4k total" />
      <div className="space-y-1.5 p-3">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5">
          <Search className="size-2.5 text-white/40" />
          <div className="text-[0.55rem] text-white/40">Buscar usuário...</div>
        </div>
        {[
          { n: "Ana Silva", e: "ana@...", v: true, c: "#ef2c39" },
          { n: "Léo Costa", e: "leo@...", v: false, c: "#3b82f6" },
          { n: "Bia Reis", e: "bia@...", v: true, c: "#a855f7" },
        ].map((u, i) => (
          <motion.div
            key={u.n}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-2 rounded-lg bg-white/5 p-1.5"
          >
            <Avatar name={u.n} color={u.c} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[0.55rem] font-bold text-white">
                {u.n}
                {u.v && <ShieldCheck className="size-2 text-emerald-400" />}
              </div>
              <div className="text-[0.5rem] text-white/50">{u.e}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

export function ModerationMockup() {
  return (
    <Frame tone="amber" variant="panel">
      <StatusBar label="Moderação · 3 abertas" />
      <div className="space-y-1.5 p-3">
        {[
          { t: "Foto inapropriada", u: "user_4821", c: "#ef2c39" },
          { t: "Comportamento abusivo", u: "user_2310", c: "#f59e0b" },
          { t: "Spam no chat", u: "user_9912", c: "#94a3b8" },
        ].map((d, i) => (
          <motion.div
            key={d.t}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="rounded-lg border-l-2 bg-white/5 p-1.5"
            style={{ borderColor: d.c }}
          >
            <div className="flex items-center justify-between">
              <div className="text-[0.55rem] font-bold text-white">{d.t}</div>
              <ShieldCheck className="size-2.5 text-white/40" />
            </div>
            <div className="text-[0.5rem] text-white/50">denunciado · {d.u}</div>
          </motion.div>
        ))}
        <div className="flex gap-1">
          <div className="flex-1 rounded-md bg-emerald-500/15 py-1 text-center text-[0.5rem] font-bold text-emerald-400">
            Aprovar
          </div>
          <div className="flex-1 rounded-md bg-rose-500/15 py-1 text-center text-[0.5rem] font-bold text-rose-400">
            Banir
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function PlansMockup() {
  return (
    <Frame tone="amber" variant="panel">
      <StatusBar label="Planos · gestão" />
      <div className="space-y-1.5 p-3">
        {[
          { n: "Básico", v: "R$ 49/mês", s: "234 ativos", c: "#94a3b8" },
          { n: "Pro", v: "R$ 149/mês", s: "412 ativos", c: "#3b82f6" },
          { n: "Premium", v: "R$ 299/mês", s: "201 ativos", c: "#f59e0b" },
        ].map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="rounded-xl border bg-white/5 p-2"
            style={{ borderColor: `${p.c}40` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Crown className="size-2.5" style={{ color: p.c }} />
                <div className="text-[0.6rem] font-bold text-white">{p.n}</div>
              </div>
              <div className="text-[0.55rem] font-bold" style={{ color: p.c }}>
                {p.v}
              </div>
            </div>
            <div className="text-[0.5rem] text-white/50">{p.s}</div>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

export function AdminReportsMockup() {
  return (
    <Frame tone="brand" variant="panel">
      <StatusBar label="Relatórios · 30 dias" />
      <div className="space-y-2 p-3">
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-[0.5rem] uppercase text-white/40">Receita</div>
          <div className="text-base font-black text-white">R$ 84.230</div>
          <div className="flex items-center gap-1 text-[0.55rem] font-bold text-emerald-400">
            <TrendingUp className="size-2.5" /> +18% mês a mês
          </div>
        </div>
        <div className="flex items-end gap-1 px-1">
          {[30, 45, 38, 60, 50, 75, 68, 85, 78, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h * 0.4}px` }}
              transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }}
              className="flex-1 rounded-t"
              style={{ background: "linear-gradient(180deg, #ef2c39, #b41822)" }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-md bg-brand/10 p-1">
          <BarChart3 className="size-2.5 text-brand" />
          <div className="text-[0.5rem] text-white/70">20+ relatórios disponíveis</div>
        </div>
      </div>
    </Frame>
  );
}

export function NotificationsMockup() {
  return (
    <Frame tone="brand">
      <StatusBar label="Notificações" />
      <div className="space-y-1.5 p-3">
        {[
          { t: "Ana pediu pra falar com você", c: "#ef2c39", i: MessageCircle },
          { t: "Você ganhou 50 créditos!", c: "#f59e0b", i: Sparkles },
          { t: "Bar do Zé tem promo hoje", c: "#3b82f6", i: Bell },
        ].map((n, i) => {
          const Icon = n.i;
          return (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5"
            >
              <div
                className="grid size-6 place-items-center rounded-lg"
                style={{ background: `${n.c}30` }}
              >
                <Icon className="size-2.5" style={{ color: n.c }} />
              </div>
              <div className="min-w-0 flex-1 text-[0.55rem] text-white">{n.t}</div>
            </motion.div>
          );
        })}
      </div>
    </Frame>
  );
}
