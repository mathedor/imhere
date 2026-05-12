import { notFound } from "next/navigation";
import { MomentoViewer } from "@/components/app/MomentoViewer";
import { getEstablishment, listMoments } from "@/lib/db/establishments";

export const dynamic = "force-dynamic";

export default async function MomentoViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getEstablishment(id);
  if (!place) notFound();

  const moments = await listMoments(place.id);
  // Filtra só os que ainda não expiraram (defensivo, mesmo que SQL deveria)
  const now = Date.now();
  const active = moments.filter((m) => new Date(m.expires_at).getTime() > now);
  if (active.length === 0) notFound();

  return (
    <MomentoViewer
      moments={active.map((m) => ({
        id: m.id,
        imageUrl: m.image_url,
        caption: m.caption,
        viewsCount: m.views_count,
        postedAt: m.posted_at,
        expiresAt: m.expires_at,
      }))}
      establishment={{
        id: place.id,
        name: place.name,
        city: place.city,
        state: place.state,
        coverUrl: place.cover_url ?? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        instagram: place.instagram ?? null,
      }}
    />
  );
}
