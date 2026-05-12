"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, Clock, Eye, Plus, Send, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { deleteMomentAction, postMomentAction } from "@/lib/actions/establishment-owner";

export interface MomentItem {
  id: string;
  image_url: string;
  caption: string | null;
  views_count: number;
  posted_at: string;
  expires_at: string;
}

interface Props {
  moments: MomentItem[];
}

function timeUntilExpiry(expiresAt: string): { h: number; m: number } {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const totalMin = Math.max(0, Math.floor(diffMs / 60000));
  return { h: Math.floor(totalMin / 60), m: totalMin % 60 };
}

function fmtPostedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function MomentoEditor({ moments }: Props) {
  const [showNew, setShowNew] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand live-dot" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            {moments.length} story{moments.length !== 1 ? "s" : ""} ativo{moments.length !== 1 ? "s" : ""}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ y: -1 }}
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow"
        >
          <Plus className="size-4" />
          Postar agora
        </motion.button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {moments.map((m, i) => {
          const { h, mm } = (() => {
            const t = timeUntilExpiry(m.expires_at);
            return { h: t.h, mm: t.m };
          })();
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface"
            >
              <div className="relative aspect-[9/14] w-full overflow-hidden">
                <Image src={m.image_url} alt="" fill sizes="400px" className="object-cover" />
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-strong to-brand-soft" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />

                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-pill bg-black/60 px-2 py-1 text-[0.65rem] font-bold text-white backdrop-blur-md">
                  <Clock className="size-3" />
                  {h}h {mm}m
                </div>

                <form
                  action={deleteMomentAction}
                  className="absolute left-3 top-3"
                  onSubmit={(e) => {
                    if (!confirm("Excluir este story?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="grid size-9 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity backdrop-blur-md group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>

                <div className="absolute inset-x-3 bottom-3">
                  {m.caption && (
                    <p className="mb-2 text-sm font-bold text-white drop-shadow">{m.caption}</p>
                  )}
                  <div className="flex items-center gap-3 text-[0.7rem] text-white/85">
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {m.views_count} views
                    </span>
                    <span>postado às {fmtPostedAt(m.posted_at)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          onClick={() => setShowNew(true)}
          className="flex aspect-[9/14] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-surface/40 text-muted transition-colors hover:border-brand/60 hover:text-brand"
        >
          <div className="grid size-14 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Camera className="size-7" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">Novo No Momento</p>
            <p className="text-[0.7rem]">Mostre o clima agora</p>
          </div>
        </motion.button>
      </section>

      <AnimatePresence>{showNew && <NewPostDrawer onClose={() => setShowNew(false)} />}</AnimatePresence>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-bold text-text">Como funciona</h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 text-xs text-text-soft md:grid-cols-3">
          <li className="flex items-start gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand text-[0.7rem] font-bold">
              1
            </span>
            Posts duram 4h e somem automaticamente.
          </li>
          <li className="flex items-start gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand text-[0.7rem] font-bold">
              2
            </span>
            Seu logo no app dos usuários fica com borda animada quando há stories ativos.
          </li>
          <li className="flex items-start gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand text-[0.7rem] font-bold">
              3
            </span>
            Notifica push pra quem está perto.
          </li>
        </ul>
      </section>
    </>
  );
}

function NewPostDrawer({ onClose }: { onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-base font-black text-text">Novo No Momento</h3>
            <p className="text-xs text-text-soft">Foto + legenda · expira em 4h</p>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:text-text">
            <X className="size-4" />
          </button>
        </header>

        <form
          action={postMomentAction}
          onSubmit={() => {
            setLoading(true);
            setTimeout(onClose, 300);
          }}
          className="flex flex-col gap-4 p-4"
        >
          {imageUrl && <input type="hidden" name="imageUrl" value={imageUrl} />}

          <PhotoUpload
            bucket="moments"
            shape="wide"
            label="Adicionar foto"
            onUpload={(url) => setImageUrl(url)}
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            name="caption"
            placeholder="Adicionar legenda... (opcional)"
            rows={2}
            maxLength={140}
            className="w-full resize-none rounded-xl border border-border bg-surface-2 p-3 text-sm outline-none placeholder:text-muted focus:border-brand/60"
          />
          <p className="-mt-3 text-right text-[0.65rem] text-muted">{caption.length}/140</p>

          <button
            type="submit"
            disabled={!imageUrl || loading}
            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all ${
              imageUrl && !loading
                ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                : "bg-surface-2 text-muted"
            }`}
          >
            {loading ? <Send className="size-4 animate-pulse" /> : <Camera className="size-4" />}
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
