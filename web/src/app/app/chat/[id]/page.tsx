"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, MoreVertical, Phone, ShieldCheck, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { conversations, messagesByConversation, Message } from "@/data/conversations";
import { establishments } from "@/data/establishments";
import { users } from "@/data/users";

const ME = "u-me";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const conv = conversations.find((c) => c.id === id);
  if (!conv) notFound();

  const other = users.find((u) => conv.participantIds.includes(u.id) && u.id !== ME);
  const place = establishments.find((e) => e.id === conv.establishmentId);

  const [messages, setMessages] = useState<Message[]>(messagesByConversation[conv.id] ?? []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function send(text: string) {
    const newMsg: Message = {
      id: `tmp-${Date.now()}`,
      conversationId: conv.id,
      senderId: ME,
      type: "text",
      body: text,
      createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "delivered" } : m))
      );
    }, 700);

    setTimeout(() => {
      const reply: Message = {
        id: `r-${Date.now()}`,
        conversationId: conv.id,
        senderId: other?.id ?? "",
        type: "text",
        body: "Boa! Estou indo aí, te encontro perto do bar 🍻",
        createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };
      setMessages((prev) => [...prev, reply]);
    }, 2400);
  }

  if (!other) return null;

  return (
    <div className="mx-auto flex h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-3xl flex-col md:h-[calc(100dvh-3rem)]">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="grid size-9 place-items-center rounded-full text-text transition-colors hover:bg-white/[0.04]"
        >
          <ArrowLeft className="size-5" />
        </button>

        <Link
          href={`/app/usuario/${other.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1 py-1 transition-colors hover:bg-white/[0.04]"
        >
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
            <Image src={other.photo} alt={other.name} fill sizes="40px" className="object-cover" />
            <span className="absolute -bottom-0 -right-0 size-3 rounded-full bg-success ring-2 ring-bg" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold text-text">{other.name}</p>
            <p className="flex items-center gap-1 truncate text-[0.7rem] text-success">
              <span className="size-1.5 rounded-full bg-success live-dot" />
              online · {other.profession}
            </p>
          </div>
        </Link>

        <button className="grid size-9 place-items-center rounded-full text-text-soft transition-colors hover:bg-white/[0.04]">
          <Phone className="size-4" />
        </button>
        <button className="grid size-9 place-items-center rounded-full text-text-soft transition-colors hover:bg-white/[0.04]">
          <Video className="size-4" />
        </button>
        <button className="grid size-9 place-items-center rounded-full text-text-soft transition-colors hover:bg-white/[0.04]">
          <MoreVertical className="size-4" />
        </button>
      </header>

      {place && (
        <Link
          href={`/app/estabelecimento/${place.id}`}
          className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs"
        >
          <div className="grid size-7 place-items-center rounded-lg bg-brand/15 text-brand">
            <MapPin className="size-3.5" />
          </div>
          <div className="flex flex-1 flex-col leading-tight">
            <span className="text-text font-bold">Conheceram-se em {place.name}</span>
            <span className="text-muted">{place.city}/{place.state}</span>
          </div>
          <ShieldCheck className="size-4 text-success" />
        </Link>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex justify-center"
        >
          <span className="rounded-pill bg-surface-2 px-3 py-1 text-[0.65rem] font-semibold text-muted">
            Conversa iniciada às {conv.startedAt}
          </span>
        </motion.div>

        <div className="flex flex-col gap-2">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} fromMe={m.senderId === ME} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-bg/95 px-3 py-3 backdrop-blur-md">
        <MessageInput onSend={send} />
        <p className="mt-2 px-1 text-center text-[0.65rem] text-muted">
          🛡️ Mensagens são moderadas automaticamente. Respeite os outros usuários.
        </p>
      </div>
    </div>
  );
}
