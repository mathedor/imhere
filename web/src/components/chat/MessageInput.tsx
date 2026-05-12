"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ImagePlus, Mic, Send, Smile, X } from "lucide-react";
import { useState } from "react";
import { CreditConfirmDialog } from "@/components/CreditConfirmDialog";
import { spendCreditsAction } from "@/lib/actions/credits";
import { moderate } from "@/lib/moderation";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (text: string) => void;
  onSendMedia?: (kind: "image" | "audio", url: string) => void;
  /** Saldo do usuário (passado pelo ChatClient) */
  balance?: number;
  /** Se for premium não precisa gastar créditos */
  isPremiumMedia?: boolean;
}

const PHOTO_COST = 10;
const AUDIO_COST = 15;

export function MessageInput({ onSend, balance = 0, isPremiumMedia = false }: Props) {
  const [value, setValue] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  const [pendingFeature, setPendingFeature] = useState<"photo" | "audio" | null>(null);
  const [currentBalance, setCurrentBalance] = useState(balance);

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

  function startPhoto() {
    if (isPremiumMedia) {
      // Premium: vai direto pra galeria (futuro: open file picker)
      alert("Premium: enviando foto (mock)");
      return;
    }
    setPendingFeature("photo");
  }

  function startAudio() {
    if (isPremiumMedia) {
      alert("Premium: gravando áudio (mock)");
      return;
    }
    setPendingFeature("audio");
  }

  async function confirmSpend() {
    if (!pendingFeature) return;
    const code = pendingFeature === "photo" ? "chat:send_photo" : "chat:send_audio";
    const result = await spendCreditsAction(code);
    if (result.success) {
      setCurrentBalance(result.newBalance);
      alert(`✓ ${result.message} (saldo: ${result.newBalance})`);
      // TODO: abrir picker de foto/recorder real e enviar
    } else {
      alert(result.message);
    }
  }

  const cost = pendingFeature === "photo" ? PHOTO_COST : AUDIO_COST;
  const label = pendingFeature === "photo" ? "Enviar foto no chat" : "Enviar áudio no chat";

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
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={startPhoto}
          className="relative grid size-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-text"
          title={isPremiumMedia ? "Adicionar foto" : `Adicionar foto (${PHOTO_COST} créditos)`}
        >
          <ImagePlus className="size-5" />
          {!isPremiumMedia && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-warn px-1 text-[0.55rem] font-bold text-white ring-2 ring-surface">
              {PHOTO_COST}
            </span>
          )}
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
          className="flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-text outline-none placeholder:text-muted max-h-32"
        />

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          <Smile className="size-5" />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          whileHover={{ y: -1 }}
          onClick={value.trim() ? handleSend : startAudio}
          className={cn(
            "relative grid size-10 shrink-0 place-items-center rounded-xl transition-all",
            value.trim()
              ? "bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow"
              : "bg-surface-2 text-text-soft hover:text-text"
          )}
          title={
            value.trim()
              ? "Enviar"
              : isPremiumMedia
              ? "Gravar áudio"
              : `Gravar áudio (${AUDIO_COST} créditos)`
          }
        >
          {value.trim() ? <Send className="size-4" /> : <Mic className="size-5" />}
          {!value.trim() && !isPremiumMedia && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-warn px-1 text-[0.55rem] font-bold text-white ring-2 ring-surface">
              {AUDIO_COST}
            </span>
          )}
        </motion.button>
      </div>

      <CreditConfirmDialog
        open={!!pendingFeature}
        onClose={() => setPendingFeature(null)}
        cost={cost}
        balance={currentBalance}
        featureLabel={label}
        onConfirm={confirmSpend}
      />
    </div>
  );
}
