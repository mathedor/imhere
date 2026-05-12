"use client";

import { motion } from "framer-motion";
import { CreditCard, Database, Globe, Key, Save, Server, Shield } from "lucide-react";
import { useState } from "react";
import { Field, Input } from "@/components/Field";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export default function ConfigPage() {
  const [saved, setSaved] = useState(false);

  return (
    <PanelLayout
      scope="admin"
      title="Configurações"
      subtitle="Configurações globais da plataforma"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <form
        onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="flex flex-col gap-5"
      >
        <Section icon={Globe} title="App" desc="Configurações gerais públicas">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome do app">
              <Input defaultValue="I'm Here" />
            </Field>
            <Field label="URL de produção">
              <Input defaultValue="https://imhere.app" />
            </Field>
            <Field label="E-mail de suporte">
              <Input type="email" defaultValue="suporte@imhere.app" />
            </Field>
            <Field label="WhatsApp suporte">
              <Input defaultValue="(11) 99999-0000" />
            </Field>
          </div>
        </Section>

        <Section icon={Database} title="Banco de dados" desc="Supabase">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Supabase URL" hint="Read-only · alterar via Vercel env">
              <Input defaultValue="https://hnaxjcnbpfjvkiluiobt.supabase.co" disabled />
            </Field>
            <div className="flex gap-2">
              <button type="button" className="rounded-pill border border-border bg-surface-2 px-4 py-2 text-xs font-bold text-text hover:border-brand/40">
                Rodar migrations
              </button>
              <button type="button" className="rounded-pill border border-border bg-surface-2 px-4 py-2 text-xs font-bold text-text hover:border-brand/40">
                Backup agora
              </button>
            </div>
          </div>
        </Section>

        <Section icon={CreditCard} title="Pagamentos" desc="Efí Bank">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Modo">
              <select className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text">
                <option>Sandbox</option>
                <option>Produção</option>
              </select>
            </Field>
            <Field label="Chave PIX">
              <Input defaultValue="" placeholder="email/cnpj/celular" />
            </Field>
            <Field label="Webhook URL" className="md:col-span-2">
              <Input defaultValue="https://imhere-nine.vercel.app/api/webhooks/efi" />
            </Field>
          </div>
        </Section>

        <Section icon={Shield} title="Moderação" desc="Anti-spam & palavras">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Banir após N bloqueios">
              <Input type="number" defaultValue="3" />
            </Field>
            <Field label="Bloqueios resetam após (dias)">
              <Input type="number" defaultValue="30" />
            </Field>
          </div>
        </Section>

        <Section icon={Server} title="Realtime & Push" desc="Notificações em tempo real">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="VAPID Public Key" hint="Para Web Push">
              <Input placeholder="BG..." />
            </Field>
            <Field label="OneSignal App ID">
              <Input placeholder="opcional" />
            </Field>
          </div>
        </Section>

        <Section icon={Key} title="Tokens" desc="Chaves de integração externa">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Google Maps API Key">
              <Input placeholder="opcional" />
            </Field>
            <Field label="Mapbox Token">
              <Input placeholder="opcional" />
            </Field>
          </div>
        </Section>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -1 }}
          className="self-end flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
        >
          {saved ? "Salvo ✓" : (
            <>
              <Save className="size-4" />
              Salvar configurações
            </>
          )}
        </motion.button>
      </form>
    </PanelLayout>
  );
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof Globe;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-brand/15 text-brand">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text">{title}</h2>
          <p className="text-xs text-text-soft">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
