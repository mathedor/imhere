"use client";

import { motion } from "framer-motion";
import { Camera, CheckCheck, Image as ImageIcon, MapPin, Mic, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface ConversationItem {
  id: string;
  otherName: string;
  otherPhoto: string | null;
  estabName: string | null;
  lastBody: string;
  lastType: string;
  lastFromMe: boolean;
  lastTime: string;
  unread: number;
}

export function ChatListClient({ items }: { items: ConversationItem[] }) {
  const [q, setQ] = useState("");
  const filtered = items.filter((i) => !q || i.otherName.toLowerCase().includes(q.toLowerCase()));
  const totalUnread = items.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-5">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text">Conversas</h1>
          <p className="mt-0.5 text-sm text-text-soft">
            {totalUnread > 0 ? `${totalUnread} nova${totalUnread > 1 ? "s" : ""} mensagem${totalUnread > 1 ? "s" : ""}` : "Tudo em dia"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-pill bg-success/15 px-3 py-1.5 text-[0.7rem] font-bold text-success">
          <span className="size-1.5 rounded-full bg-success live-dot" />
          Online
        </div>
      </header>

      <div className="mb-4 flex h-12 items-center gap-3 rounded-pill border border-border bg-surface px-4">
        <Search className="size-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar conversa..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <ul className="flex flex-col gap-1.5">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-surface/40 py-12 text-center">
            <Camera className="mx-auto mb-2 size-7 text-muted" />
            <p className="text-sm font-bold text-text">
              {q ? "Nenhuma conversa com esse nome" : "Sem conversas ainda"}
            </p>
            <p className="mt-1 text-xs text-text-soft">
              {q ? "Tente outro termo" : "Faça check-in e descubra quem está perto pra iniciar uma conversa"}
            </p>
          </li>
        )}

        {filtered.map((conv, i) => (
          <motion.li
            key={conv.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/app/chat/${conv.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-transparent bg-surface px-3 py-3 transition-all hover:border-brand/40 hover:bg-surface-2"
            >
              <div className="relative shrink-0">
                <div className="relative size-14 overflow-hidden rounded-2xl bg-surface-2">
                  {conv.otherPhoto && (
                    <Image src={conv.otherPhoto} alt={conv.otherName} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                {conv.unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-brand text-[0.65rem] font-bold text-white ring-2 ring-bg">
                    {conv.unread}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-text">{conv.otherName}</p>
                  <span className="shrink-0 text-[0.7rem] text-muted">{conv.lastTime}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {conv.lastFromMe && <CheckCheck className="size-3.5 text-brand" />}
                  {conv.lastType === "image" && <ImageIcon className="size-3.5 text-muted" />}
                  {conv.lastType === "audio" && <Mic className="size-3.5 text-muted" />}
                  <p className="truncate text-xs text-text-soft">{conv.lastBody}</p>
                </div>
                {conv.estabName && (
                  <p className="mt-1 flex items-center gap-1 truncate text-[0.65rem] text-muted">
                    <MapPin className="size-3" />
                    conheceram-se em {conv.estabName}
                  </p>
                )}
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface/40 p-4 text-center">
        <Camera className="mx-auto mb-2 size-6 text-muted" />
        <p className="text-xs text-text-soft">
          Você só pode iniciar conversas com pessoas no <strong className="text-text">mesmo estabelecimento</strong> em que fez check-in.
        </p>
      </div>
    </div>
  );
}
