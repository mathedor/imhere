"use client";

import { motion } from "framer-motion";
import { Camera, Clock, Eye, ImagePlus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { establishments, momentoByEstablishment, MomentoPost } from "@/data/establishments";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

const MY_PLACE = establishments[0];

export default function MomentoPage() {
  const [posts, setPosts] = useState<MomentoPost[]>(
    momentoByEstablishment[MY_PLACE.id] ?? []
  );
  const [showNew, setShowNew] = useState(false);

  function addPost(imageUrl: string, caption: string) {
    setPosts([
      ...posts,
      {
        id: `mt-${Date.now()}`,
        establishmentId: MY_PLACE.id,
        imageUrl,
        caption,
        postedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        expiresInMin: 240,
        views: 0,
      },
    ]);
    setShowNew(false);
  }

  return (
    <PanelLayout
      scope="estabelecimento"
      title="No Momento"
      subtitle="Stories ao vivo do seu estabelecimento · expira em 4h"
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Carla Pires", role: "Gerente" }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand live-dot" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            {posts.length} story{posts.length !== 1 ? "s" : ""} ativo{posts.length !== 1 ? "s" : ""}
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
        {posts.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-surface"
          >
            <div className="relative aspect-[9/14] w-full overflow-hidden">
              <Image src={p.imageUrl} alt="" fill sizes="400px" className="object-cover" />
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-strong to-brand-soft" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />

              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-pill bg-black/60 px-2 py-1 text-[0.65rem] font-bold text-white backdrop-blur-md">
                <Clock className="size-3" />
                {Math.floor(p.expiresInMin / 60)}h {p.expiresInMin % 60}m
              </div>

              <button
                onClick={() => setPosts(posts.filter((x) => x.id !== p.id))}
                className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity backdrop-blur-md group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>

              <div className="absolute inset-x-3 bottom-3">
                {p.caption && (
                  <p className="mb-2 text-sm font-bold text-white drop-shadow">{p.caption}</p>
                )}
                <div className="flex items-center gap-3 text-[0.7rem] text-white/85">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3" />
                    {p.views} views
                  </span>
                  <span>postado às {p.postedAt}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

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

      {showNew && <NewPostDrawer onClose={() => setShowNew(false)} onPost={addPost} />}

      <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-bold text-text">Como funciona</h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 text-xs text-text-soft md:grid-cols-3">
          <li className="flex items-start gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand text-[0.7rem] font-bold">
              1
            </span>
            Posts duram 4h e somem automaticamente — só clima atual do estabelecimento.
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
            Notifica push pra quem segue / está perto do estabelecimento.
          </li>
        </ul>
      </section>
    </PanelLayout>
  );
}

function NewPostDrawer({
  onClose,
  onPost,
}: {
  onClose: () => void;
  onPost: (imageUrl: string, caption: string) => void;
}) {
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const samples = [
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80",
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=600&q=80",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <header className="border-b border-border p-4">
          <h3 className="text-base font-black text-text">Novo No Momento</h3>
          <p className="text-xs text-text-soft">Escolha uma foto e adicione uma legenda</p>
        </header>

        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted hover:border-brand/60 hover:text-brand">
            <ImagePlus className="size-5" />
            <span className="text-[0.6rem] font-bold uppercase tracking-wider">Galeria</span>
          </label>
          {samples.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreview(s)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                preview === s ? "border-brand shadow-glow" : "border-border hover:border-brand/40"
              }`}
            >
              <Image src={s} alt="" fill sizes="120px" className="object-cover" />
            </motion.button>
          ))}
        </div>

        <div className="border-t border-border p-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Adicionar legenda... (opcional)"
            rows={2}
            maxLength={140}
            className="w-full resize-none rounded-xl border border-border bg-surface-2 p-3 text-sm outline-none placeholder:text-muted focus:border-brand/60"
          />
          <p className="mt-1 text-right text-[0.65rem] text-muted">{caption.length}/140</p>
        </div>

        <div className="flex items-center gap-2 border-t border-border p-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-text-soft hover:text-text">
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!preview}
            onClick={() => preview && onPost(preview, caption)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider transition-all ${
              preview
                ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                : "bg-surface-2 text-muted"
            }`}
          >
            <Camera className="size-4" />
            Publicar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
