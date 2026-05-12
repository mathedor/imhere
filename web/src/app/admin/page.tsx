import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-dvh bg-bg p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-black text-text">Painel Admin</h1>
          <p className="mt-1 text-sm text-text-soft">
            Modo simplificado · sem PanelLayout enquanto investigamos o erro
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { href: "/admin/usuarios", label: "Usuários" },
            { href: "/admin/estabelecimentos", label: "Estabelecimentos" },
            { href: "/admin/vendas", label: "Vendas & Assinaturas" },
            { href: "/admin/comerciais", label: "Comerciais" },
            { href: "/admin/planos", label: "Planos" },
            { href: "/admin/creditos", label: "Créditos" },
            { href: "/admin/moderacao", label: "Moderação" },
            { href: "/admin/relatorios", label: "Relatórios" },
            { href: "/admin/config", label: "Configurações" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
            >
              <p className="font-bold text-text">{item.label}</p>
              <p className="mt-1 text-xs text-brand">Abrir →</p>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-text-soft">
          Login funcionando · clique numa seção pra continuar
        </p>
      </div>
    </div>
  );
}
