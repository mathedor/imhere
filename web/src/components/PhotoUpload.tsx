"use client";

import { motion } from "framer-motion";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { type StorageBucket, uploadFile } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface Props {
  bucket: StorageBucket;
  defaultUrl?: string;
  shape?: "circle" | "square" | "wide";
  onUpload?: (url: string) => void;
  className?: string;
  label?: string;
}

export function PhotoUpload({
  bucket,
  defaultUrl,
  shape = "square",
  onUpload,
  className,
  label = "Adicionar foto",
}: Props) {
  const [url, setUrl] = useState<string | null>(defaultUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const newUrl = await uploadFile(bucket, file);
    if (newUrl) {
      setUrl(newUrl);
      onUpload?.(newUrl);
    }
    setUploading(false);
  }

  const aspectClass =
    shape === "circle"
      ? "size-32 rounded-full"
      : shape === "wide"
      ? "aspect-[16/9] w-full rounded-2xl"
      : "aspect-square w-full rounded-2xl";

  return (
    <div className={cn("relative", aspectClass, className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {url ? (
        <>
          <Image src={url} alt="" fill sizes="200px" className={cn("object-cover", aspectClass)} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-pill bg-black/70 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white backdrop-blur disabled:opacity-50"
          >
            {uploading ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3" />}
            Trocar
          </motion.button>
        </>
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-border bg-surface-2 text-muted transition-colors hover:border-brand/60 hover:text-brand",
            aspectClass
          )}
        >
          {uploading ? <Loader2 className="size-6 animate-spin" /> : <Camera className="size-6" />}
          <span className="text-xs font-bold">{uploading ? "Enviando..." : label}</span>
        </motion.button>
      )}
    </div>
  );
}
