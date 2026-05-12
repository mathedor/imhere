"use client";

import { motion } from "framer-motion";
import { Building2, Instagram, Save } from "lucide-react";
import { useState } from "react";
import { AddressFieldset } from "@/components/AddressFieldset";
import { Field, Input, Textarea } from "@/components/Field";
import { MaskedInput } from "@/components/MaskedInput";
import { PhotoUpload } from "@/components/PhotoUpload";
import { updateEstablishmentProfileAction } from "@/lib/actions/establishment-owner";

export default function EstabelecimentoPerfilPage() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Perfil & itens</h1>
        <p className="mt-1 text-sm text-text-soft">Dados públicos do seu estabelecimento — aparece pros usuários no app</p>
      </header>
      <form
        action={updateEstablishmentProfileAction}
        onSubmit={() => setLoading(true)}
        className="flex flex-col gap-5 lg:flex-row"
      >
        <section className="flex-1 rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-text">
            <Building2 className="size-4 text-brand" />
            Dados públicos
          </h2>
          <p className="mb-5 text-xs text-text-soft">
            Esses dados aparecem na busca e no 360 do estabelecimento.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome do estabelecimento" className="md:col-span-2">
              <Input name="name" defaultValue="" placeholder="Ex: Bravo Mar Beach Club" />
            </Field>
            <Field label="WhatsApp">
              <MaskedInput mask="phone" name="whatsapp" placeholder="(11) 99999-9999" />
            </Field>
            <Field label="Instagram">
              <Input name="instagram" placeholder="@instagram" />
            </Field>
            <Field label="URL de reservas" hint="Site externo onde clientes reservam">
              <Input name="reservation_url" type="url" placeholder="https://..." />
            </Field>
            <Field label="URL do cardápio externo" hint="Opcional · se preferir um link só">
              <Input name="menu_url" type="url" placeholder="https://..." />
            </Field>
            <Field label="Sobre o local" className="md:col-span-2">
              <Textarea name="about" rows={4} placeholder="Descrição curta que aparece pros clientes..." />
            </Field>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-surface-2/40 p-4">
            <h3 className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
              Endereço
            </h3>
            <AddressFieldset namePrefix="address" />
          </div>
        </section>

        <aside className="flex w-full flex-col gap-4 lg:w-80">
          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold text-text">Capa</h3>
            <PhotoUpload bucket="establishment-covers" shape="wide" label="Capa do estabelecimento" />
            <p className="mt-2 text-[0.65rem] text-text-soft">
              1200×800 ideal · aparece como destaque no app
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold text-text">Avatar / logo</h3>
            <PhotoUpload bucket="establishment-covers" shape="circle" label="Logo" />
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow disabled:opacity-70"
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

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text-soft hover:border-brand/40"
          >
            <Instagram className="size-3.5" />
            Conectar Instagram (em breve)
          </a>
        </aside>
      </form>
    </>
  );
}
