"use client";

import { ArrowLeft, MapPin, MoreVertical, Phone, ShieldCheck, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { sendMessageAction } from "@/lib/actions/chat";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import type { Message } from "@/lib/db/types";

interface Props {
  conversationId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    name: string;
    photo: string | null;
    profession: string | null;
  };
  establishment: { id: string; name: string; city: string; state: string } | null;
  initialMessages: Message[];
  startedAt?: string;
}

export function ChatClient({
  conversationId,
  currentUserId,
  otherUser,
  establishment,
  initialMessages,
  startedAt = "agora",
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useRealtimeMessages(conversationId, initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(text: string) {
    // Otimismo: adiciona localmente; o trigger + realtime vão sincronizar
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      type: "text",
      body: text,
      media_url: null,
      audio_duration_sec: null,
      link_url: null,
      link_title: null,
      status: "sent",
      blocked_reason: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const fd = new FormData();
    fd.append("conversationId", conversationId);
    fd.append("body", text);
    await sendMessageAction(fd);
  }

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
          href={`/app/usuario/${otherUser.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1 py-1 transition-colors hover:bg-white/[0.04]"
        >
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-surface-2">
            {otherUser.photo && (
              <Image src={otherUser.photo} alt={otherUser.name} fill sizes="40px" className="object-cover" />
            )}
            <span className="absolute -bottom-0 -right-0 size-3 rounded-full bg-success ring-2 ring-bg" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold text-text">{otherUser.name}</p>
            <p className="flex items-center gap-1 truncate text-[0.7rem] text-success">
              <span className="size-1.5 rounded-full bg-success live-dot" />
              online{otherUser.profession ? ` · ${otherUser.profession}` : ""}
            </p>
          </div>
        </Link>

        <button className="grid size-9 place-items-center rounded-full text-text-soft hover:bg-white/[0.04]">
          <Phone className="size-4" />
        </button>
        <button className="grid size-9 place-items-center rounded-full text-text-soft hover:bg-white/[0.04]">
          <Video className="size-4" />
        </button>
        <button className="grid size-9 place-items-center rounded-full text-text-soft hover:bg-white/[0.04]">
          <MoreVertical className="size-4" />
        </button>
      </header>

      {establishment && (
        <Link
          href={`/app/estabelecimento/${establishment.id}`}
          className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs"
        >
          <div className="grid size-7 place-items-center rounded-lg bg-brand/15 text-brand">
            <MapPin className="size-3.5" />
          </div>
          <div className="flex flex-1 flex-col leading-tight">
            <span className="text-text font-bold">Conheceram-se em {establishment.name}</span>
            <span className="text-muted">
              {establishment.city}/{establishment.state}
            </span>
          </div>
          <ShieldCheck className="size-4 text-success" />
        </Link>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex justify-center">
          <span className="rounded-pill bg-surface-2 px-3 py-1 text-[0.65rem] font-semibold text-muted">
            Conversa iniciada {startedAt}
          </span>
        </motion.div>

        {messages.length === 0 ? (
          <div className="mt-12 text-center text-xs text-muted">
            <p>Mande a primeira mensagem 👋</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={{
                  id: m.id,
                  conversationId: m.conversation_id,
                  senderId: m.sender_id,
                  type: m.type as "text" | "image" | "audio" | "link",
                  body: m.body ?? "",
                  imageUrl: m.media_url ?? undefined,
                  audioDurationSec: m.audio_duration_sec ?? undefined,
                  createdAt: new Date(m.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  status: m.status as "sent" | "delivered" | "read",
                }}
                fromMe={m.sender_id === currentUserId}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-bg/95 px-3 py-3 backdrop-blur-md">
        <MessageInput onSend={send} />
        <p className="mt-2 px-1 text-center text-[0.65rem] text-muted">
          🛡️ Mensagens são moderadas automaticamente · ⚡ Tempo real ativo
        </p>
      </div>
    </div>
  );
}
