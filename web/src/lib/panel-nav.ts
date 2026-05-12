import {
  BarChart3,
  Briefcase,
  Building2,
  Camera,
  CircleDollarSign,
  Crown,
  FileBarChart,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { PanelNavItem } from "@/components/panel/PanelLayout";
import type { PanelQuickItem } from "@/components/panel/PanelBottomNav";

// ============================================================
// ADMIN
// ============================================================

export const NAV_ADMIN: PanelNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, badge: "12k" },
  { href: "/admin/estabelecimentos", label: "Estabelecimentos", icon: Building2, badge: 480 },
  { href: "/admin/vendas", label: "Vendas & assinaturas", icon: CircleDollarSign },
  { href: "/admin/comerciais", label: "Comerciais", icon: Briefcase },
  { href: "/admin/planos", label: "Planos", icon: Crown },
  { href: "/admin/creditos", label: "Créditos", icon: Sparkles },
  { href: "/admin/moderacao", label: "Moderação", icon: ShieldCheck, badge: 4 },
  { href: "/admin/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

export const QUICK_ADMIN: PanelQuickItem[] = [
  { href: "/admin", label: "Dash", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/estabelecimentos", label: "Estabs", icon: Building2 },
  { href: "/admin/planos", label: "Planos", icon: Crown },
];

// ============================================================
// ESTABELECIMENTO
// ============================================================

export const NAV_ESTAB: PanelNavItem[] = [
  { href: "/estabelecimento", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estabelecimento/perfil", label: "Perfil & itens", icon: Sparkles },
  { href: "/estabelecimento/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/estabelecimento/pessoas", label: "Pessoas no local", icon: Users, badge: 187 },
  { href: "/estabelecimento/momento", label: "No Momento", icon: Camera, badge: "NEW" },
  { href: "/estabelecimento/cortesias", label: "Mensagens & cortesias", icon: Gift, badge: 3 },
  { href: "/estabelecimento/premium-casa", label: "Premium da Casa", icon: Crown },
  { href: "/estabelecimento/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/estabelecimento/avaliacoes", label: "Avaliações", icon: Star },
];

export const QUICK_ESTAB: PanelQuickItem[] = [
  { href: "/estabelecimento/pessoas", label: "Online", icon: Users, badge: 187 },
  { href: "/estabelecimento/momento", label: "Postar", icon: Camera, highlight: true },
  { href: "/estabelecimento/premium-casa", label: "Premium", icon: Crown },
  { href: "/estabelecimento/cortesias", label: "Cortesias", icon: Gift, badge: 3 },
];

// ============================================================
// COMERCIAL
// ============================================================

export const NAV_COMERCIAL: PanelNavItem[] = [
  { href: "/comercial", label: "Dashboard", icon: LayoutDashboard },
  { href: "/comercial/estabelecimentos", label: "Meus estab.", icon: Building2, badge: 19 },
  { href: "/comercial/novo", label: "Cadastrar novo", icon: Plus },
  { href: "/comercial/pipeline", label: "Pipeline", icon: Target, badge: 7 },
  { href: "/comercial/comissoes", label: "Comissões", icon: CircleDollarSign },
  { href: "/comercial/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/comercial/clientes", label: "Contatos", icon: Users },
];

export const QUICK_COMERCIAL: PanelQuickItem[] = [
  { href: "/comercial", label: "Dash", icon: LayoutDashboard },
  { href: "/comercial/novo", label: "Novo", icon: Plus, highlight: true },
  { href: "/comercial/pipeline", label: "Pipeline", icon: Target, badge: 7 },
  { href: "/comercial/comissoes", label: "Comissão", icon: CircleDollarSign },
];
