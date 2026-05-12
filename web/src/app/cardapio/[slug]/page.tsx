import { ArrowLeft, Instagram, MapPin, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listMenuBySlug } from "@/lib/db/menu";

export const dynamic = "force-dynamic";

function formatPrice(cents: number | null): string {
  if (cents == null) return "—";
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function CardapioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { establishment, items } = await listMenuBySlug(slug);
  if (!establishment) notFound();

  // Agrupa por categoria
  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    (acc[it.category] = acc[it.category] || []).push(it);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="relative h-56 w-full overflow-hidden md:h-72">
        {establishment.cover_url && (
          <Image
            src={establishment.cover_url}
            alt={establishment.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/30" />
        <Link
          href={`/app/estabelecimento/${slug}`}
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full glass-strong text-white"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 md:px-10">
          <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-brand">
            <UtensilsCrossed className="size-3.5" />
            Cardápio
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white drop-shadow md:text-4xl">
            {establishment.name}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-white/85">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {establishment.city}/{establishment.state}
            </span>
            {establishment.instagram && (
              <a
                href={`https://instagram.com/${establishment.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-brand-soft"
              >
                <Instagram className="size-3" />
                {establishment.instagram}
              </a>
            )}
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-10 border-b border-border bg-bg/90 px-5 py-3 backdrop-blur-md md:px-10">
        <div className="mx-auto flex max-w-4xl gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#${slugifyCategory(cat)}`}
              className="shrink-0 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text-soft transition-colors hover:border-brand/40 hover:text-text"
            >
              {cat}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-5 py-8 md:px-10">
        {categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
            <UtensilsCrossed className="mx-auto size-8 text-muted" />
            <p className="mt-3 text-sm font-bold text-text">Cardápio em construção</p>
            <p className="mt-1 text-xs text-text-soft">
              O estabelecimento ainda não publicou os itens. Volte em breve.
            </p>
          </div>
        )}

        {categories.map((cat) => (
          <section key={cat} id={slugifyCategory(cat)} className="mb-10 scroll-mt-24">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand">{cat}</h2>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {grouped[cat].map((it) => (
                <li
                  key={it.id}
                  className="group flex items-start gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-brand/40"
                >
                  {it.image_url && (
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                      <Image src={it.image_url} alt={it.name} fill sizes="80px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="truncate text-sm font-extrabold text-text">{it.name}</h3>
                      <span className="shrink-0 text-sm font-black text-brand">
                        {formatPrice(it.price_cents)}
                      </span>
                    </div>
                    {it.description && (
                      <p className="mt-1 text-xs leading-snug text-text-soft">{it.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="border-t border-border bg-surface px-5 py-6 text-center text-xs text-text-soft md:px-10">
        Cardápio servido por{" "}
        <strong className="text-text">I&apos;m Here</strong> · valores sujeitos a alteração sem aviso
      </footer>
    </div>
  );
}

function slugifyCategory(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}
