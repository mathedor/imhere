import { MomentoEditor, type MomentItem } from "@/components/estabelecimento/MomentoEditor";
import { listMoments } from "@/lib/db/establishments";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";

export const dynamic = "force-dynamic";

export default async function MomentoPage() {
  const ctx = await getMyEstablishmentContext();
  const moments: MomentItem[] = ctx.establishment
    ? (await listMoments(ctx.establishment.id)).map((m) => ({
        id: m.id,
        image_url: m.image_url,
        caption: m.caption,
        views_count: m.views_count,
        posted_at: m.posted_at,
        expires_at: m.expires_at,
      }))
    : [];

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">No Momento</h1>
        <p className="mt-1 text-sm text-text-soft">Stories ao vivo do seu estabelecimento · expira em 4h</p>
      </header>
      <MomentoEditor moments={moments} />
    </>
  );
}
