"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Save, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DateInput } from "@/components/DateInput";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { MaskedInput } from "@/components/MaskedInput";

interface Props {
  mode: "create" | "edit";
  initial?: {
    id?: string;
    name?: string;
    email?: string;
    whatsapp?: string;
    cpf?: string;
    birth?: string;
    gender?: string;
    profession?: string;
    bio?: string;
    role?: string;
    status?: string;
    plan?: string;
    photoUrl?: string;
  };
}

export function UserForm({ mode, initial }: Props) {
  const [saved, setSaved] = useState(false);
  const isEdit = mode === "edit";

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <Link href="/admin/usuarios" className="inline-flex w-fit items-center gap-1 text-xs text-text-soft hover:text-text">
        <ArrowLeft className="size-3.5" />
        Voltar à lista
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row">
        <section className="flex-1 rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-base font-bold text-text">Dados pessoais</h2>
          <p className="mb-5 text-xs text-text-soft">
            {isEdit ? "Atualize os dados do usuário" : "Cria um usuário completo (sem confirmação de email)"}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome completo" className="md:col-span-2">
              <Input name="name" defaultValue={initial?.name} required placeholder="Nome do usuário" />
            </Field>
            <Field label="E-mail">
              <Input name="email" type="email" defaultValue={initial?.email} required />
            </Field>
            <Field label="WhatsApp">
              <MaskedInput mask="phone" name="whatsapp" defaultValue={initial?.whatsapp} placeholder="(11) 99999-9999" />
            </Field>
            <Field label="CPF">
              <MaskedInput mask="cpf" name="cpf" defaultValue={initial?.cpf} placeholder="000.000.000-00" />
            </Field>
            <Field label="Data de nascimento">
              <DateInput name="birth" defaultValue={initial?.birth} />
            </Field>
            <Field label="Gênero">
              <Select name="gender" defaultValue={initial?.gender ?? "na"}>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
                <option value="na">Prefiro não dizer</option>
              </Select>
            </Field>
            <Field label="Profissão">
              <Input name="profession" defaultValue={initial?.profession} />
            </Field>
            <Field label="Bio" className="md:col-span-2">
              <Textarea name="bio" defaultValue={initial?.bio} rows={3} maxLength={240} />
            </Field>
          </div>
        </section>

        <aside className="flex w-full flex-col gap-4 lg:w-80">
          <div className="rounded-3xl border border-border bg-surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
              <ShieldCheck className="size-4 text-brand" />
              Permissão & status
            </h3>
            <Field label="Role">
              <Select name="role" defaultValue={initial?.role ?? "user"}>
                <option value="user">Usuário</option>
                <option value="establishment">Estabelecimento</option>
                <option value="sales">Comercial</option>
                <option value="admin">Administrador</option>
              </Select>
            </Field>
            <Field label="Status de visibilidade" className="mt-3">
              <Select name="status" defaultValue={initial?.status ?? "open"}>
                <option value="open">Aberto a conversa</option>
                <option value="watching">Só observando</option>
                <option value="invisible">Invisível</option>
              </Select>
            </Field>
            <Field label="Plano" className="mt-3">
              <Select name="plan" defaultValue={initial?.plan ?? "free"}>
                <option value="free">Free</option>
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </Select>
            </Field>
            {!isEdit && (
              <Field label="Senha inicial" hint="Mín. 8 caracteres" className="mt-3">
                <Input name="password" type="password" minLength={8} required={!isEdit} placeholder="••••••••" />
              </Field>
            )}
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
                {isEdit ? "Salvar alterações" : "Criar usuário"}
              </>
            )}
          </motion.button>

          {isEdit && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-brand hover:border-brand"
            >
              <Trash2 className="size-3.5" />
              Excluir usuário
            </button>
          )}
        </aside>
      </div>
    </form>
  );
}
