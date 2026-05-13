"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  Quote,
  Sparkles,
  Star,
  Store,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const userFeatures = [
  {
    icon: MapPin,
    title: "Veja quem está perto",
    desc: "Geolocalização inteligente mostra os lugares mais movimentados ao seu redor agora.",
  },
  {
    icon: Users,
    title: "Check-in social",
    desc: "Mostre que você tá em algum lugar e descubra quem mais está por lá no momento.",
  },
  {
    icon: MessageCircle,
    title: "Conversa só presencial",
    desc: "Só fala quem está no mesmo lugar. Conexões verdadeiras, no momento certo.",
  },
];

const estabFeatures = [
  {
    icon: BarChart3,
    title: "Dashboard de presença",
    desc: "Veja quem tá no seu lugar agora, idade, gênero, retorno e padrões de visita.",
  },
  {
    icon: Sparkles,
    title: "Stories em tempo real",
    desc: "Poste fotos do clima do seu local. Notifica push pra frequentadores e quem tá perto.",
  },
  {
    icon: Gift,
    title: "Fidelidade automática",
    desc: "Cliente faz 5 check-ins, ganha brinde. Você vê o LTV de cada cliente no painel.",
  },
];

const userPlans = [
  {
    name: "Free",
    price: "Grátis",
    desc: "Para começar",
    features: [
      "Check-in ilimitado",
      "Veja quem está no local",
      "1 contato por dia",
      "Notificações de match",
    ],
    cta: "Criar conta grátis",
    highlight: false,
  },
  {
    name: "Premium",
    price: "R$ 19/mês",
    desc: "Mais conexões",
    features: [
      "Contatos ilimitados",
      "Veja quem visitou seu perfil",
      "Modo invisível",
      "Badge ✓ verificado",
      "Story view priority",
    ],
    cta: "Assinar Premium",
    highlight: true,
  },
];

const estabPlans = [
  {
    name: "Starter",
    price: "R$ 99/mês",
    desc: "Bares pequenos",
    features: [
      "Painel de presença",
      "1 story / dia",
      "Cardápio digital QR",
      "Até 500 check-ins/mês",
    ],
    cta: "Cadastrar lugar",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 249/mês",
    desc: "Mais visibilidade",
    features: [
      "Tudo do Starter",
      "Stories ilimitados + agendados",
      "Broadcast pra frequentadores",
      "Fidelidade automática",
      "Cortesias e cupons",
      "Boost de destaque (3x mês)",
    ],
    cta: "Falar com vendas",
    highlight: true,
  },
];

const testimonials = [
  {
    name: "Lume Rooftop",
    role: "Bar · Itajaí",
    text: "Quadruplicamos o engajamento do nosso Instagram desde que postamos no I'm Here. Os clientes voltam só pra ver quem mais tá lá.",
    color: "#ef2c39",
  },
  {
    name: "Letícia M.",
    role: "Usuária · 26 anos",
    text: "Conheci meu atual namorado num check-in no Bravo Mar. A gente já estava no mesmo lugar 3x antes mas só rolou conversa pelo app.",
    color: "#a855f7",
  },
  {
    name: "Beach Sunset",
    role: "Balada · Bal. Camboriú",
    text: "O painel mostra exatamente quem volta, em quais horários, e ajuda a programar shows e promoções na hora certa.",
    color: "#22c55e",
  },
];

const estabStats = [
  { value: "+340%", label: "engajamento no IG" },
  { value: "+62%", label: "retorno de clientes" },
  { value: "R$ 4,2k", label: "ticket extra/mês" },
];

export default function LandingPage() {
  const [planTab, setPlanTab] = useState<"user" | "estab">("user");
  const plans = planTab === "user" ? userPlans : estabPlans;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-bg/80 px-5 py-4 backdrop-blur-md md:px-10">
        <Logo />
        <nav className="hidden items-center gap-5 md:flex">
          <a href="#para-voce" className="text-sm text-text-soft hover:text-text">
            Pra você
          </a>
          <a href="#para-estab" className="text-sm text-text-soft hover:text-text">
            Pro seu lugar
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
          className="rounded-pill bg-brand px-3 py-1.5 text-xs font-bold text-white md:hidden"
        >
          Entrar
        </Link>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-5 pt-12 pb-16 md:px-10 md:pt-20 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center"
        >
          <span className="rounded-pill border border-brand/30 bg-brand/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-brand">
            <Sparkles className="mr-1 inline size-3" />
            Beta aberto · Litoral SC
          </span>

          <h1 className="text-balance text-5xl font-black tracking-tight text-text md:text-7xl">
            Quem está <span className="text-brand">aqui</span> agora?
          </h1>

          <p className="max-w-2xl text-base text-text-soft md:text-lg">
            Check-in social em bares, restaurantes e baladas. Veja quem está, converse com gente real,
            no lugar onde você já está.
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
              href="#para-estab"
              className="rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-bold text-text transition-colors hover:border-brand/40"
            >
              Tenho um estabelecimento →
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-text-soft">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-warn text-warn" />
            ))}
            <span className="ml-1.5">4.9 · 2.418 avaliações na beta</span>
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-20 left-1/2 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
        />
      </section>

      {/* DOIS CAMINHOS */}
      <section className="px-5 py-10 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group flex flex-col gap-3 rounded-3xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-2xl"
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-brand/15 text-brand">
              <UserCircle className="size-6" />
            </div>
            <h3 className="text-xl font-extrabold text-text">Eu uso pra sair</h3>
            <p className="text-sm text-text-soft">
              Descubra o que tá rolando agora, faça check-in, converse só com quem está no mesmo lugar.
              Cadastro grátis em 30s.
            </p>
            <Link
              href="/cadastro"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand"
            >
              Criar conta grátis <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group flex flex-col gap-3 rounded-3xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-2xl"
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-warn/15 text-warn">
              <Store className="size-6" />
            </div>
            <h3 className="text-xl font-extrabold text-text">Tenho um estabelecimento</h3>
            <p className="text-sm text-text-soft">
              Dashboard de presença, stories ao vivo, fidelidade e CRM dos seus frequentadores.
              Bar, restaurante, balada.
            </p>
            <Link
              href="/cadastro?role=estab"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand"
            >
              Cadastrar meu lugar <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* PARA VOCÊ */}
      <section id="para-voce" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Pra quem sai
            </span>
            <h2 className="mt-2 text-balance text-3xl font-black tracking-tight text-text md:text-5xl">
              Conexões reais no momento certo
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {userFeatures.map((f, i) => {
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
                  <div className="grid size-12 place-items-center rounded-2xl bg-brand/15 text-brand">
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

      {/* COMO FUNCIONA - 3 PASSOS */}
      <section className="bg-surface/40 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Como funciona
            </span>
            <h2 className="mt-2 text-balance text-3xl font-black tracking-tight text-text md:text-4xl">
              Três passos. Dez segundos.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { n: "1", title: "Você chega num lugar", desc: "Toca em check-in. Ninguém precisa saber sua localização exata, só o estab." },
              { n: "2", title: "Vê quem mais está", desc: "Galera presente agora, com perfil aberto à conversa. Filtro por interesse." },
              { n: "3", title: "Conecta ali mesmo", desc: "Manda contato pelo app, papo rola se a outra pessoa aceitar. Tudo no momento." },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-start gap-3"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-strong to-brand text-2xl font-black text-white shadow-glow">
                  {step.n}
                </span>
                <h3 className="text-xl font-extrabold text-text">{step.title}</h3>
                <p className="text-sm text-text-soft">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA ESTABELECIMENTO */}
      <section id="para-estab" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col items-center text-center">
            <span className="rounded-pill bg-warn/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-warn">
              <Store className="mr-1 inline size-3" />
              Pra bares, restaurantes e baladas
            </span>
            <h2 className="mt-3 text-balance text-3xl font-black tracking-tight text-text md:text-5xl">
              Mais que cadastro. Um <span className="text-brand">CRM noturno</span>.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-text-soft md:text-base">
              Veja quem entra, quem volta, quem indica. Dispare promoções segmentadas. Reduza
              ociosidade em dia parado.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-3 rounded-3xl border border-border bg-surface p-4 md:p-6">
            {estabStats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <span className="text-2xl font-black text-brand md:text-4xl">{s.value}</span>
                <span className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted md:text-xs">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {estabFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-warn/40"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-warn/15 text-warn">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-text">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-text-soft">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-warn/30 bg-gradient-to-br from-warn/10 via-warn/5 to-transparent p-6 text-center md:flex-row md:justify-between md:p-8 md:text-left">
            <div>
              <h3 className="text-lg font-black text-text md:text-xl">Quer trazer seu lugar?</h3>
              <p className="text-sm text-text-soft">Cadastro em minutos. 14 dias grátis. Sem fidelidade.</p>
            </div>
            <Link
              href="/cadastro?role=estab"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-warn to-brand px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
            >
              Cadastrar meu lugar
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-surface/40 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Quem usa
            </span>
            <h2 className="mt-2 text-balance text-3xl font-black tracking-tight text-text md:text-4xl">
              Já tá rolando
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-6"
              >
                <Quote className="size-6" style={{ color: t.color }} />
                <p className="text-sm text-text">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-2 flex items-center gap-3 border-t border-border pt-3">
                  <div
                    className="grid size-9 place-items-center rounded-xl text-sm font-black text-white"
                    style={{ background: t.color }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-text">{t.name}</p>
                    <p className="text-[0.7rem] text-text-soft">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">Planos</span>
            <h2 className="mt-2 text-balance text-3xl font-black tracking-tight text-text md:text-4xl">
              Simples e justo
            </h2>
            <p className="mt-2 text-sm text-text-soft">
              Cancele quando quiser. Sem multa, sem pegadinha.
            </p>

            <div className="mt-6 inline-flex rounded-pill border border-border bg-surface p-1">
              <button
                onClick={() => setPlanTab("user")}
                className={`rounded-pill px-4 py-2 text-xs font-bold transition-colors ${
                  planTab === "user" ? "bg-brand text-white shadow-glow" : "text-text-soft"
                }`}
              >
                <UserCircle className="mr-1 inline size-3.5" />
                Pra você
              </button>
              <button
                onClick={() => setPlanTab("estab")}
                className={`rounded-pill px-4 py-2 text-xs font-bold transition-colors ${
                  planTab === "estab" ? "bg-brand text-white shadow-glow" : "text-text-soft"
                }`}
              >
                <Store className="mr-1 inline size-3.5" />
                Pro estabelecimento
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col gap-3 rounded-3xl border p-6 ${
                  p.highlight
                    ? "border-brand bg-gradient-to-br from-brand/10 via-surface to-surface shadow-glow"
                    : "border-border bg-surface"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 rounded-pill bg-brand px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                    Mais popular
                  </span>
                )}
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black text-text">{p.name}</h3>
                  <span className="text-xl font-black text-brand">{p.price}</span>
                </div>
                <p className="text-xs text-text-soft">{p.desc}</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={planTab === "user" ? "/cadastro" : "/cadastro?role=estab"}
                  className={`mt-4 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold uppercase tracking-wider ${
                    p.highlight
                      ? "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
                      : "border border-border bg-surface text-text"
                  }`}
                >
                  {p.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent p-8 text-center md:p-12">
          <Heart className="size-10 text-brand" />
          <h2 className="text-balance text-3xl font-black tracking-tight text-text md:text-4xl">
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
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-soft">
            <Link href="/imprensa" className="hover:text-text">
              Imprensa
            </Link>
            <Link href="#" className="hover:text-text">
              Termos
            </Link>
            <Link href="#" className="hover:text-text">
              Privacidade
            </Link>
            <Link href="#" className="hover:text-text">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
