"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Input } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { updatePasswordAction } from "@/lib/auth/actions";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Senha precisa ter no mínimo 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append("password", password);
    const result = await updatePasswordAction(fd);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Erro ao salvar nova senha");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
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
            Nova senha
          </h1>
          <p className="text-center text-sm text-text-soft">
            Crie uma senha forte (mín. 8 caracteres)
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="grid size-16 place-items-center rounded-3xl bg-success/15 text-success">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="text-lg font-black text-text">Senha alterada!</h2>
              <p className="text-sm text-text-soft">Redirecionando pro login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Nova senha">
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    placeholder="Mín. 8 caracteres"
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

              <Field label="Confirmar nova senha">
                <Input
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                />
              </Field>

              {error && (
                <p className="rounded-xl border border-brand/30 bg-brand/10 px-3 py-2 text-xs text-brand">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow disabled:opacity-70"
              >
                <Lock className="size-4" />
                {submitting ? "Salvando..." : "Salvar nova senha"}
              </button>

              <Link
                href="/login"
                className="inline-flex items-center justify-center text-xs font-bold text-text-soft hover:text-text"
              >
                Cancelar
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  );
}
