"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Field, Input } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { signUpAction } from "@/lib/auth/actions";

export default function CadastroPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo size={42} />
          <h1 className="text-2xl font-black tracking-tight text-text text-balance text-center">
            Comece em <span className="text-brand">30 segundos</span>
          </h1>
          <p className="text-center text-sm text-text-soft">
            Só nome, e-mail e celular. Complete o resto quando quiser conversar com alguém.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <form action={signUpAction} onSubmit={() => setLoading(true)} className="flex flex-col gap-3">
            <Field label="Nome">
              <Input name="name" placeholder="Seu nome" required />
            </Field>
            <Field label="E-mail" hint="Enviamos um link para confirmação">
              <Input name="email" type="email" placeholder="seuemail@exemplo.com" required />
            </Field>
            <Field label="WhatsApp" hint="Para verificação por SMS">
              <Input name="whatsapp" placeholder="(11) 99999-9999" required />
            </Field>
            <Field label="Senha">
              <Input name="password" type="password" placeholder="Mín. 8 caracteres" minLength={8} required />
            </Field>

            <label className="mt-1 flex items-start gap-2 text-[0.7rem] text-text-soft">
              <input type="checkbox" required className="mt-0.5 accent-brand" />
              <span>
                Concordo com os{" "}
                <Link href="#" className="text-brand hover:underline">
                  Termos de uso
                </Link>{" "}
                e a{" "}
                <Link href="#" className="text-brand hover:underline">
                  Política de privacidade
                </Link>
              </span>
            </label>

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
                  Criar conta grátis
                  <ArrowRight className="size-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
            {[
              "Acesso imediato à plataforma",
              "Cadastro completo só ao iniciar conversa",
              "Cancele quando quiser",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-text-soft">
                <CheckCircle2 className="size-3.5 text-success" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-text-soft">
          Já tem conta?{" "}
          <Link href="/login" className="font-bold text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
