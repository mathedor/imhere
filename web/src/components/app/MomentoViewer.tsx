"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Clock, Eye, Instagram, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { recordMomentView } from "@/lib/db/moments";

const DURATION_MS = 6000;

interface MomentRow {
  id: string;
  imageUrl: string;
  caption: string | null;
  viewsCount: number;
  postedAt: string;
  expiresAt: string;
}

interface Props {
  moments: MomentRow[];
  establishment: {
    id: string;
    name: string;
    city: string;
    state: string;
    coverUrl: string;
    instagram: string | null;
  };
}

function fmtPostedAt(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin} min atrás`;
  const h = Math.floor(diffMin / 60);
  return `${h}h atrás`;
}

function fmtRemaining(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const totalMin = Math.max(0, Math.floor(diffMs / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function MomentoViewer({ moments, establishment }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewedRef = useRef<Set<string>>(new Set());

  // Registra view ao trocar de slide (fire-and-forget)
  useEffect(() => {
    const current = moments[index];
    if (!current) return;
    if (viewedRef.current.has(current.id)) return;
    viewedRef.current.add(current.id);
    recordMomentView(current.id).catch(() => {});
  }, [index, moments]);

  // Progresso do slide atual
  useEffect(() => {
    if (paused) return;
    const start = Date.now();
    setProgress(0);
    const t = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(t);
        if (index < moments.length - 1) setIndex(index + 1);
        else router.back();
      }
    }, 50);
    return () => clearInterval(t);
  }, [index, moments.length, router, paused]);

  function prev() {
    if (index > 0) setIndex(index - 1);
  }
  function next() {
    if (index < moments.length - 1) setIndex(index + 1);
    else router.back();
  }

  const current = moments[index];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-3 md:p-6">
      <div
        className="group relative h-full w-full max-w-md overflow-hidden rounded-3xl select-none"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        <Image
          key={current.id}
          src={current.imageUrl}
          alt=""
          fill
          priority
          sizes="600px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

        {/* Barras de progresso */}
        <div className="absolute inset-x-3 top-3 flex gap-1 pointer-events-none">
          {moments.map((_, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <motion.div
                className="h-full bg-white"
                style={{
                  width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="absolute inset-x-3 top-6 flex items-center gap-3 pt-2 pointer-events-none">
          <div className="story-ring rounded-full">
            <div className="relative size-10 overflow-hidden rounded-full bg-bg">
              <Image
                src={establishment.coverUrl}
                alt={establishment.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 leading-tight">
            <p className="text-sm font-bold text-white drop-shadow">{establishment.name}</p>
            <p className="flex items-center gap-1.5 text-[0.65rem] text-white/80">
              <Clock className="size-3" />
              {fmtPostedAt(current.postedAt)} · {establishment.city}/{establishment.state}
            </p>
          </div>
          {establishment.instagram && (
            <a
              href={`https://instagram.com/${establishment.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md pointer-events-auto"
            >
              <Instagram className="size-4" />
            </a>
          )}
          <button
            onClick={() => router.back()}
            className="grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md pointer-events-auto"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Tap zones */}
        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute inset-y-0 left-0 z-10 w-1/3"
        >
          {index > 0 && (
            <span className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-md group-hover:opacity-80">
              <ChevronLeft className="size-4" />
            </span>
          )}
        </button>
        <button
          onClick={next}
          aria-label="Próximo"
          className="absolute inset-y-0 right-0 z-10 w-2/3"
        />

        {/* Footer */}
        <div className="absolute inset-x-4 bottom-6 z-20 flex flex-col gap-3 text-center pointer-events-none">
          {current.caption && (
            <p className="text-base font-bold text-white drop-shadow">{current.caption}</p>
          )}
          <div className="flex items-center justify-center gap-3 text-[0.7rem] text-white/85">
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {current.viewsCount} views
            </span>
            <span>·</span>
            <span>Expira em {fmtRemaining(current.expiresAt)}</span>
          </div>
          <Link
            href={`/app/estabelecimento/${establishment.id}`}
            className="pointer-events-auto mx-auto mt-1 inline-flex items-center gap-2 rounded-pill bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25"
          >
            Ver estabelecimento
          </Link>
        </div>
      </div>
    </div>
  );
}
