"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Building2, Camera, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AddressFieldset } from "@/components/AddressFieldset";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { MaskedInput } from "@/components/MaskedInput";

interface Props {
  mode: "create" | "edit";
  initial?: {
    id?: string;
    name?: string;
    cnpj?: string;
    type?: string;
    capacity?: number;
    cep?: string;
    address?: string;
    city?: string;
    state?: string;
    whatsapp?: string;
    instagram?: string;
    ownerEmail?: string;
    about?: string;
    plan?: string;
    cover?: string;
  };
}

export function EstablishmentForm({ mode, initial }: Props) {
  const [saved, setSaved] = useState(false);
  const isEdit = mode === "edit";

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <Link href="/admin/estabelecimentos" className="inline-flex w-fit items-center gap-1 text-xs text-text-soft hover:text-text">
        <ArrowLeft className="size-3.5" />
        Voltar à lista
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row">
        <section className="flex-1 rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-text">
            <Building2 className="size-4 text-brand" />
            Dados do estabelecimento
          </h2>
          <p className="mb-5 text-xs text-text-soft">
            {isEdit ? "Atualize as informações" : "Cria o estabelecimento e envia convite ao responsável"}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome do estabelecimento" className="md:col-span-2">
              <Input name="name" defaultValue={initial?.name} required placeholder="Ex: Bravo Mar Beach Club" />
            </Field>
            <Field label="CNPJ">
              <MaskedInput mask="cnpj" name="cnpj" defaultValue={initial?.cnpj} placeholder="00.000.000/0000-00" required />
            </Field>
            <Field label="Tipo">
              <Select name="type" defaultValue={initial?.type ?? ""} required>
                <option value="" disabled>Selecione...</option>
                <option value="bar">Bar</option>
                <option value="restaurant">Restaurante</option>
                <option value="club">Balada</option>
                <option value="show">Casa de show</option>
                <option value="lounge">Lounge / Beach Club</option>
              </Select>
            </Field>
            <Field label="Capacidade">
              <Input name="capacity" type="number" defaultValue={initial?.capacity} placeholder="350" />
            </Field>
            <Field label="WhatsApp">
              <MaskedInput mask="phone" name="whatsapp" defaultValue={initial?.whatsapp} placeholder="(47) 99999-9999" required />
            </Field>
            <Field label="Instagram">
              <Input name="instagram" defaultValue={initial?.instagram} placeholder="@instagram" />
            </Field>
            <Field label="E-mail do responsável" hint={isEdit ? "Email do owner" : "Receberá o convite"} className="md:col-span-2">
              <Input name="ownerEmail" type="email" defaultValue={initial?.ownerEmail} required />
            </Field>
            <Field label="Sobre o local" className="md:col-span-2">
              <Textarea name="about" defaultValue={initial?.about} rows={4} placeholder="Descrição curta para aparecer no app..." />
            </Field>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-surface-2/40 p-4">
            <h3 className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
              Endereço
            </h3>
            <AddressFieldset
              namePrefix="address"
              defaultValues={{
                cep: initial?.cep,
                city: initial?.city,
                state: initial?.state,
              }}
            />
          </div>
        </section>

        <aside className="flex w-full flex-col gap-4 lg:w-80">
          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold text-text">Capa</h3>
            {initial?.cover ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                <Image src={initial.cover} alt="cover" fill sizes="320px" className="object-cover" />
                <button
                  type="button"
                  className="absolute bottom-2 right-2 flex items-center gap-1 rounded-pill bg-black/70 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white backdrop-blur"
                >
                  <Camera className="size-3" />
                  Trocar
                </button>
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-2 text-muted hover:border-brand/40 hover:text-brand"
              >
                <Camera className="size-6" />
                <span className="text-xs font-bold">Adicionar capa</span>
                <span className="text-[0.65rem]">1200×800 ideal</span>
              </motion.button>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold text-text">Plano</h3>
            <Select name="plan" defaultValue={initial?.plan ?? "trial"}>
              <option value="trial">Trial 14 dias (grátis)</option>
              <option value="casa-basic">Básico Casa — R$ 290/mês</option>
              <option value="casa-premium">Premium Casa+ — R$ 590/mês</option>
            </Select>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
          >
            {saved ? "Salvo ✓" : (
              <>
                <Save className="size-4" />
                {isEdit ? "Salvar alterações" : "Criar estabelecimento"}
              </>
            )}
          </motion.button>

          {isEdit && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-brand hover:border-brand"
            >
              <Trash2 className="size-3.5" />
              Excluir estabelecimento
            </button>
          )}
        </aside>
      </div>
    </form>
  );
}
