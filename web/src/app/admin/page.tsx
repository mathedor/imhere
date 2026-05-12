import Link from "next/link";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  return (
    <PanelLayout
      scope="admin"
      title="Painel Admin"
      subtitle="Dashboard simplificado · sub-rotas no menu lateral"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <section className="mb-6 rounded-3xl border border-success/30 bg-success/10 p-6 text-center">
        <h2 className="text-xl font-black text-text">✓ Painel carregando normalmente</h2>
        <p className="mt-2 text-sm text-text-soft">
          O dashboard com KPIs está temporariamente desabilitado enquanto a gente
          investiga um erro de produção. Use o menu lateral pra acessar as outras seções.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/usuarios", label: "Usuários", desc: "Gerenciar contas" },
          { href: "/admin/estabelecimentos", label: "Estabelecimentos", desc: "Catálogo de lugares" },
          { href: "/admin/vendas", label: "Vendas & Assinaturas", desc: "Receita e churn" },
          { href: "/admin/comerciais", label: "Comerciais", desc: "Equipe de vendas" },
          { href: "/admin/planos", label: "Planos", desc: "Editar planos" },
          { href: "/admin/creditos", label: "Créditos", desc: "Preços e pacotes" },
          { href: "/admin/moderacao", label: "Moderação", desc: "Filas de revisão" },
          { href: "/admin/relatorios", label: "Relatórios", desc: "Análises completas" },
          { href: "/admin/config", label: "Configurações", desc: "Sistema" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-glow"
          >
            <p className="text-base font-bold text-text">{item.label}</p>
            <p className="mt-1 text-xs text-text-soft">{item.desc}</p>
            <span className="mt-2 inline-block text-xs font-bold text-brand opacity-0 transition-opacity group-hover:opacity-100">
              Abrir →
            </span>
          </Link>
        ))}
      </section>
    </PanelLayout>
  );
}
