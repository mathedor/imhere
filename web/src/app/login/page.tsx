"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Field, Input } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { signInAction } from "@/lib/auth/actions";

function LoginForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="mb-6 flex flex-col items-center gap-3">
        <Logo size={42} />
        <h1 className="text-2xl font-black tracking-tight text-text">Bem-vindo de volta</h1>
        <p className="text-sm text-text-soft">Entre com sua conta para continuar</p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        {error && (
          <div className="mb-4 rounded-xl border border-brand/40 bg-brand/10 px-3 py-2 text-xs text-brand">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={signInAction} onSubmit={() => setLoading(true)} className="flex flex-col gap-3">
          <Field label="E-mail">
            <Input name="email" type="email" placeholder="seuemail@exemplo.com" required autoComplete="email" />
          </Field>
          <Field label="Senha">
            <div className="relative">
              <Input
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pr-10"
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
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-text-soft">
              <input type="checkbox" className="accent-brand" /> Lembrar de mim
            </label>
            <Link href="#" className="text-brand hover:underline">
              Esqueci a senha
            </Link>
          </div>

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
                Entrar
                <ArrowRight className="size-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-5 text-center text-[0.7rem] text-muted">
          Você será redirecionado para sua área automaticamente.
        </p>
      </div>

      <p className="mt-5 text-center text-sm text-text-soft">
        Novo por aqui?{" "}
        <Link href="/cadastro" className="font-bold text-brand hover:underline">
          Criar conta
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-10">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
