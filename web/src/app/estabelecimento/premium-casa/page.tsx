"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Check,
  Crown,
  Image as ImageIcon,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { cn } from "@/lib/utils";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

interface CasaPerk {
  id: string;
  title: string;
  desc: string;
  benefit: string;
  monthly: number;
  icon: typeof MessageCircle;
  color: string;
  active?: boolean;
  popular?: boolean;
}

const PERKS: CasaPerk[] = [
  {
    id: "chat-free",
    title: "Chat livre na casa",
    desc: "Qualquer usuário com check-in aqui pode iniciar conversas sem precisar de plano",
    benefit: "Aumento médio de 38% em conexões no local",
    monthly: 290,
    icon: MessageCircle,
    color: "#ef2c39",
    active: true,
    popular: true,
  },
  {
    id: "media-free",
    title: "Foto e áudio liberados",
    desc: "Compartilhar mídia no chat fica grátis dentro do seu estabelecimento",
    benefit: "Conversas duram 2x mais com mídia",
    monthly: 190,
    icon: ImageIcon,
    color: "#3b82f6",
  },
  {
    id: "boost",
    title: "Boost de visibilidade",
    desc: "Seu estabelecimento aparece destacado no topo da lista para usuários a até 5km",
    benefit: "+72% de novos check-ins nos primeiros 30 dias",
    monthly: 490,
    icon: Zap,
    color: "#f59e0b",
    popular: true,
  },
  {
    id: "verified",
    title: "Selo de verificado",
    desc: "Selo azul no perfil + destaque nas buscas + presença em curadorias do app",
    benefit: "Aumento de 24% em rating médio",
    monthly: 390,
    icon: Shield,
    color: "#22c55e",
  },
  {
    id: "stories-extra",
    title: "Stories ilimitados",
    desc: "Stories No Momento sem limite diário e duram 12h ao invés de 4h",
    benefit: "Cobertura contínua do evento da noite",
    monthly: 150,
    icon: Camera,
    color: "#a855f7",
  },
  {
    id: "analytics",
    title: "Analytics avançado",
    desc: "Demografia detalhada, picos de horário, retenção e funil completo",
    benefit: "Tome decisões baseadas em dados reais",
    monthly: 220,
    icon: Star,
    color: "#06b6d4",
  },
];

export default function PremiumCasaPage() {
  const [active, setActive] = useState<string[]>(["chat-free"]);

  function toggle(id: string) {
    setActive((curr) => (curr.includes(id) ? curr.filter((c) => c !== id) : [...curr, id]));
  }

  const total = PERKS.filter((p) => active.includes(p.id)).reduce((a, p) => a + p.monthly, 0);

  return (
    <PanelLayout
      scope="estabelecimento"
      title="Premium da Casa"
      subtitle="Features que você compra e libera grátis a TODOS os usuários com check-in aqui"
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Carla Pires", role: "Gerente" }}
    >
      <section className="mb-6 overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent p-5 md:p-7">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-strong to-brand text-white shadow-glow">
            <Crown className="size-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black tracking-tight text-text md:text-2xl">
              Liberar features para seus clientes = mais conexões = mais retorno
            </h2>
            <p className="mt-1 text-sm text-text-soft">
              Você paga uma assinatura, e cada usuário com check-in ativo aqui ganha o benefício de graça,
              sem precisar assinar nada. Diferencial competitivo enorme.
            </p>
          </div>
          <div className="text-right md:min-w-40">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Investimento atual</p>
            <p className="text-3xl font-black text-text">
              R$ {total.toFixed(0)}<span className="text-base text-muted">/mês</span>
            </p>
            <p className="text-[0.65rem] text-text-soft">
              {active.length} benefício{active.length !== 1 ? "s" : ""} ativo{active.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PERKS.map((p, i) => {
          const Icon = p.icon;
          const isActive = active.includes(p.id);
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              onClick={() => toggle(p.id)}
              className={cn(
                "relative flex flex-col gap-4 rounded-2xl border p-5 text-left transition-all",
                isActive
                  ? "border-brand bg-brand/5 shadow-glow"
                  : "border-border bg-surface hover:border-brand/40"
              )}
            >
              {p.popular && (
                <span className="absolute right-3 top-3 rounded-pill bg-brand/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-brand">
                  Popular
                </span>
              )}

              <div
                className="grid size-11 place-items-center rounded-xl"
                style={{ background: `${p.color}25`, color: p.color }}
              >
                <Icon className="size-5" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-text">{p.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-soft">{p.desc}</p>
              </div>

              <div className="flex items-start gap-1.5 rounded-xl bg-success/10 p-2.5">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-success" />
                <p className="text-[0.7rem] font-semibold text-success leading-tight">{p.benefit}</p>
              </div>

              <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">por mês</p>
                  <p className="text-xl font-black text-text">
                    R$ {p.monthly.toFixed(0)}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-pill px-3 py-1.5 text-xs font-bold transition-all",
                    isActive
                      ? "bg-success text-white"
                      : "bg-surface-2 text-text-soft"
                  )}
                >
                  {isActive ? (
                    <>
                      <Check className="size-3.5" />
                      Ativo
                    </>
                  ) : (
                    "Ativar"
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <Users className="size-5 text-brand" />
          <h2 className="text-sm font-bold text-text">Impacto esperado nos próximos 30 dias</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Check-ins extras", value: "+340", color: "#22c55e" },
            { label: "Conexões/dia", value: "+58", color: "#3b82f6" },
            { label: "Retorno semanal", value: "+22%", color: "#a855f7" },
            { label: "Avaliação média", value: "+0.3", color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-surface-2 px-3 py-3">
              <p className="text-2xl font-black" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PanelLayout>
  );
}
