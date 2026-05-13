"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Megaphone, Send, Users, UserCheck } from "lucide-react";
import { useState } from "react";
import { broadcastEstabMessageAction } from "@/lib/actions/loyalty";
import { cn } from "@/lib/utils";

interface Props {
  presentNow: number;
  estabName: string;
}

type Audience = "active" | "recent" | "both";

const AUDIENCES: Array<{ key: Audience; label: string; desc: string; icon: typeof Users }> = [
  { key: "active", label: "Quem está aqui agora", desc: "Apenas check-ins ativos", icon: UserCheck },
  { key: "recent", label: "Frequentadores (7d)", desc: "Quem fez check-in nos últimos 7 dias", icon: Users },
  { key: "both", label: "Todos", desc: "Ativos + frequentadores recentes", icon: Megaphone },
];

const TEMPLATES = [
  "🎵 Banda começa em 30 minutos!",
  "🍻 Happy hour rolando agora · cervejas 50% off",
  "🎁 Hoje rolou cortesia surpresa, vem aproveitar",
  "📍 Ainda dá tempo de chegar · estamos abertos",
];

export function BroadcastClient({ presentNow, estabName }: Props) {
  const [audience, setAudience] = useState<Audience>("active");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; sent: number } | null>(null);

  async function handleSend() {
    if (message.trim().length < 3) return;
    setSending(true);
    setResult(null);
    const fd = new FormData();
    fd.append("message", message);
    fd.append("audience", audience);
    const r = await broadcastEstabMessageAction(fd);
    setSending(false);
    setResult({ ok: r.ok, sent: r.sent });
    if (r.ok) {
      setTimeout(() => {
        setMessage("");
        setResult(null);
      }, 4000);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Audiência */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-bold text-text">Quem vai receber?</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {AUDIENCES.map((a) => {
            const Icon = a.icon;
            const active = audience === a.key;
            return (
              <button
                key={a.key}
                onClick={() => setAudience(a.key)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-brand bg-brand/10 shadow-glow"
                    : "border-border bg-surface-2 hover:border-brand/40"
                )}
              >
                <div
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    active ? "bg-brand text-white" : "bg-surface text-brand"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-text">{a.label}</p>
                  <p className="text-[0.65rem] text-text-soft">{a.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[0.65rem] text-muted">
          {audience === "active" && `${presentNow} pessoas com check-in ativo`}
          {audience === "recent" && "Estimativa: 50-200 frequentadores"}
          {audience === "both" && `${presentNow}+ pessoas, podendo chegar a 200+`}
        </p>
      </section>

      {/* Mensagem */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">Mensagem</h2>
          <span className="text-[0.65rem] text-muted">{message.length}/140</span>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 140))}
          rows={4}
          placeholder="Banda começa em 30 minutos!"
          className="w-full resize-none rounded-xl border border-border bg-surface-2 p-3 text-sm outline-none placeholder:text-muted focus:border-brand/60"
        />

        <div className="mt-3">
          <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
            Templates rápidos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t}
                onClick={() => setMessage(t)}
                className="rounded-pill border border-border bg-surface-2 px-2.5 py-1 text-[0.65rem] text-text-soft hover:text-text"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          {result ? (
            <p
              className={cn(
                "flex items-center gap-2 text-xs font-bold",
                result.ok ? "text-success" : "text-brand"
              )}
            >
              <CheckCircle2 className="size-4" />
              {result.ok ? `✓ Enviado pra ${result.sent} pessoas` : "Falha ao enviar"}
            </p>
          ) : (
            <p className="text-[0.65rem] text-muted">
              Preview: <strong className="text-text">{estabName} avisou</strong>
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSend}
            disabled={sending || message.trim().length < 3}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold uppercase tracking-wider transition-all",
              message.trim().length >= 3 && !sending
                ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                : "bg-surface-2 text-muted"
            )}
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {sending ? "Enviando..." : "Disparar"}
          </motion.button>
        </div>
      </section>

      <p className="text-center text-[0.65rem] text-muted">
        Avisos chegam como notificação in-app + push (se o usuário liberou) · evite spam, máx 3/dia
      </p>
    </div>
  );
}
