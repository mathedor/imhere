"use client";

import { supabase } from "@/lib/supabase/client";
import { isMockMode } from "@/lib/supabase/config";

export type StorageBucket = "avatars" | "establishment-covers" | "establishment-gallery" | "moments" | "user-gallery" | "chat-media";

/**
 * Upload de arquivo para o Supabase Storage.
 * Retorna a URL pública.
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  path?: string
): Promise<string | null> {
  if (isMockMode()) {
    // Em mock mode, retorna data URL temporária
    return URL.createObjectURL(file);
  }

  const sb = supabase();
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = path ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const { error } = await sb.storage.from(bucket).upload(filename, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) {
    console.error("upload failed", error);
    return null;
  }

  const { data } = sb.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Remove arquivo do Storage.
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  if (isMockMode()) return;
  const sb = supabase();
  await sb.storage.from(bucket).remove([path]);
}
