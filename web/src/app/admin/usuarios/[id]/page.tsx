"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Briefcase,
  Cake,
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  ShieldOff,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DateRangeFilter } from "@/components/panel/DateRangeFilter";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { establishments } from "@/data/establishments";
import { presentByEstablishment, users } from "@/data/users";
import { cn } from "@/lib/utils";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

interface Activity {
  id: string;
  type: "checkin" | "message" | "contact" | "login" | "moderation" | "subscription";
  title: string;
  body?: string;
  at: string;
  flag?: "ok" | "warn" | "blocked";
  establishmentId?: string;
}

function activitiesFor(userId: string): Activity[] {
  return [
    { id: "a1", type: "checkin", title: "Check-in: Lume Rooftop", at: "Hoje · 21:34", establishmentId: "lume-rooftop", flag: "ok" },
    { id: "a2", type: "contact", title: "Solicitou contato com Lucas Andrade", at: "Hoje · 21:42", flag: "ok" },
    { id: "a3", type: "message", title: "Enviou 4 mensagens em conv-lucas", body: "Conversa iniciada após contato aceito", at: "Hoje · 21:48", flag: "ok" },
    { id: "a4", type: "moderation", title: "Mensagem bloqueada pela moderação", body: "Termo ofensivo detectado: 'idiota'", at: "Ontem · 23:14", flag: "blocked" },
    { id: "a5", type: "subscription", title: "Upgrade para Premium", body: "R$ 39,90/mês · cartão final 4321", at: "2026-04-22 · 19:08", flag: "ok" },
    { id: "a6", type: "login", title: "Login a partir de São Paulo/SP", body: "iOS 18 · iPhone 15 Pro", at: "2026-05-10 · 14:22", flag: "ok" },
    { id: "a7", type: "checkin", title: "Check-out de Boteco da Vila", at: "2026-05-09 · 23:55", establishmentId: "boteco-da-vila", flag: "ok" },
    { id: "a8", type: "login", title: "Tentativa de login falhou", body: "Senha incorreta · IP 187.45.x.x", at: "2026-05-08 · 09:12", flag: "warn" },
    { id: "a9", type: "checkin", title: "Check-in: Subsolo Bar", at: "2026-05-07 · 22:10", establishmentId: "subsolo-bar", flag: "ok" },
    { id: "a10", type: "message", title: "Recebeu cortesia: drink", body: "De Lume Rooftop", at: "2026-05-06 · 22:45", flag: "ok" },
  ];
}

const ACTIVITY_ICONS: Record<Activity["type"], typeof Activity> = {
  checkin: MapPin as never,
  message: MessageCircle as never,
  contact: Sparkles as never,
  login: Shield as never,
  moderation: ShieldOff as never,
  subscription: CheckCircle2 as never,
};

const FLAG_COLORS = {
  ok: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  warn: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  blocked: { bg: "rgba(239,44,57,0.15)", color: "#ef2c39" },
};

export default function AdminUsuarioPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const user = users.find((u) => u.id === id);
  if (!user) notFound();

  const [range, setRange] = useState<"today" | "7d" | "30d" | "90d" | "year">("30d");
  const [filter, setFilter] = useState<Activity["type"] | "all">("all");

  const allActivities = activitiesFor(user.id);
  const visible = filter === "all" ? allActivities : allActivities.filter((a) => a.type === filter);

  const currentEstab = Object.entries(presentByEstablishment).find(([, ids]) =>
    ids.includes(user.id)
  )?.[0];
  const place = currentEstab ? establishments.find((e) => e.id === currentEstab) : null;

  return (
    <PanelLayout
      scope="admin"
      title={`Usuário · ${user.name}`}
      subtitle={`ID ${user.id} · perfil 360 com logs completos`}
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <Link href="/admin/usuarios" className="mb-4 inline-flex items-center gap-1 text-xs text-text-soft hover:text-text">
        <ArrowLeft className="size-3.5" />
        Voltar à lista
      </Link>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5 text-center">
            <div className="relative mx-auto size-32 overflow-hidden rounded-3xl ring-4 ring-bg">
              <Image src={user.photo} alt={user.name} fill sizes="128px" className="object-cover" />
            </div>
            <h2 className="mt-3 text-xl font-black text-text">{user.name}</h2>
            <p className="text-xs text-text-soft">{user.age} anos · {user.profession}</p>
            <div className="mt-3 flex justify-center gap-2">
              <span
                className="rounded-pill px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider"
                style={{
                  background: user.status === "open" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                  color: user.status === "open" ? "#22c55e" : "#f59e0b",
                }}
              >
                {user.status === "open" ? "Aberto" : "Observando"}
              </span>
              <span className="rounded-pill bg-brand/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-brand">
                Premium
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 py-2 text-xs font-bold text-text hover:border-brand/40">
                <Edit3 className="size-3.5" />
                Editar
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-brand hover:border-brand">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Contato</h3>
            <ul className="flex flex-col gap-3">
              <DataRow icon={Mail} label="E-mail" value={`${user.id}@imhere.app`} />
              <DataRow icon={Phone} label="WhatsApp" value="(11) 99999-1234" />
              {user.instagram && <DataRow icon={Instagram} label="Instagram" value={user.instagram} />}
              <DataRow icon={MapPin} label="Cidade" value={`${user.city}/${user.state}`} />
              <DataRow icon={Cake} label="Idade" value={`${user.age} anos`} />
              <DataRow icon={Briefcase} label="Profissão" value={user.profession} />
            </ul>
          </div>

          {place && (
            <Link
              href={`/admin/estabelecimentos/${place.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-3 transition-colors hover:bg-success/10"
            >
              <div className="grid size-9 place-items-center rounded-lg bg-success/20 text-success">
                <MapPin className="size-4" />
              </div>
              <div className="flex-1 leading-tight">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-success">
                  Check-in ativo
                </p>
                <p className="text-xs font-bold text-text">{place.name}</p>
              </div>
              <span className="size-2 rounded-full bg-success live-dot" />
            </Link>
          )}

          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
              Estatísticas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Check-ins" value="42" />
              <Stat label="Conexões" value="18" />
              <Stat label="Mensagens" value="312" />
              <Stat label="Bloqueios" value="1" warn />
            </div>
          </div>
        </aside>

        <main className="flex flex-col gap-4">
          <section className="rounded-3xl border border-border bg-surface p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-brand" />
                <h2 className="text-sm font-bold text-text">Logs e atividade</h2>
                <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[0.6rem] font-bold text-muted">
                  {visible.length} eventos
                </span>
              </div>
              <DateRangeFilter value={range} onChange={(v) => setRange(v)} />
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {([
                { key: "all", label: "Todos" },
                { key: "checkin", label: "Check-ins" },
                { key: "message", label: "Mensagens" },
                { key: "contact", label: "Contatos" },
                { key: "login", label: "Logins" },
                { key: "moderation", label: "Moderação" },
                { key: "subscription", label: "Assinatura" },
              ] as { key: typeof filter; label: string }[]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-pill border px-3 py-1 text-xs font-semibold transition-all",
                    filter === f.key
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface-2 text-text-soft hover:text-text"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ul className="flex flex-col gap-2">
              {visible.map((a, i) => {
                const Icon = ACTIVITY_ICONS[a.type];
                const flag = a.flag ? FLAG_COLORS[a.flag] : null;
                return (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 rounded-xl bg-surface-2 px-3 py-2.5"
                  >
                    <div
                      className="grid size-8 shrink-0 place-items-center rounded-lg"
                      style={flag ? { background: flag.bg, color: flag.color } : { background: "rgba(239,44,57,0.15)", color: "#ef2c39" }}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-text">{a.title}</p>
                      {a.body && <p className="text-xs text-text-soft">{a.body}</p>}
                    </div>
                    <span className="shrink-0 text-[0.65rem] text-muted">{a.at}</span>
                  </motion.li>
                );
              })}
              {visible.length === 0 && (
                <li className="rounded-xl bg-surface-2 py-8 text-center text-xs text-muted">
                  Nenhum evento neste filtro.
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-bold text-text">Bio</h2>
            <p className="text-sm leading-relaxed text-text-soft">{user.bio}</p>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-bold text-text">Ações administrativas</h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <AdminAction icon={Eye} label="Login as user" color="#3b82f6" />
              <AdminAction icon={Shield} label="Resetar senha" color="#f59e0b" />
              <AdminAction icon={XCircle} label="Suspender" color="#a855f7" />
              <AdminAction icon={Trash2} label="Excluir" color="#ef2c39" />
            </div>
          </section>
        </main>
      </section>
    </PanelLayout>
  );
}

function DataRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <Icon className="size-3.5 text-muted" />
      <span className="text-muted">{label}:</span>
      <span className="ml-auto truncate text-text">{value}</span>
    </li>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5">
      <p className={cn("text-xl font-black", warn ? "text-warn" : "text-text")}>{value}</p>
      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}

function AdminAction({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Eye;
  label: string;
  color: string;
}) {
  return (
    <button className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface-2 p-3 transition-all hover:-translate-y-0.5 hover:border-brand/40">
      <div
        className="grid size-9 place-items-center rounded-xl transition-transform group-hover:scale-110"
        style={{ background: `${color}25`, color }}
      >
        <Icon className="size-4" />
      </div>
      <span className="text-[0.7rem] font-bold text-text">{label}</span>
    </button>
  );
}
