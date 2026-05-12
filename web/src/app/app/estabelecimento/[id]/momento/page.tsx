"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Eye, Instagram, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { establishments, momentoByEstablishment } from "@/data/establishments";

const DURATION = 6000;

export default function MomentoViewerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const place = establishments.find((e) => e.id === params?.id);
  const moments = momentoByEstablishment[params?.id ?? ""] ?? [];

  if (!place || moments.length === 0) notFound();

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    setProgress(0);
    const t = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / DURATION);
      setProgress(p);
      if (p >= 1) {
        clearInterval(t);
        if (index < moments.length - 1) setIndex(index + 1);
        else router.back();
      }
    }, 50);
    return () => clearInterval(t);
  }, [index, moments.length, router]);

  const current = moments[index];

  function prev() {
    if (index > 0) setIndex(index - 1);
  }
  function next() {
    if (index < moments.length - 1) setIndex(index + 1);
    else router.back();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-3 md:p-6">
      <div className="relative h-full w-full max-w-md overflow-hidden rounded-3xl">
        <Image
          key={current.id}
          src={current.imageUrl}
          alt=""
          fill
          priority
          sizes="600px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

        <div className="absolute inset-x-3 top-3 flex gap-1">
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

        <header className="absolute inset-x-3 top-6 flex items-center gap-3 pt-2">
          <div className="story-ring rounded-full">
            <div className="relative size-10 overflow-hidden rounded-full bg-bg">
              <Image src={place.cover} alt={place.name} fill sizes="40px" className="object-cover" />
            </div>
          </div>
          <div className="flex-1 leading-tight">
            <p className="text-sm font-bold text-white drop-shadow">{place.name}</p>
            <p className="flex items-center gap-1.5 text-[0.65rem] text-white/80">
              <Clock className="size-3" />
              {current.postedAt} · {place.city}/{place.state}
            </p>
          </div>
          {place.instagram && (
            <a
              href={`https://instagram.com/${place.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md"
            >
              <Instagram className="size-4" />
            </a>
          )}
          <button
            onClick={() => router.back()}
            className="grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md"
          >
            <X className="size-4" />
          </button>
        </header>

        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute inset-y-0 left-0 w-1/3"
        >
          {index > 0 && (
            <span className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-md group-hover:opacity-100">
              <ChevronLeft className="size-4" />
            </span>
          )}
        </button>
        <button onClick={next} aria-label="Próximo" className="absolute inset-y-0 right-0 w-2/3">
          <span className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-md group-hover:opacity-100">
            <ChevronRight className="size-4" />
          </span>
        </button>

        <div className="absolute inset-x-4 bottom-6 flex flex-col gap-3 text-center">
          {current.caption && (
            <p className="text-base font-bold text-white drop-shadow">{current.caption}</p>
          )}
          <div className="flex items-center justify-center gap-3 text-[0.7rem] text-white/85">
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {current.views} visualizações
            </span>
            <span>·</span>
            <span>Expira em {Math.floor(current.expiresInMin / 60)}h {current.expiresInMin % 60}m</span>
          </div>
          <Link
            href={`/app/estabelecimento/${place.id}`}
            className="mx-auto mt-1 inline-flex items-center gap-2 rounded-pill bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-md"
          >
            Ver estabelecimento
          </Link>
        </div>
      </div>
    </div>
  );
}
