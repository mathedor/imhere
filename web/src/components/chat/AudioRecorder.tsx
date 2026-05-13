"use client";

import { motion } from "framer-motion";
import { Mic, Send, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  conversationId: string;
  onSend: (url: string, durationSec: number) => Promise<void>;
  onCancel: () => void;
}

export function AudioRecorder({ conversationId, onSend, onCancel }: Props) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-inicia gravação ao abrir
    start();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      mediaRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: "audio/webm" });
        setBlob(b);
        setBlobUrl(URL.createObjectURL(b));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch (err) {
      console.error("[mic]", err);
      alert("Não foi possível acessar o microfone. Libere a permissão e tente novamente.");
      onCancel();
    }
  }

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function send() {
    if (!blob) return;
    setUploading(true);
    try {
      const sb = supabase();
      const filename = `${conversationId}/${Date.now()}.webm`;
      const { error } = await sb.storage.from("chat-media").upload(filename, blob, {
        contentType: "audio/webm",
        upsert: false,
      });
      if (error) throw error;
      const { data } = sb.storage.from("chat-media").getPublicUrl(filename);
      await onSend(data.publicUrl, elapsed);
    } catch (err) {
      console.error("[upload audio]", err);
      alert("Falha ao enviar. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  function discard() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlob(null);
    setBlobUrl(null);
    onCancel();
  }

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2"
    >
      <button
        onClick={discard}
        disabled={uploading}
        className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-brand disabled:opacity-50"
        title="Descartar"
      >
        <Trash2 className="size-4" />
      </button>

      <div className="flex flex-1 items-center gap-2 rounded-pill bg-surface-2 px-3 py-2">
        {recording ? (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="size-2 rounded-full bg-brand"
          />
        ) : (
          <span className="size-2 rounded-full bg-muted" />
        )}
        <span className="font-mono text-sm font-bold text-text">{timeStr}</span>
        {blobUrl && !recording && (
          <audio src={blobUrl} controls className="ml-auto h-7 w-full max-w-[140px]" />
        )}
      </div>

      {recording ? (
        <button
          onClick={stop}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white"
          title="Parar"
        >
          <Square className="size-4 fill-current" />
        </button>
      ) : (
        <button
          onClick={send}
          disabled={!blob || uploading}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl transition-all",
            blob && !uploading
              ? "bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow"
              : "bg-surface-2 text-muted"
          )}
          title="Enviar"
        >
          {uploading ? (
            <Mic className="size-4 animate-pulse" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      )}
    </motion.div>
  );
}
