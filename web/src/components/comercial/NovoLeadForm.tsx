"use client";

import { Plus } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { MaskedInput } from "@/components/MaskedInput";
import { createLeadAction } from "@/lib/actions/leads";
import { STAGE_LABEL, STAGE_ORDER } from "@/lib/db/leads-meta";

export function NovoLeadForm() {
  return (
    <form action={createLeadAction} className="mx-auto w-full max-w-2xl">
      <section className="rounded-3xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text">
          Dados do estabelecimento
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome do estabelecimento" className="sm:col-span-2">
            <Input name="name" required placeholder="Ex: Bravo Mar Beach Club" />
          </Field>
          <Field label="Cidade">
            <Input name="city" placeholder="Itajaí" />
          </Field>
          <Field label="Estado">
            <Input name="state" maxLength={2} placeholder="SC" />
          </Field>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text">Contato</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome do responsável">
            <Input name="contactName" placeholder="Quem decide" />
          </Field>
          <Field label="E-mail">
            <Input type="email" name="contactEmail" placeholder="contato@bar.com" />
          </Field>
          <Field label="WhatsApp" className="sm:col-span-2">
            <MaskedInput mask="phone" name="contactPhone" placeholder="(11) 99999-9999" />
          </Field>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text">
          Forecast & estágio
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="MRR esperado (R$)">
            <Input name="expectedMrr" placeholder="240,00" inputMode="decimal" />
          </Field>
          <Field label="Probabilidade (%)">
            <Input name="probability" type="number" defaultValue="20" min={0} max={100} />
          </Field>
          <Field label="Estágio inicial">
            <Select name="stage" defaultValue="new">
              {STAGE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Notas" hint="Anote o que rolou na primeira conversa" className="mt-3">
          <Textarea name="notes" rows={3} placeholder="Tom da conversa, objeções, próximos passos..." />
        </Field>
      </section>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
        >
          <Plus className="size-4" />
          Adicionar ao pipeline
        </button>
      </div>
    </form>
  );
}
