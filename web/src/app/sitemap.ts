import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://imhere.app";
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/cadastro`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Tenta puxar slugs de estabs públicos
  try {
    const { supabaseServer } = await import("@/lib/supabase/server");
    const sb = await supabaseServer();
    const { data } = await sb.from("establishments").select("slug, updated_at").limit(1000);
    const estabUrls: MetadataRoute.Sitemap = ((data ?? []) as Array<{ slug: string | null; updated_at: string | null }>)
      .filter((e) => e.slug)
      .map((e) => ({
        url: `${base}/cardapio/${e.slug}`,
        lastModified: e.updated_at ? new Date(e.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    return [...staticUrls, ...estabUrls];
  } catch {
    return staticUrls;
  }
}
