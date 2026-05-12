"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const features = [
  {
    icon: MapPin,
    title: "Veja quem está perto",
    desc: "Geolocalização inteligente mostra os lugares mais movimentados ao seu redor.",
    color: "#ef2c39",
  },
  {
    icon: Users,
    title: "Check-in social",
    desc: "Mostre que você está em algum lugar e descubra quem mais está por lá agora.",
    color: "#3b82f6",
  },
  {
    icon: MessageCircle,
    title: "Conversa só presencial",
    desc: "Só fala quem está no mesmo lugar. Conexões verdadeiras, no momento certo.",
    color: "#22c55e",
  },
  {
    icon: Shield,
    title: "Seguro e moderado",
    desc: "Anti-palavrões, anti-spam e cadastro verificado. Comunidade saudável.",
    color: "#a855f7",
  },
];

const stats = [
  { value: "12k+", label: "usuários ativos" },
  { value: "480", label: "estabelecimentos" },
  { value: "98%", label: "satisfação" },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-bg/80 px-5 py-4 backdrop-blur-md md:px-10">
        <Logo />
        <nav className="hidden items-center gap-5 md:flex">
          <a href="#features" className="text-sm text-text-soft hover:text-text">
            Como funciona
          </a>
          <a href="#planos" className="text-sm text-text-soft hover:text-text">
            Planos
          </a>
          <Link href="/login" className="text-sm text-text-soft hover:text-text">
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-pill bg-gradient-to-r from-brand-strong to-brand px-4 py-2 text-sm font-bold text-white shadow-glow"
          >
            Criar conta
          </Link>
        </nav>
        <Link
          href="/login"
          className="md:hidden rounded-pill bg-brand px-3 py-1.5 text-xs font-bold text-white"
        >
          Entrar
        </Link>
      </header>

      <section className="relative overflow-hidden px-5 pt-12 pb-16 md:px-10 md:pt-20 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center"
        >
          <span className="rounded-pill border border-brand/30 bg-brand/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-brand">
            <Sparkles className="mr-1 inline size-3" />
            Beta aberto — convide amigos
          </span>

          <h1 className="text-5xl font-black tracking-tight text-text text-balance md:text-7xl">
            Quem está <span className="text-brand">aqui</span> agora?
          </h1>

          <p className="max-w-2xl text-base text-text-soft md:text-lg">
            O primeiro app de check-in social em bares, restaurantes e baladas. Veja quem está,
            converse com gente real, no momento certo.
          </p>

          <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row">
            <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }}>
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
              >
                Criar conta grátis
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
            <Link
              href="/app"
              className="rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-bold text-text transition-colors hover:border-brand/40"
            >
              Ver demo →
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-text-soft">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-warn text-warn" />
            ))}
            <span className="ml-1.5">4.9 · 2.418 avaliações</span>
          </div>

          <div className="mt-8 flex w-full justify-center gap-8 border-t border-border pt-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-3xl font-black text-text md:text-4xl">{s.value}</span>
                <span className="text-[0.65rem] uppercase tracking-wider text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-20 left-1/2 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
        />
      </section>

      <section id="features" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Como funciona
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-text text-balance md:text-5xl">
              Conexões reais no momento certo
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-brand/40"
                >
                  <div
                    className="grid size-12 place-items-center rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`,
                      color: f.color,
                    }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-text">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-text-soft">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent p-8 text-center md:p-12">
          <Heart className="size-10 text-brand" />
          <h2 className="text-3xl font-black tracking-tight text-text text-balance md:text-4xl">
            Já está acontecendo. Você não pode ficar de fora.
          </h2>
          <p className="max-w-xl text-sm text-text-soft md:text-base">
            Cadastro grátis em 30 segundos. Cancele quando quiser. Brasil inteiro.
          </p>
          <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
              >
                Quero entrar
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
            <span className="flex items-center gap-1 text-xs text-text-soft">
              <CheckCircle2 className="size-3.5 text-success" />
              Sem cartão · Sem pegadinha
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <Logo size={28} />
          <p className="text-xs text-text-soft">
            © {new Date().getFullYear()} I&apos;m Here · Todos os direitos reservados
          </p>
          <div className="flex gap-4 text-xs text-text-soft">
            <Link href="#">Termos</Link>
            <Link href="#">Privacidade</Link>
            <Link href="#">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
