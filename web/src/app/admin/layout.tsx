import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CircleDollarSign,
  Crown,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AdminSidebarToggle } from "@/components/admin/AdminSidebarToggle";
import { Logo } from "@/components/Logo";
import { signOutAction } from "@/lib/auth/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/estabelecimentos", label: "Estabelecimentos", icon: Building2 },
  { href: "/admin/vendas", label: "Vendas", icon: CircleDollarSign },
  { href: "/admin/comerciais", label: "Comerciais", icon: Briefcase },
  { href: "/admin/planos", label: "Planos", icon: Crown },
  { href: "/admin/creditos", label: "Créditos", icon: Sparkles },
  { href: "/admin/moderacao", label: "Moderação", icon: ShieldCheck },
  { href: "/admin/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-3 px-1">
        <Logo size={28} compact />
      </div>

      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-white shadow-glow">
        Administração
      </span>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-text-soft transition-all hover:bg-surface-2 hover:text-text"
            >
              <Icon className="size-4 shrink-0 transition-colors group-hover:text-brand" />
              <span className="flex-1 font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={signOutAction} className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-sm transition-colors hover:border-brand/40"
        >
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-strong to-brand text-white">
            <LogOut className="size-4" />
          </div>
          <div className="flex-1 text-left leading-tight">
            <p className="text-xs font-bold text-text">Sair</p>
            <p className="text-[0.65rem] text-muted">Encerrar sessão</p>
          </div>
        </button>
      </form>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-surface/40 backdrop-blur-sm md:flex">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/85 px-5 py-3 backdrop-blur-md md:px-8">
          <AdminSidebarToggle>
            <Sidebar />
          </AdminSidebarToggle>
          <Link href="/admin" className="flex items-center gap-2 md:hidden">
            <Logo size={26} compact />
          </Link>
          <div className="hidden flex-1 md:block">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
              Painel Admin
            </span>
          </div>
          <Link
            href="/admin/notificacoes"
            className="grid size-9 place-items-center rounded-xl border border-border text-text-soft hover:text-text"
            aria-label="Notificações"
          >
            <Bell className="size-4" />
          </Link>
          <Link
            href="/admin/relatorios"
            className="hidden items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-3 py-2 text-xs font-bold text-white shadow-glow md:flex"
          >
            <BarChart3 className="size-3.5" />
            Relatórios
          </Link>
        </header>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
