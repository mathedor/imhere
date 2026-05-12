"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Plus, Save, Trash2, UtensilsCrossed, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Field, Input, Textarea } from "@/components/Field";
import { PhotoUpload } from "@/components/PhotoUpload";
import {
  createMenuItemAction,
  deleteMenuItemAction,
  toggleMenuItemAction,
  updateMenuItemAction,
} from "@/lib/actions/menu";
import { cn } from "@/lib/utils";

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  image_url: string | null;
  position: number;
  available: boolean;
}

interface Props {
  items: MenuItem[];
  publicSlug?: string;
}

function formatPrice(cents: number | null) {
  if (cents == null) return "—";
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function CardapioEditor({ items, publicSlug }: Props) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, it) => {
    (acc[it.category] = acc[it.category] || []).push(it);
    return acc;
  }, {});

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        {publicSlug && (
          <Link
            href={`/cardapio/${publicSlug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text hover:border-brand/40"
          >
            <UtensilsCrossed className="size-3.5" />
            Ver página pública
          </Link>
        )}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setCreating(true)}
          className="ml-auto flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow"
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
                  it.available ? "border-border hover:border-brand/40" : "border-border opacity-60"
                )}
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  {it.image_url && (
                    <Image src={it.image_url} alt={it.name} fill sizes="80px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-sm font-bold text-text">{it.name}</h3>
                    <span className="shrink-0 text-sm font-black text-brand">
                      {formatPrice(it.price_cents)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-text-soft">{it.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <form action={toggleMenuItemAction}>
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="available" value={String(it.available)} />
                      <button
                        type="submit"
                        className={cn(
                          "rounded-pill px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider transition-colors",
                          it.available ? "bg-success/15 text-success" : "bg-surface-2 text-muted"
                        )}
                      >
                        {it.available ? "✓ Disponível" : "Indisponível"}
                      </button>
                    </form>
                    <button
                      onClick={() => setEditing(it)}
                      className="grid size-6 place-items-center rounded-lg text-muted hover:text-text"
                    >
                      <Edit3 className="size-3" />
                    </button>
                    <form action={deleteMenuItemAction}>
                      <input type="hidden" name="id" value={it.id} />
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm(`Remover "${it.name}" do cardápio?`)) e.preventDefault();
                        }}
                        className="grid size-6 place-items-center rounded-lg text-muted hover:text-brand"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </form>
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
          <p className="mt-1 text-xs text-text-soft">
            Adicione seu primeiro item pra ele aparecer no app dos clientes.
          </p>
        </div>
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <ItemDrawer
            item={editing}
            onClose={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ItemDrawer({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const isEdit = !!item;
  const [imageUrl, setImageUrl] = useState<string | null>(item?.image_url ?? null);
  const [loading, setLoading] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-base font-black text-text">
              {isEdit ? "Editar item" : "Novo item"}
            </h3>
            <p className="text-xs text-text-soft">
              {isEdit ? `Editando ${item?.name}` : "Adicione um item ao seu cardápio"}
            </p>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:text-text">
            <X className="size-4" />
          </button>
        </header>

        <form
          action={isEdit ? updateMenuItemAction : createMenuItemAction}
          onSubmit={() => {
            setLoading(true);
            setTimeout(onClose, 300);
          }}
          className="flex flex-col gap-4 p-4"
        >
          {isEdit && item && <input type="hidden" name="id" value={item.id} />}
          {imageUrl && <input type="hidden" name="imageUrl" value={imageUrl} />}

          <div className="flex gap-3">
            <PhotoUpload
              bucket="establishment-gallery"
              defaultUrl={imageUrl ?? undefined}
              shape="square"
              label="Foto do prato"
              onUpload={(url) => setImageUrl(url)}
              className="size-24"
            />
            <div className="flex flex-1 flex-col gap-3">
              <Field label="Nome">
                <Input name="name" defaultValue={item?.name} required placeholder="Ex: Pôr do Sol" />
              </Field>
              <Field label="Preço (R$)">
                <Input
                  name="price"
                  defaultValue={item?.price_cents ? (item.price_cents / 100).toFixed(2) : ""}
                  placeholder="48,00"
                  inputMode="decimal"
                />
              </Field>
            </div>
          </div>

          <Field label="Categoria">
            <Input
              name="category"
              defaultValue={item?.category}
              required
              placeholder="Drinks autorais / Pratos / Petiscos / Sobremesas"
            />
          </Field>

          <Field label="Descrição" hint="Opcional · ajude o cliente a entender o prato">
            <Textarea
              name="description"
              defaultValue={item?.description ?? ""}
              rows={3}
              placeholder="Ingredientes, modo de preparo, sugestão de harmonização..."
            />
          </Field>

          <input type="hidden" name="position" value={item?.position ?? 0} />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow disabled:opacity-70"
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save className="size-4" />
                {isEdit ? "Salvar alterações" : "Adicionar ao cardápio"}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
