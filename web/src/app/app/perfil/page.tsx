"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Eye,
  EyeOff,
  MessageCirclePlus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DateInput } from "@/components/DateInput";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { MaskedInput } from "@/components/MaskedInput";
import { updateMyProfileAction } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";

const initialPhotos = [
  "https://i.pravatar.cc/600?img=14",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=70",
  "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=600&q=70",
];

export default function PerfilPage() {
  const [status, setStatus] = useState<"open" | "watching" | "invisible">("open");
  const [photos, setPhotos] = useState(initialPhotos);
  const [loading, setLoading] = useState(false);

  return (
    <form action={updateMyProfileAction} onSubmit={() => setLoading(true)} className="mx-auto w-full max-w-4xl px-5 pb-8">
      <input type="hidden" name="status" value={status} />
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">Meu perfil</h1>
          <p className="mt-1 text-sm text-text-soft">
            Cuidado: foto e bio definem se as pessoas vão querer conhecer você.
          </p>
        </div>
        <span className="hidden md:inline-flex items-center gap-2 rounded-pill bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand">
          <Sparkles className="size-3.5" />
          Plano: Free
        </span>
      </header>

      <section className="mb-6 rounded-3xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="relative size-28 overflow-hidden rounded-3xl border-4 border-bg shadow-lg sm:size-32">
              <Image src={photos[0]} alt="foto" fill sizes="128px" className="object-cover" />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-pill bg-brand px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-glow whitespace-nowrap"
            >
              <Camera className="size-3" />
              Trocar foto
            </motion.button>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Status de visibilidade
              </p>
              <p className="mt-0.5 text-xs text-text-soft">
                Define quem pode te ver na lista de presentes em estabelecimentos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  { key: "open", label: "Aberto a conversa", icon: MessageCirclePlus, color: "#22c55e" },
                  { key: "watching", label: "Só observando", icon: Eye, color: "#f59e0b" },
                  { key: "invisible", label: "Invisível", icon: EyeOff, color: "#6b6b75" },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = status === opt.key;
                return (
                  <motion.button
                    key={opt.key}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStatus(opt.key)}
                    className={cn(
                      "relative flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition-all",
                      active
                        ? "border-brand bg-brand/10"
                        : "border-border bg-surface-2 hover:border-brand/40"
                    )}
                  >
                    <div
                      className="grid size-8 shrink-0 place-items-center rounded-lg"
                      style={{ background: `${opt.color}25`, color: opt.color }}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xs font-bold text-text">{opt.label}</span>
                    {active && (
                      <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text">
          Dados pessoais
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome completo">
            <Input name="name" defaultValue="Mateus Henrique Silva" required />
          </Field>
          <Field label="E-mail" hint="Não editável aqui">
            <Input type="email" defaultValue="mateus@exemplo.com" disabled />
          </Field>
          <Field label="WhatsApp">
            <MaskedInput mask="phone" name="whatsapp" defaultValue="(48) 99999-1234" />
          </Field>
          <Field label="CPF">
            <MaskedInput mask="cpf" name="cpf" placeholder="000.000.000-00" />
          </Field>
          <Field label="Instagram">
            <Input name="instagram" defaultValue="@mateusxh" />
          </Field>
          <Field label="Data de nascimento">
            <DateInput name="birth" defaultValue="1994-03-12" />
          </Field>
          <Field label="Gênero">
            <Select name="gender" defaultValue="male">
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
              <option value="na">Prefiro não dizer</option>
            </Select>
          </Field>
          <Field label="Profissão" className="sm:col-span-2">
            <Input name="profession" defaultValue="Designer UX" />
          </Field>
          <Field label="Sobre você" hint="Máx 240 caracteres" className="sm:col-span-2">
            <Textarea
              name="bio"
              maxLength={240}
              defaultValue="Curto bons drinks, música ao vivo e conversas que rendem. Sempre aberto a descobrir lugares novos."
            />
          </Field>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-text">Galeria</h2>
            <p className="mt-0.5 text-xs text-text-soft">Até 6 fotos · primeira é a principal</p>
          </div>
          <Link
            href="/app/planos"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-pill bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand"
          >
            <Sparkles className="size-3.5" />
            Premium: até 12
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {photos.map((p, i) => (
            <motion.div
              key={p + i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <Image src={p} alt={`foto ${i + 1}`} fill sizes="120px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-pill bg-brand px-1.5 py-0.5 text-[0.55rem] font-bold uppercase text-white">
                  Capa
                </span>
              )}
              <button
                onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
            </motion.div>
          ))}

          {photos.length < 6 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setPhotos([...photos, `https://i.pravatar.cc/600?img=${20 + photos.length}`])}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border text-muted transition-colors hover:border-brand/60 hover:text-brand"
            >
              <Camera className="size-6" />
            </motion.button>
          )}
        </div>
      </section>

      <div className="sticky bottom-24 z-10 flex justify-end md:bottom-6">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.96 }}
          whileHover={{ y: -2 }}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow disabled:opacity-70"
        >
          {loading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Save className="size-4" />
              Salvar perfil
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
