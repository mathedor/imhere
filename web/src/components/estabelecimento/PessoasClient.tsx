"use client";

import { motion } from "framer-motion";
import { Gift, MessageCircle, Search, Send, Sparkles, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { sendCourtesyAction } from "@/lib/actions/establishment-owner";
import { cn } from "@/lib/utils";

interface PresentUser {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  status?: string;
  photo?: string;
  profession?: string;
  checkedInAt?: string;
}

const QUICK_GIFTS = [
  { id: "drink", label: "Drink cortesia", icon: "🍸", desc: "1 drink da casa" },
  { id: "discount", label: "10% off conta", icon: "💸", desc: "Aplicado automaticamente" },
  { id: "vip", label: "Mesa VIP", icon: "👑", desc: "Acesso à área reservada" },
  { id: "snack", label: "Petisco grátis", icon: "🍢", desc: "Cortesia da cozinha" },
];

export function PessoasClient({ present }: { present: PresentUser[] }) {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<PresentUser | null>(null);

  const filtered = present.filter(
    (u) => !filter || u.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 flex-1 items-center gap-3 rounded-pill border border-border bg-surface px-4">
          <Search className="size-4 text-muted" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar pessoa..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <span className="flex items-center gap-1.5 rounded-pill bg-success/15 px-3 py-1.5 text-[0.7rem] font-bold text-success">
          <span className="size-1.5 rounded-full bg-success live-dot" />
          Ao vivo · {present.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
          <User className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-text">
            {filter ? "Ninguém com esse nome aqui agora" : "Nenhum check-in ativo no momento"}
          </p>
          <p className="mt-1 text-xs text-text-soft">
            Quando alguém fizer check-in, aparece aqui em tempo real.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-brand/40"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
                {u.photo ? (
                  <Image src={u.photo} alt={u.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm font-bold text-muted">
                    {u.name.charAt(0)}
                  </div>
                )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-2 ring-surface"
                  style={{
                    background:
                      u.status === "open"
                        ? "#22c55e"
                        : u.status === "watching"
                        ? "#f59e0b"
                        : "#6b6b75",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-bold text-text">{u.name}</p>
                <p className="truncate text-[0.7rem] text-text-soft">
                  {u.age ? `${u.age} · ` : ""}{u.profession ?? ""}
                </p>
                {u.checkedInAt && <p className="mt-1 text-[0.65rem] text-muted">chegou {u.checkedInAt}</p>}
              </div>
              <Link
                href={`/estabelecimento/usuarios/${u.id}`}
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-text-soft hover:border-brand/40 hover:text-text"
                title="Ver perfil 360"
              >
                <User className="size-4" />
              </Link>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setOpen(u)}
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow"
                title="Enviar cortesia"
              >
                <Gift className="size-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {open && <ActionDrawer user={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function ActionDrawer({ user, onClose }: { user: PresentUser; onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
      >
        <header className="flex items-center gap-3 border-b border-border p-4">
          <div className="relative size-12 overflow-hidden rounded-2xl bg-surface-2">
            {user.photo && <Image src={user.photo} alt={user.name} fill sizes="48px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold text-text">{user.name}</p>
            <p className="truncate text-[0.7rem] text-text-soft">
              {user.checkedInAt ? `Chegou às ${user.checkedInAt}` : "No local"}
            </p>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:text-text">
            <X className="size-4" />
          </button>
        </header>

        <form
          action={sendCourtesyAction}
          onSubmit={() => {
            setLoading(true);
            setTimeout(onClose, 600);
          }}
          className="flex flex-col gap-4 p-4"
        >
          <input type="hidden" name="toProfileId" value={user.id} />
          <input type="hidden" name="kind" value={selected ?? ""} />
          <input
            type="hidden"
            name="title"
            value={QUICK_GIFTS.find((g) => g.id === selected)?.label ?? ""}
          />

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Enviar cortesia</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_GIFTS.map((g) => {
                const active = selected === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelected(g.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition-all",
                      active ? "border-brand bg-brand/10" : "border-border bg-surface-2 hover:border-brand/40"
                    )}
                  >
                    <span className="text-xl">{g.icon}</span>
                    <div className="leading-tight">
                      <p className="text-xs font-bold text-text">{g.label}</p>
                      <p className="text-[0.6rem] text-text-soft">{g.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Mensagem (opcional)</p>
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: passa lá no balcão pra retirar 😉"
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-surface-2 p-3 text-sm outline-none placeholder:text-muted focus:border-brand/60"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-brand/10 px-3 py-2 text-[0.65rem] text-brand">
            <Sparkles className="size-3.5 shrink-0" />
            Cortesias são notificadas instantaneamente — o user recebe push + notification.
          </div>

          <button
            type="submit"
            disabled={!selected || loading}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all",
              selected && !loading
                ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                : "bg-surface-2 text-muted"
            )}
          >
            {loading ? <Send className="size-4 animate-pulse" /> : <MessageCircle className="size-4" />}
            {loading ? "Enviando..." : `Enviar para ${user.name.split(" ")[0]}`}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
