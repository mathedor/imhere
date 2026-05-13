import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Download,
  Mail,
  Newspaper,
  Phone,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Press kit · I'm Here",
  description:
    "Material de imprensa: sobre o I'm Here, números, contato, depoimentos e identidade visual.",
};

const facts = [
  { icon: Users, value: "12k+", label: "usuários ativos na beta" },
  { icon: Building2, value: "480", label: "estabelecimentos cadastrados" },
  { icon: TrendingUp, value: "+340%", label: "engajamento médio reportado" },
  { icon: Target, value: "Litoral SC", label: "região de lançamento" },
];

const milestones = [
  { date: "2026-02", text: "Beta privada aberta no Litoral SC" },
  { date: "2026-03", text: "Primeiros 100 estabelecimentos parceiros" },
  { date: "2026-04", text: "Sistema de fidelidade automática lançado" },
  { date: "2026-05", text: "Stories ao vivo + match contextual + análise de afinidade" },
];

const pitches = [
  {
    title: "O problema",
    body: "Apps de relacionamento sumiram com o presencial. Galera passa horas conversando online com gente que nunca encontra. Bares e baladas perdem oportunidades de conexão real e nem sabem quem volta.",
  },
  {
    title: "A solução",
    body: "I'm Here é um app de check-in social: você só conversa com quem está no mesmo lugar que você. Pro estabelecimento, é um CRM noturno com dashboard de presença, stories ao vivo e fidelidade automática.",
  },
  {
    title: "Por que agora",
    body: "Pós-pandemia, a galera valoriza presencial mais que nunca. Apps de relacionamento estão em queda livre. Bares precisam de canais novos pra fidelizar — e que sirvam ao próprio cliente.",
  },
];

const quotes = [
  {
    text: "Quadruplicamos o engajamento do nosso Instagram desde que postamos no I'm Here. Os clientes voltam só pra ver quem mais tá lá.",
    author: "Lume Rooftop · Itajaí",
  },
  {
    text: "Conheci meu atual namorado num check-in no Bravo Mar. A gente já estava no mesmo lugar 3x antes mas só rolou conversa pelo app.",
    author: "Letícia M. · usuária",
  },
];

export default function ImprensaPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-bg/80 px-5 py-4 backdrop-blur-md md:px-10">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-soft hover:text-text"
        >
          <ArrowLeft className="size-3.5" />
          Voltar ao site
        </Link>
      </header>

      <section className="px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="rounded-pill bg-brand/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-brand">
            <Newspaper className="mr-1 inline size-3" />
            Imprensa
          </span>
          <h1 className="mt-4 text-balance text-4xl font-black tracking-tight text-text md:text-6xl">
            Material para jornalistas e parceiros
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-soft md:text-lg">
            Tudo que você precisa pra escrever sobre o I&apos;m Here: descrição, números, fotos e
            contato direto com o time.
          </p>
        </div>
      </section>

      <section className="px-5 pb-12 md:px-10 md:pb-20">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
          {facts.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="rounded-2xl border border-border bg-surface p-4 text-center"
              >
                <Icon className="mx-auto size-5 text-brand" />
                <p className="mt-2 text-2xl font-black text-text md:text-3xl">{f.value}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted">{f.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-black text-text md:text-3xl">Sobre o I&apos;m Here</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {pitches.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-brand/15 text-brand">
                  <Sparkles className="size-4" />
                </span>
                <h3 className="mt-3 text-base font-extrabold text-text">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface/40 px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-black text-text md:text-3xl">Linha do tempo</h2>
          <ul className="mt-6 flex flex-col gap-3">
            {milestones.map((m) => (
              <li
                key={m.date}
                className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <span className="shrink-0 rounded-pill bg-brand/15 px-3 py-1 text-xs font-bold text-brand">
                  {m.date}
                </span>
                <p className="text-sm text-text">{m.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-black text-text md:text-3xl">Citações curtas</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {quotes.map((q, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
              >
                <Quote className="size-5 text-brand" />
                <p className="text-sm leading-relaxed text-text">&ldquo;{q.text}&rdquo;</p>
                <p className="border-t border-border pt-3 text-xs font-bold text-text-soft">
                  {q.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-black text-text md:text-3xl">Identidade visual</h2>
          <p className="mt-2 text-sm text-text-soft">
            Use o logo e cores oficiais. Para versões em vetor ou pacote completo, escreva pro
            time de imprensa.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow">
                <Logo size={32} />
              </div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">Logo</p>
            </div>
            <ColorSwatch hex="#ef2c39" name="Brand" />
            <ColorSwatch hex="#dc1f2b" name="Brand strong" />
            <ColorSwatch hex="#0a0a0b" name="Background" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/icon-512.png"
              download
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text hover:border-brand/40"
            >
              <Download className="size-3.5" />
              Logo PNG (512px)
            </a>
            <a
              href="/og.png"
              download
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text hover:border-brand/40"
            >
              <Download className="size-3.5" />
              OG image (1200×630)
            </a>
          </div>
        </div>
      </section>

      <section className="bg-surface/40 px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/10 via-surface to-surface p-8">
          <h2 className="text-2xl font-black text-text md:text-3xl">Contato pra imprensa</h2>
          <p className="text-sm text-text-soft">
            Entrevistas, dados adicionais, demonstração ao vivo. Resposta em até 24h.
          </p>
          <div className="flex flex-col gap-2 text-sm text-text">
            <a
              href="mailto:imprensa@imhere.app"
              className="inline-flex items-center gap-2 hover:text-brand"
            >
              <Mail className="size-4 text-brand" />
              imprensa@imhere.app
            </a>
            <a
              href="https://wa.me/5547999999999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-brand"
            >
              <Phone className="size-4 text-brand" />
              WhatsApp (47) 99999-9999
            </a>
          </div>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
          >
            Conhecer o produto
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 md:px-10">
        <div className="mx-auto max-w-3xl text-center text-xs text-text-soft">
          © {new Date().getFullYear()} I&apos;m Here · Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}

function ColorSwatch({ hex, name }: { hex: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4">
      <div
        className="size-16 rounded-2xl border border-border"
        style={{ background: hex }}
        aria-hidden
      />
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">{name}</p>
      <p className="text-[0.65rem] font-mono text-text-soft">{hex}</p>
    </div>
  );
}
