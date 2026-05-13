"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Field, Input } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { requestPasswordResetAction } from "@/lib/auth/actions";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await requestPasswordResetAction(fd);
    setSubmitting(false);
    setSent(true);
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo size={42} />
          <h1 className="text-center text-2xl font-black tracking-tight text-text">
            Esqueceu a senha?
          </h1>
          <p className="text-center text-sm text-text-soft">
            Digite seu email · enviamos um link pra você redefinir.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-4 text-center"
              >
                <div className="grid size-16 place-items-center rounded-3xl bg-success/15 text-success">
                  <CheckCircle2 className="size-8" />
                </div>
                <h2 className="text-lg font-black text-text">Verifica seu email</h2>
                <p className="text-sm text-text-soft">
                  Se a conta existe, mandamos um link pra <strong className="text-text">{email}</strong>.
                  Pode levar uns minutos · cheque também o spam.
                </p>
                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-4 py-2 text-xs font-bold text-text hover:border-brand/40"
                >
                  <ArrowLeft className="size-3.5" />
                  Voltar ao login
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <Field label="E-mail da conta">
                  <Input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting || !email}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow disabled:opacity-70"
                >
                  <Mail className="size-4" />
                  {submitting ? "Enviando..." : "Enviar link de reset"}
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1 text-xs font-bold text-text-soft hover:text-text"
                >
                  <ArrowLeft className="size-3" />
                  Voltar ao login
                </Link>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
