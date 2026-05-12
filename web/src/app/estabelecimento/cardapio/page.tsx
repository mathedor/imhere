"use client";

import { motion } from "framer-motion";
import { Edit3, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  available: boolean;
}

const MOCK_ITEMS: MenuItem[] = [
  { id: "i1", category: "Drinks autorais", name: "Pôr do Sol", description: "Gin tônica com flor de hibisco", price_cents: 4800, image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80", available: true },
  { id: "i2", category: "Drinks autorais", name: "Bravo Spritz", description: "Aperol, prosecco, soda", price_cents: 4500, image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80", available: true },
  { id: "i3", category: "Pratos principais", name: "Polvo grelhado", description: "Polvo, batatas confitadas", price_cents: 12800, image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80", available: true },
  { id: "i4", category: "Petiscos", name: "Ceviche de peixe branco", description: "Lima, pimenta dedo-de-moça", price_cents: 5800, image_url: "https://images.unsplash.com/photo-1574484184081-afea8a62f9c4?w=400&q=80", available: true },
];

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default function CardapioEditorPage() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, it) => {
    (acc[it.category] = acc[it.category] || []).push(it);
    return acc;
  }, {});

  function toggleAvailable(id: string) {
    setItems(items.map((it) => (it.id === id ? { ...it, available: !it.available } : it)));
  }

  function remove(id: string) {
    if (!confirm("Remover este item do cardápio?")) return;
    setItems(items.filter((it) => it.id !== id));
  }

  return (
    <PanelLayout
      scope="estabelecimento"
      title="Cardápio"
      subtitle="Edite itens, preços e fotos · publicado em /cardapio/seu-slug"
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Carla Pires", role: "Gerente" }}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href="/cardapio/bravo-mar-beach-club"
          target="_blank"
          className="flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text hover:border-brand/40"
        >
          <UtensilsCrossed className="size-3.5" />
          Ver página pública
        </Link>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow"
        >
          <Plus className="size-4" />
          Novo item
        </motion.button>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat} className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">{cat}</h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {list.map((it) => (
              <li
                key={it.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border bg-surface p-3 transition-colors",
                  it.available ? "border-border hover:border-brand/40" : "border-border opacity-50"
                )}
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={it.image_url} alt={it.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-sm font-bold text-text">{it.name}</h3>
                    <span className="shrink-0 text-sm font-black text-brand">{formatPrice(it.price_cents)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-text-soft">{it.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => toggleAvailable(it.id)}
                      className={cn(
                        "rounded-pill px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider transition-colors",
                        it.available
                          ? "bg-success/15 text-success"
                          : "bg-surface-2 text-muted"
                      )}
                    >
                      {it.available ? "✓ Disponível" : "Indisponível"}
                    </button>
                    <button className="grid size-6 place-items-center rounded-lg text-muted hover:text-text">
                      <Edit3 className="size-3" />
                    </button>
                    <button
                      onClick={() => remove(it.id)}
                      className="grid size-6 place-items-center rounded-lg text-muted hover:text-brand"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
          <UtensilsCrossed className="mx-auto size-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-text">Cardápio vazio</p>
          <p className="mt-1 text-xs text-text-soft">Adicione seu primeiro item pra ele aparecer no app dos clientes.</p>
        </div>
      )}
    </PanelLayout>
  );
}
