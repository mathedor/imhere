"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck, Play } from "lucide-react";
import Image from "next/image";
import { Message } from "@/data/conversations";
import { cn } from "@/lib/utils";

export function MessageBubble({ message, fromMe }: { message: Message; fromMe: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.2, 0, 0.2, 1] }}
      className={cn("flex w-full", fromMe ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "relative max-w-[78%] rounded-2xl px-3.5 py-2.5",
          fromMe
            ? "rounded-br-md bg-gradient-to-br from-brand-strong to-brand text-white"
            : "rounded-bl-md bg-surface-2 text-text"
        )}
      >
        {message.type === "text" && (
          <p className="whitespace-pre-wrap text-sm leading-snug">{message.body}</p>
        )}

        {message.type === "image" && message.imageUrl && (
          <div className="-m-1.5 mb-1.5 overflow-hidden rounded-xl">
            <Image
              src={message.imageUrl}
              alt="imagem"
              width={400}
              height={300}
              className="h-auto w-full max-w-[280px] object-cover"
            />
          </div>
        )}

        {message.type === "audio" && (
          <div className="flex items-center gap-2.5 py-1 pr-1">
            <button
              className={cn(
                "grid size-9 place-items-center rounded-full",
                fromMe ? "bg-white/20" : "bg-brand text-white"
              )}
            >
              <Play className="size-4 fill-current" />
            </button>
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-0.5">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-0.5 rounded-full",
                      fromMe ? "bg-white/70" : "bg-brand/60"
                    )}
                    style={{ height: `${6 + Math.sin(i * 0.7) * 8 + Math.random() * 6}px` }}
                  />
                ))}
              </div>
              <span className={cn("text-[0.7rem]", fromMe ? "text-white/80" : "text-muted")}>
                0:{String(message.audioDurationSec ?? 14).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {message.type === "link" && message.linkPreview && (
          <a
            href={message.linkPreview.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg bg-black/15 p-2 text-xs underline"
          >
            {message.linkPreview.title}
          </a>
        )}

        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[0.65rem]",
            fromMe ? "text-white/75" : "text-muted"
          )}
        >
          <span>{message.createdAt}</span>
          {fromMe &&
            (message.status === "read" ? (
              <CheckCheck className="size-3 text-white" />
            ) : message.status === "delivered" ? (
              <CheckCheck className="size-3" />
            ) : (
              <Check className="size-3" />
            ))}
        </div>
      </div>
    </motion.div>
  );
}
