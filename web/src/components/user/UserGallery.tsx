"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Props {
  photos: string[];
  name: string;
}

export function UserGallery({ photos, name }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
        {photos.map((p, i) => (
          <motion.button
            key={p + i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(i)}
            className="relative aspect-square overflow-hidden rounded-xl border border-border"
          >
            <Image
              src={p}
              alt={`${name} foto ${i + 1}`}
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-110"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-6"
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute right-5 top-5 grid size-11 place-items-center rounded-full glass-strong text-white"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>

            {open > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((v) => (v! > 0 ? v! - 1 : v));
                }}
                className="absolute left-5 grid size-11 place-items-center rounded-full glass-strong text-white"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}

            {open < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((v) => (v! < photos.length - 1 ? v! + 1 : v));
                }}
                className="absolute right-5 grid size-11 place-items-center rounded-full glass-strong text-white"
                aria-label="Próxima"
              >
                <ChevronRight className="size-5" />
              </button>
            )}

            <motion.div
              key={open}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[open]}
                alt={`${name} foto ${open + 1}`}
                width={1024}
                height={1024}
                className="h-auto w-full object-contain"
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md">
                {open + 1} / {photos.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
