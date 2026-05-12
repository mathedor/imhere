"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Field, Input, Select } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { signUpEstablishmentAction, signUpUserAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type AccountType = "user" | "establishment";

function CadastroForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const confirme = params.get("confirme");
  const [type, setType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (confirme) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-soft">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-xl font-black text-text">Confirme seu e-mail</h2>
        <p className="mt-2 text-sm text-text-soft">
          Enviamos um link de confirmação. Abra o e-mail e clique para ativar a conta.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
        >
          Voltar ao login →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex flex-col items-center gap-3">
        <Logo size={42} />
        <h1 className="text-center text-2xl font-black tracking-tight text-text text-balance">
          {type === null
            ? "Criar conta no I'm Here"
            : type === "user"
            ? "Conta de usuário"
            : "Cadastro de estabelecimento"}
        </h1>
        <p className="text-center text-sm text-text-soft">
          {type === null
            ? "O que você quer fazer no app?"
            : type === "user"
            ? "Encontre quem está nos lugares perto de você"
            : "Coloque seu lugar no mapa do I'm Here"}
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        {error && (
          <div className="mb-4 rounded-xl border border-brand/40 bg-brand/10 px-3 py-2 text-xs text-brand">
            {decodeURIComponent(error)}
          </div>
        )}

        <AnimatePresence mode="wait">
          {type === null ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-3"
            >
              <TypeCard
                icon={UserIcon}
                title="Sou usuário"
                desc="Quero conhecer pessoas em bares, restaurantes e baladas"
                badge="Gratuito"
                onClick={() => setType("user")}
              />
              <TypeCard
                icon={Building2}
                title="Sou estabelecimento"
                desc="Tenho um bar, restaurante, casa de show e quero atrair clientes"
                badge="A partir de R$ 290/mês"
                onClick={() => setType("establishment")}
                accent
              />
            </motion.div>
          ) : type === "user" ? (
            <motion.form
              key="user-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              action={signUpUserAction}
              onSubmit={() => setLoading(true)}
              className="flex flex-col gap-3"
            >
              <button
                type="button"
                onClick={() => setType(null)}
                className="inline-flex w-fit items-center gap-1 text-xs text-text-soft hover:text-text"
              >
                <ArrowLeft className="size-3.5" />
                Voltar
              </button>

              <Field label="Nome">
                <Input name="name" placeholder="Seu nome completo" required />
              </Field>
              <Field label="E-mail" hint="Enviamos um link para confirmação">
                <Input name="email" type="email" placeholder="seuemail@exemplo.com" required autoComplete="email" />
              </Field>
              <Field label="WhatsApp" hint="Para verificação por SMS">
                <Input name="whatsapp" placeholder="(11) 99999-9999" required />
              </Field>
              <Field label="Senha">
                <div className="relative">
                  <Input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Mín. 8 caracteres"
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <TermsCheckbox />
              <SubmitButton loading={loading} label="Criar conta grátis" />

              <Benefits items={[
                "Acesso imediato à plataforma",
                "Cadastro completo só ao iniciar conversa",
                "Cancele quando quiser",
              ]} />
            </motion.form>
          ) : (
            <motion.form
              key="estab-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              action={signUpEstablishmentAction}
              onSubmit={() => setLoading(true)}
              className="flex flex-col gap-3"
            >
              <button
                type="button"
                onClick={() => setType(null)}
                className="inline-flex w-fit items-center gap-1 text-xs text-text-soft hover:text-text"
              >
                <ArrowLeft className="size-3.5" />
                Voltar
              </button>

              <Field label="Nome do estabelecimento">
                <Input name="estabName" placeholder="Ex: Lume Rooftop" required />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <Select name="estabType" required defaultValue="">
                    <option value="" disabled>Selecione...</option>
                    <option value="bar">Bar</option>
                    <option value="restaurant">Restaurante</option>
                    <option value="club">Balada</option>
                    <option value="show">Casa de show</option>
                    <option value="lounge">Lounge</option>
                  </Select>
                </Field>
                <Field label="CNPJ">
                  <Input name="cnpj" placeholder="00.000.000/0000-00" required />
                </Field>
              </div>

              <div className="grid grid-cols-[1fr_5rem] gap-3">
                <Field label="Cidade">
                  <Input name="city" placeholder="São Paulo" required />
                </Field>
                <Field label="UF">
                  <Input name="state" placeholder="SP" maxLength={2} required className="uppercase" />
                </Field>
              </div>

              <Field label="Nome do responsável">
                <Input name="ownerName" placeholder="Seu nome" required />
              </Field>
              <Field label="E-mail do responsável" hint="Receberá link de confirmação">
                <Input name="email" type="email" placeholder="responsavel@estabelecimento.com" required autoComplete="email" />
              </Field>
              <Field label="WhatsApp do responsável">
                <Input name="whatsapp" placeholder="(11) 99999-9999" required />
              </Field>
              <Field label="Senha">
                <div className="relative">
                  <Input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Mín. 8 caracteres"
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <TermsCheckbox />
              <SubmitButton loading={loading} label="Cadastrar estabelecimento" />

              <Benefits items={[
                "14 dias grátis em qualquer plano",
                "Endereço, fotos e cardápio depois no painel",
                "Suporte dedicado para começar",
              ]} />
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-5 text-center text-sm text-text-soft">
        Já tem conta?{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function TypeCard({
  icon: Icon,
  title,
  desc,
  badge,
  accent,
  onClick,
}: {
  icon: typeof UserIcon;
  title: string;
  desc: string;
  badge: string;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border bg-surface-2 p-4 text-left transition-all hover:border-brand",
        accent ? "border-brand/40" : "border-border"
      )}
    >
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-xl",
          accent ? "bg-brand text-white shadow-glow" : "bg-brand/15 text-brand"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-text">{title}</p>
          <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" />
        </div>
        <p className="mt-0.5 text-xs leading-snug text-text-soft">{desc}</p>
        <span className="mt-2 inline-block rounded-pill bg-surface-3 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-text-soft">
          {badge}
        </span>
      </div>
    </motion.button>
  );
}

function TermsCheckbox() {
  return (
    <label className="mt-1 flex items-start gap-2 text-[0.7rem] text-text-soft">
      <input type="checkbox" required className="mt-0.5 accent-brand" />
      <span>
        Concordo com os{" "}
        <Link href="#" className="text-brand hover:underline">Termos de uso</Link>
        {" "}e a{" "}
        <Link href="#" className="text-brand hover:underline">Política de privacidade</Link>
      </span>
    </label>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow disabled:opacity-70"
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          {label}
          <ArrowRight className="size-4" />
        </>
      )}
    </motion.button>
  );
}

function Benefits({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-4">
      {items.map((t) => (
        <div key={t} className="flex items-center gap-2 text-xs text-text-soft">
          <CheckCircle2 className="size-3.5 text-success" />
          {t}
        </div>
      ))}
    </div>
  );
}

export default function CadastroPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-10">
      <Suspense fallback={null}>
        <CadastroForm />
      </Suspense>
    </div>
  );
}
