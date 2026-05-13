"use client";

import { motion } from "framer-motion";
import { ImageIcon, Send, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Props {
  conversationId: string;
  onSend: (url: string) => Promise<void>;
  onCancel: () => void;
}

export function PhotoSender({ conversationId, onSend, onCancel }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Selecione uma imagem");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert("Imagem muito grande (máx 10MB)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function send() {
    if (!file) return;
    setUploading(true);
    try {
      const sb = supabase();
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${conversationId}/${Date.now()}.${ext}`;
      const { error } = await sb.storage.from("chat-media").upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = sb.storage.from("chat-media").getPublicUrl(filename);
      await onSend(data.publicUrl);
    } catch (err) {
      console.error("[upload photo]", err);
      alert("Falha ao enviar. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  function cancel() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    onCancel();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-2"
    >
      {!preview ? (
        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface-2 px-4 py-6 transition-colors hover:border-brand/40">
          <ImageIcon className="size-6 text-brand" />
          <div className="leading-tight">
            <p className="text-sm font-bold text-text">Toque pra escolher foto</p>
            <p className="text-[0.65rem] text-text-soft">ou tirar com a câmera</p>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={cancel}
            disabled={uploading}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-brand disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
          <div className="relative size-12 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="size-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-bold text-text">{file?.name ?? "foto.jpg"}</p>
            <p className="text-[0.6rem] text-text-soft">
              {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
            </p>
          </div>
          <button
            onClick={send}
            disabled={uploading}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
