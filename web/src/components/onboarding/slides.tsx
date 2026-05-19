import {
  AdminDashboardMockup,
  AdminReportsMockup,
  AdminUsersMockup,
  BoostMockup,
  BroadcastMockup,
  ChatMockup,
  CheckInMockup,
  ClientsListMockup,
  ComercialReportsMockup,
  CommissionMockup,
  CreditsMockup,
  EstabDashboardMockup,
  EstabPeopleMockup,
  EstabReportsMockup,
  LoyaltyMockup,
  ModerationMockup,
  NewClientMockup,
  NotificationsMockup,
  PeopleMockup,
  PipelineMockup,
  PlansMockup,
  ProfileMockup,
} from "./mockups";

export type OnboardingRole = "user" | "estabelecimento" | "comercial" | "admin";

export interface OnboardingSlide {
  title: string;
  desc: string;
  mockup: React.ComponentType;
}

export interface RoleOnboardingConfig {
  label: string;
  storageKey: string;
  primary: string;
  slides: OnboardingSlide[];
}

export const ONBOARDING_CONFIG: Record<OnboardingRole, RoleOnboardingConfig> = {
  user: {
    label: "Como usar o I'm Here",
    storageKey: "imhere-onboarding-user-seen",
    primary: "from-brand-strong via-brand to-brand-soft",
    slides: [
      {
        title: "Diga onde você está",
        desc: "Chegou no bar, balada ou restaurante? Toque em ‘Estou aqui’. Seu perfil entra na lista do lugar e some quando você sai.",
        mockup: CheckInMockup,
      },
      {
        title: "Veja quem mais tá no rolê",
        desc: "Sem rolar feed infinito. Só aparece quem está AGORA no mesmo lugar que você. Filtre por idade, vibe, status.",
        mockup: PeopleMockup,
      },
      {
        title: "Mande um oi sem cringe",
        desc: "Curtiu alguém? Manda pedido de contato. Se a pessoa aceitar, o chat libera. Aí é com você no offline.",
        mockup: ChatMockup,
      },
      {
        title: "Créditos pra liberar extras",
        desc: "Filtros avançados, boost de visibilidade, ver quem visitou seu perfil. Você compra pacotes e usa quando quiser.",
        mockup: CreditsMockup,
      },
      {
        title: "Seu perfil é seu rosto",
        desc: "Foto real, idade e uma vibe rápida. Verifique pra ganhar o selo azul e mais confiança da galera.",
        mockup: ProfileMockup,
      },
    ],
  },
  estabelecimento: {
    label: "Painel do estabelecimento",
    storageKey: "imhere-onboarding-estab-seen",
    primary: "from-[#3b82f6] to-[#1d4ed8]",
    slides: [
      {
        title: "Seu painel em tempo real",
        desc: "Veja quantas pessoas estão no seu local agora, ranking da semana, sua nota média. Tudo na primeira tela.",
        mockup: EstabDashboardMockup,
      },
      {
        title: "Quem está aqui agora",
        desc: "Lista ao vivo dos clientes que fizeram check-in. Identifique VIPs, recorrentes e gente nova num piscar de olho.",
        mockup: EstabPeopleMockup,
      },
      {
        title: "Dispare avisos pra todos",
        desc: "Promoção, show, happy hour. Mande um aviso e todo mundo no local recebe na hora. Simples assim.",
        mockup: BroadcastMockup,
      },
      {
        title: "Fidelidade que volta",
        desc: "Cliente faz check-in, pontua, ganha recompensa. Configure o programa em minutos e veja sua casa lotar de retornos.",
        mockup: LoyaltyMockup,
      },
      {
        title: "Boost pra aparecer no topo",
        desc: "Quer atrair mais gente? Ative o boost. Seu estabelecimento aparece em destaque no mapa e na busca por horas.",
        mockup: BoostMockup,
      },
      {
        title: "Relatórios pra decidir",
        desc: "Picos de movimento, dias de menor fluxo, perfil dos clientes. Gráficos simples pra você ajustar o jogo da casa.",
        mockup: EstabReportsMockup,
      },
    ],
  },
  comercial: {
    label: "Painel do comercial",
    storageKey: "imhere-onboarding-comercial-seen",
    primary: "from-[#a855f7] to-[#7c3aed]",
    slides: [
      {
        title: "Seu pipeline na mão",
        desc: "Lead, proposta, negociação, fechado. Arraste os cards conforme a conversa anda. Nada se perde no Whatsapp.",
        mockup: PipelineMockup,
      },
      {
        title: "Cadastre um novo cliente",
        desc: "Preencheu três campos e pronto. O estabelecimento já entra no funil e começa o trial automaticamente.",
        mockup: NewClientMockup,
      },
      {
        title: "Seus clientes ativos",
        desc: "Lista completa de quem você fechou. Veja plano contratado, status de pagamento, último contato. Tudo num só lugar.",
        mockup: ClientsListMockup,
      },
      {
        title: "Acompanhe sua comissão",
        desc: "A cada cliente ativo, sua comissão acumula. Veja o valor a receber, o que já caiu, e quanto rende cada plano.",
        mockup: CommissionMockup,
      },
      {
        title: "Sua performance, sua meta",
        desc: "Quantos leads viraram cliente. Quanto fatura por mês. Onde você tá no ranking. Sem suposições.",
        mockup: ComercialReportsMockup,
      },
    ],
  },
  admin: {
    label: "Painel administrativo",
    storageKey: "imhere-onboarding-admin-seen",
    primary: "from-brand-strong to-brand",
    slides: [
      {
        title: "Visão geral da plataforma",
        desc: "Usuários ativos, estabelecimentos cadastrados, receita do mês, pessoas online agora. Os números que importam.",
        mockup: AdminDashboardMockup,
      },
      {
        title: "Gestão de usuários",
        desc: "Busque qualquer usuário, veja histórico, verifique perfis, banir se necessário. Você tem controle total.",
        mockup: AdminUsersMockup,
      },
      {
        title: "Moderação ativa",
        desc: "Denúncias caem aqui. Avalie a evidência, aprove ou bane com um clique. Cada decisão fica registrada.",
        mockup: ModerationMockup,
      },
      {
        title: "Planos e monetização",
        desc: "Configure planos, preços, recursos inclusos. Veja quantos estabelecimentos estão em cada plano e a saúde da receita.",
        mockup: PlansMockup,
      },
      {
        title: "Relatórios e BI",
        desc: "20+ relatórios prontos: cohort, retenção, heatmap, ranking, funil. Filtre por período e exporte o que precisar.",
        mockup: AdminReportsMockup,
      },
      {
        title: "Notificações no painel",
        desc: "Alertas de denúncia, novos cadastros, pagamentos pendentes. Tudo agregado pra você nunca perder nada importante.",
        mockup: NotificationsMockup,
      },
    ],
  },
};
