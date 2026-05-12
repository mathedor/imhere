"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, ShieldCheck, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Field, Input } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { signInAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type Role = "user" | "establishment" | "sales" | "admin";

const roles: { key: Role; label: string; icon: typeof UserIcon; href: string; desc: string }[] = [
  { key: "user", label: "Usuário", icon: UserIcon, href: "/app", desc: "Quero conhecer pessoas" },
  { key: "establishment", label: "Estabelecimento", icon: Building2, href: "/estabelecimento", desc: "Sou um bar / restaurante" },
  { key: "sales", label: "Comercial", icon: Briefcase, href: "/comercial", desc: "Vendo planos a estabelecimentos" },
  { key: "admin", label: "Administrador", icon: ShieldCheck, href: "/admin", desc: "Gerencio a plataforma" },
];

export default function LoginPage() {
  const [role, setRole] = useState<Role>("user");
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
          <h1 className="text-2xl font-black tracking-tight text-text">Bem-vindo de volta</h1>
          <p className="text-sm text-text-soft">Entre com sua conta para continuar</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
            Entrar como
          </p>
          <div className="mb-5 grid grid-cols-2 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.key;
              return (
                <motion.button
                  key={r.key}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setRole(r.key)}
                  className={cn(
                    "relative flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-all",
                    active ? "border-brand bg-brand/10" : "border-border bg-surface-2 hover:border-brand/40"
                  )}
                >
                  <div
                    className={cn(
                      "grid size-8 place-items-center rounded-lg",
                      active ? "bg-brand text-white" : "bg-surface-3 text-brand"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">{r.label}</p>
                    <p className="text-[0.65rem] text-text-soft">{r.desc}</p>
                  </div>
                  {active && (
                    <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand" />
                  )}
                </motion.button>
              );
            })}
          </div>

          <form action={signInAction} onSubmit={() => setLoading(true)} className="flex flex-col gap-3">
            <input type="hidden" name="role" value={role} />
            <Field label="E-mail">
              <Input name="email" type="email" placeholder="seuemail@exemplo.com" required />
            </Field>
            <Field label="Senha">
              <Input name="password" type="password" placeholder="••••••••" required />
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
        </div>

        <p className="mt-5 text-center text-sm text-text-soft">
          Novo por aqui?{" "}
          <Link href="/cadastro" className="font-bold text-brand hover:underline">
            Criar conta
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
