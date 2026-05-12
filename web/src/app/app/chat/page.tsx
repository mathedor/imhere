"use client";

import { motion } from "framer-motion";
import { Camera, Check, CheckCheck, Image as ImageIcon, MapPin, Mic, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { conversations } from "@/data/conversations";
import { establishments } from "@/data/establishments";
import { users } from "@/data/users";

export default function ChatListPage() {
  const [q, setQ] = useState("");

  const list = conversations
    .map((c) => {
      const other = users.find((u) => c.participantIds.includes(u.id) && u.id !== "u-me");
      const place = establishments.find((e) => e.id === c.establishmentId);
      return { conv: c, user: other, place };
    })
    .filter(({ user }) => !q || user?.name.toLowerCase().includes(q.toLowerCase()));

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

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
        {list.map(({ conv, user, place }, i) => {
          if (!user) return null;
          const m = conv.lastMessage;
          const fromMe = m.senderId === "u-me";
          return (
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
                  <div className="relative size-14 overflow-hidden rounded-2xl">
                    <Image src={user.photo} alt={user.name} fill sizes="56px" className="object-cover" />
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-brand text-[0.65rem] font-bold text-white ring-2 ring-bg">
                      {conv.unread}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-text">{user.name}</p>
                    <span className="shrink-0 text-[0.7rem] text-muted">{m.createdAt}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {fromMe && (
                      m.status === "read" ? (
                        <CheckCheck className="size-3.5 text-brand" />
                      ) : m.status === "delivered" ? (
                        <CheckCheck className="size-3.5 text-muted" />
                      ) : (
                        <Check className="size-3.5 text-muted" />
                      )
                    )}
                    {m.type === "image" && <ImageIcon className="size-3.5 text-muted" />}
                    {m.type === "audio" && <Mic className="size-3.5 text-muted" />}
                    <p className="truncate text-xs text-text-soft">{m.body}</p>
                  </div>
                  {place && (
                    <p className="mt-1 flex items-center gap-1 truncate text-[0.65rem] text-muted">
                      <MapPin className="size-3" />
                      conheceram-se em {place.name}
                    </p>
                  )}
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface/40 p-4 text-center">
        <Camera className="mx-auto mb-2 size-6 text-muted" />
        <p className="text-xs text-text-soft">
          Você só pode iniciar conversas com pessoas no <span className="font-bold text-text">mesmo estabelecimento</span> em que fez check-in.
        </p>
      </div>
    </div>
  );
}
