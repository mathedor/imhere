"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ImagePlus, Mic, Send, Smile, X } from "lucide-react";
import { useState } from "react";
import { moderate } from "@/lib/moderation";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (text: string) => void;
}

export function MessageInput({ onSend }: Props) {
  const [value, setValue] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) return;
    const result = moderate(trimmed);
    if (!result.ok) {
      if (result.reason === "blocked") {
        setBlockedMsg(
          `Mensagem bloqueada: contém termo ofensivo ("${result.matched}"). Respeite os outros usuários.`
        );
        setTimeout(() => setBlockedMsg(null), 4200);
      } else {
        setWarning(`Termo sensível detectado ("${result.matched}"). Tem certeza?`);
        setTimeout(() => setWarning(null), 4000);
      }
      return;
    }
    onSend(trimmed);
    setValue("");
    setWarning(null);
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {blockedMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2 flex items-start gap-2 rounded-2xl border border-brand/40 bg-brand/10 px-3 py-2 text-xs text-brand"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p className="leading-snug">{blockedMsg}</p>
            <button onClick={() => setBlockedMsg(null)} className="ml-auto">
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
        {warning && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2 flex items-start gap-2 rounded-2xl border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p className="leading-snug">{warning}</p>
            <button onClick={() => setWarning(null)} className="ml-auto">
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-1.5 transition-colors focus-within:border-brand/40">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-white/[0.04] hover:text-text"
          title="Adicionar foto (Premium)"
        >
          <ImagePlus className="size-5" />
        </motion.button>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Mensagem..."
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted max-h-32"
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-white/[0.04] hover:text-text"
        >
          <Smile className="size-5" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ y: -1 }}
          onClick={handleSend}
          disabled={!value.trim()}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl transition-all",
            value.trim()
              ? "bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow"
              : "bg-surface-2 text-muted"
          )}
        >
          {value.trim() ? <Send className="size-4" /> : <Mic className="size-5" />}
        </motion.button>
      </div>
    </div>
  );
}
