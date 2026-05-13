import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  CircleDollarSign,
  Clock,
  Crown,
  FileBarChart,
  Flame,
  Heart,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Search as SearchIcon,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOutAction } from "@/lib/auth/actions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/estabelecimentos", label: "Estabelecimentos", icon: Building2 },
  { href: "/admin/vendas", label: "Vendas", icon: CircleDollarSign },
  { href: "/admin/comerciais", label: "Comerciais", icon: Briefcase },
  { href: "/admin/planos", label: "Planos", icon: Crown },
  { href: "/admin/creditos", label: "Créditos", icon: Sparkles },
  {
    href: "/admin/moderacao",
    label: "Moderação",
    icon: ShieldCheck,
    children: [
      { href: "/admin/moderacao", label: "Denúncias", icon: ShieldCheck },
      { href: "/admin/moderacao/verificacoes", label: "Verificações", icon: UserPlus },
    ],
  },
  {
    href: "/admin/relatorios",
    label: "Relatórios",
    icon: FileBarChart,
    children: [
      { href: "/admin/relatorios", label: "Visão geral", icon: BarChart3 },
      { href: "/admin/relatorios/funil", label: "Funil aquisição", icon: Activity },
      { href: "/admin/relatorios/checkins", label: "Check-ins", icon: MapPin },
      { href: "/admin/relatorios/usuarios", label: "Novos usuários", icon: UserPlus },
      { href: "/admin/relatorios/online", label: "Online agora", icon: Activity },
      { href: "/admin/relatorios/buscas", label: "Buscas feitas", icon: SearchIcon },
      { href: "/admin/relatorios/contatos", label: "Contatos", icon: Heart },
      { href: "/admin/relatorios/generos", label: "Gêneros", icon: Users },
      { href: "/admin/relatorios/ranking-estabs", label: "Ranking estabs", icon: Trophy },
      { href: "/admin/relatorios/ranking-usuarios", label: "Ranking usuários", icon: Trophy },
      { href: "/admin/relatorios/ranking-categorias", label: "Ranking categorias", icon: Tag },
      { href: "/admin/relatorios/ranking-cidades", label: "Ranking cidades", icon: MapPin },
      { href: "/admin/relatorios/horas", label: "Hora de uso", icon: Clock },
      { href: "/admin/relatorios/heatmap", label: "Mapa de calor", icon: Flame },
      { href: "/admin/relatorios/locais", label: "Locais agregados", icon: Map },
    ],
  },
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
          if (!item.children) {
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
          }
          return (
            <details key={item.href} className="group/menu">
              <summary className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-text-soft transition-all hover:bg-surface-2 hover:text-text [&::-webkit-details-marker]:hidden">
                <Icon className="size-4 shrink-0 transition-colors group-hover/menu:text-brand" />
                <span className="flex-1 font-semibold">{item.label}</span>
                <ChevronDown className="size-3.5 transition-transform group-open/menu:rotate-180" />
              </summary>
              <ul className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
                {item.children.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-text-soft transition-colors hover:bg-surface-2 hover:text-text"
                      >
                        <SubIcon className="size-3.5 shrink-0 text-muted" />
                        <span className="font-semibold">{sub.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
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
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur-md md:px-8">
          {/* Mobile: logo · Desktop: label */}
          <Link href="/admin" className="flex items-center gap-2 md:hidden">
            <Logo size={26} compact />
          </Link>
          <div className="hidden flex-1 md:block">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
              Painel Admin
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 md:flex-initial">
            <Link
              href="/admin/notificacoes"
              className="relative grid size-9 place-items-center rounded-xl border border-border text-text-soft transition-colors hover:border-brand/40 hover:text-brand"
              aria-label="Notificações"
              title="Notificações"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand live-dot" />
            </Link>
            <ThemeToggle compact />
            <form action={signOutAction}>
              <button
                type="submit"
                className="grid size-9 place-items-center rounded-xl border border-border text-text-soft transition-colors hover:border-brand/40 hover:text-brand"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut className="size-4" />
              </button>
            </form>
            <Link
              href="/admin/relatorios"
              className="hidden items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-3 py-2 text-xs font-bold text-white shadow-glow lg:flex"
            >
              <BarChart3 className="size-3.5" />
              Relatórios
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <AdminBottomNav drawerContent={<Sidebar />} />
    </div>
  );
}
