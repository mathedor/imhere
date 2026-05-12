"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Building2, Camera, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddressFieldset } from "@/components/AddressFieldset";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { MaskedInput } from "@/components/MaskedInput";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_COMERCIAL } from "../page";

export default function NovoEstabelecimentoPage() {
  const [saved, setSaved] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <PanelLayout
      scope="comercial"
      title="Cadastrar estabelecimento"
      subtitle="Após cadastrado, o estabelecimento recebe acesso ao próprio painel"
      nav={NAV_COMERCIAL}
      user={{ name: "Renata Vidal", role: "Executiva de contas" }}
    >
      <Link
        href="/comercial"
        className="mb-5 inline-flex items-center gap-1.5 text-xs text-text-soft hover:text-text"
      >
        <ArrowLeft className="size-3.5" />
        Voltar ao dashboard
      </Link>

      <form onSubmit={save} className="flex flex-col gap-5 lg:flex-row">
        <section className="flex-1 rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-text">
            <Building2 className="size-4 text-brand" />
            Dados do estabelecimento
          </h2>
          <p className="mb-5 text-xs text-text-soft">
            Preencha os dados básicos. O dono recebe e-mail para definir senha.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome do estabelecimento" className="md:col-span-2">
              <Input required placeholder="Ex: Lume Rooftop" />
            </Field>
            <Field label="CNPJ">
              <MaskedInput mask="cnpj" placeholder="00.000.000/0000-00" required />
            </Field>
            <Field label="Razão social">
              <Input placeholder="Lume Bar & Restaurante LTDA" />
            </Field>
            <Field label="Tipo">
              <Select required>
                <option value="">Selecione...</option>
                <option value="bar">Bar</option>
                <option value="restaurant">Restaurante</option>
                <option value="club">Balada</option>
                <option value="show">Casa de show</option>
                <option value="lounge">Lounge</option>
              </Select>
            </Field>
            <Field label="Capacidade">
              <Input type="number" placeholder="200" />
            </Field>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface-2/40 p-4">
            <h3 className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
              Endereço
            </h3>
            <AddressFieldset namePrefix="address" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="WhatsApp">
              <MaskedInput mask="phone" placeholder="(11) 99999-9999" required />
            </Field>
            <Field label="Instagram">
              <Input placeholder="@instagram" />
            </Field>
            <Field label="E-mail do responsável" hint="Receberá o convite" className="md:col-span-2">
              <Input type="email" required placeholder="responsavel@estabelecimento.com" />
            </Field>
            <Field label="Sobre o local" className="md:col-span-2">
              <Textarea rows={4} placeholder="Descrição curta para aparecer no app..." />
            </Field>
          </div>
        </section>

        <aside className="flex w-full flex-col gap-4 lg:w-80">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="mb-3 text-sm font-bold text-text">Foto de capa</h3>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-2 text-muted hover:border-brand/40 hover:text-brand"
            >
              <Camera className="size-6" />
              <span className="text-xs font-bold">Adicionar capa</span>
              <span className="text-[0.65rem]">Mínimo 1200×800px</span>
            </motion.button>
            <p className="mt-2 text-[0.65rem] text-text-soft">
              Outras fotos podem ser adicionadas pelo dono no próprio painel.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="mb-3 text-sm font-bold text-text">Plano inicial</h3>
            <Select defaultValue="trial">
              <option value="trial">Trial 14 dias (grátis)</option>
              <option value="basic">Básico Casa — R$ 290/mês</option>
              <option value="premium">Premium Casa+ — R$ 590/mês</option>
            </Select>
            <p className="mt-2 text-[0.65rem] text-text-soft">
              Sua comissão é 10% do MRR mensal, recorrente enquanto o cliente está ativo.
            </p>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
          >
            {saved ? "Cadastrado ✓" : (
              <>
                <Save className="size-4" />
                Cadastrar estabelecimento
              </>
            )}
          </motion.button>
        </aside>
      </form>
    </PanelLayout>
  );
}
