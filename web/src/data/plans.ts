export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  highlight?: boolean;
  badge?: string;
  features: { label: string; included: boolean }[];
  color: { from: string; to: string };
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Para experimentar",
    monthlyPrice: 0,
    annualPrice: 0,
    color: { from: "#374151", to: "#1f2937" },
    features: [
      { label: "Buscar lugares e ver presença", included: true },
      { label: "Fazer check-in ilimitado", included: true },
      { label: "Ver foto e nome dos presentes", included: true },
      { label: "Ver perfil 360 completo", included: false },
      { label: "Iniciar conversa no chat", included: false },
      { label: "Foto/áudio no chat", included: false },
      { label: "Ver quem visitou seu perfil", included: false },
    ],
  },
  {
    id: "basic",
    name: "Básico",
    tagline: "Para conhecer pessoas",
    monthlyPrice: 19.9,
    annualPrice: 14.9,
    color: { from: "#3b82f6", to: "#1d4ed8" },
    features: [
      { label: "Tudo do Free", included: true },
      { label: "Ver perfil 360 completo", included: true },
      { label: "Iniciar até 3 conversas por dia", included: true },
      { label: "Bio estendida + galeria 6 fotos", included: true },
      { label: "Foto/áudio no chat", included: false },
      { label: "Ver quem visitou seu perfil", included: false },
      { label: "Filtros avançados (gênero, idade)", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "O mais escolhido",
    monthlyPrice: 39.9,
    annualPrice: 29.9,
    highlight: true,
    badge: "Mais popular",
    color: { from: "#ef2c39", to: "#b41822" },
    features: [
      { label: "Tudo do Básico", included: true },
      { label: "Conversas ilimitadas", included: true },
      { label: "Foto e áudio no chat", included: true },
      { label: "Ver quem visitou seu perfil", included: true },
      { label: "Galeria com até 12 fotos", included: true },
      { label: "Modo invisível disponível", included: true },
      { label: "Boost de visibilidade 1x/semana", included: false },
    ],
  },
  {
    id: "vip",
    name: "VIP",
    tagline: "Experiência completa",
    monthlyPrice: 89.9,
    annualPrice: 69.9,
    badge: "Premium+",
    color: { from: "#a855f7", to: "#7c3aed" },
    features: [
      { label: "Tudo do Premium", included: true },
      { label: "Filtros avançados completos", included: true },
      { label: "Boost de visibilidade ilimitado", included: true },
      { label: "Acesso antecipado a eventos parceiros", included: true },
      { label: "Selo verificado de elite", included: true },
      { label: "Suporte prioritário 24h", included: true },
      { label: "Convites exclusivos do I'm Here", included: true },
    ],
  },
];
