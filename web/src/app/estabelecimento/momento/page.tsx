import { Clock, TrendingUp } from "lucide-react";
import { MomentoEditor, type MomentItem } from "@/components/estabelecimento/MomentoEditor";
import { getCheckinsHourly } from "@/lib/db/admin-indices";
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

  // Sugestão: melhor hora pra postar baseado em check-ins historicos do estab
  let bestHour = 22; // fallback
  let nowHour = new Date().getHours();
  let nowReach = 1;
  let bestReach = 1;

  try {
    const hourly = await getCheckinsHourly("30d");
    const max = Math.max(...hourly.map((h) => h.count), 1);
    const best = hourly.reduce((a, b) => (b.count > a.count ? b : a), hourly[0]);
    bestHour = best?.hour ?? 22;
    bestReach = best?.count ?? 1;
    nowReach = hourly[nowHour]?.count ?? 1;
  } catch {
    // mock fallback
  }

  const multiplier = nowReach > 0 ? bestReach / nowReach : 1;
  const postNow = nowHour === bestHour;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">No Momento</h1>
        <p className="mt-1 text-sm text-text-soft">Stories ao vivo do seu estabelecimento · expira em 4h</p>
      </header>

      <section
        className={`mb-6 rounded-2xl border p-4 ${
          postNow ? "border-success/40 bg-success/10" : "border-warn/30 bg-warn/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`grid size-10 shrink-0 place-items-center rounded-xl ${
              postNow ? "bg-success text-white" : "bg-warn text-white"
            }`}
          >
            {postNow ? <TrendingUp className="size-5" /> : <Clock className="size-5" />}
          </div>
          <div className="flex-1 leading-tight">
            <p className="text-sm font-bold text-text">
              {postNow
                ? "Hora perfeita pra postar! ⚡"
                : `Melhor horário: ${String(bestHour).padStart(2, "0")}h`}
            </p>
            <p className="text-[0.7rem] text-text-soft">
              {postNow
                ? `Você está no pico de movimento (${bestReach} check-ins/h historicamente)`
                : `Postar nesse horário alcança ~${multiplier.toFixed(1)}x mais pessoas que agora`}
            </p>
          </div>
        </div>
      </section>

      <MomentoEditor moments={moments} />
    </>
  );
}
