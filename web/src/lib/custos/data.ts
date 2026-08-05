/**
 * Custos & Desenvolvimento — dados do relatório do admin.
 * Câmbio de referência: US$ 1 = R$ 5,45.
 * Tokens de desenvolvimento: base Opus (US$ 5 / US$ 25 por milhão) × 5,45.
 */

export const USD = 5.45;
export const SETUP_TOTAL = 188610.0;
export const SETUP_DATA = "12/05/2026";
export const STORAGE_KEY = "imhere-custos-v1";
export const STORAGE_KEY_CUSTOM = "imhere-custos-custom-v1";

export type Tier = "P" | "M" | "G" | "X";

export const TIERS: Record<Tier, { tokens: number; label: string; brl: number }> = {
  P: { tokens: 1.6, label: "1,6 M", brl: 65.4 },
  M: { tokens: 4.4, label: "4,4 M", brl: 163.5 },
  G: { tokens: 8.8, label: "8,8 M", brl: 327.0 },
  X: { tokens: 16.5, label: "16,5 M", brl: 599.5 },
};

export interface FixedItem {
  id: string;
  nome: string;
  desc: string;
  valor: number;
  estimado?: boolean;
}

export interface MesCustos {
  key: string;
  ym: string;
  nome: string;
  tag: string;
  itens: FixedItem[];
}

/** Contas fixas — mesma cesta todo mês (ids ganham prefixo do mês). */
const CONTAS_FIXAS: Omit<FixedItem, "id">[] = [
  {
    nome: "Vercel (hospedagem)",
    desc: "Site, app do usuário e os 3 painéis no ar · US$ 20 × 5,45",
    valor: 109.0,
    estimado: true,
  },
  {
    nome: "Supabase (banco, login e mídias)",
    desc: "Banco de dados, cadastro dos usuários, fotos e tempo real · US$ 25 × 5,45",
    valor: 136.25,
    estimado: true,
  },
  {
    nome: "Servidor de backup",
    desc: "Cópia diária do banco e das fotos, guardada fora da nuvem principal",
    valor: 440.0,
  },
  {
    nome: "Resend (e-mails)",
    desc: "Envio dos e-mails da plataforma: confirmação de cadastro, recuperação de senha e avisos automáticos · US$ 20 × 5,45",
    valor: 109.0,
    estimado: true,
  },
  {
    nome: "WhatsApp (avisos e suporte)",
    desc: "Número oficial da plataforma: atendimento ao cliente e à casa, confirmação de cadastro e disparo de avisos · plano mensal",
    valor: 99.0,
    estimado: true,
  },
  {
    nome: "Firewall",
    desc: "Proteção contra ataque e abuso na entrada do sistema · US$ 23 × 5,45",
    valor: 125.35,
  },
  {
    nome: "Proxies",
    desc: "Saída protegida para as integrações externas · US$ 19 × 5,45",
    valor: 103.55,
  },
  {
    nome: "VPS de agentes",
    desc: "Servidor que roda os robôs de monitoramento e a integração com a Ana",
    valor: 590.0,
  },
];

function mes(key: string, ym: string, nome: string, tag: string): MesCustos {
  return {
    key,
    ym,
    nome,
    tag,
    itens: CONTAS_FIXAS.map((c, i) => ({ ...c, id: `${key}-f${i}` })),
  };
}

/** Do mês de entrega da v1 (maio/2026) até o mês corrente — mais recente primeiro. */
export const MESES: MesCustos[] = [
  mes("m08", "2026-08", "Agosto 2026", "mês corrente · parcial"),
  mes("m07", "2026-07", "Julho 2026", "mês cheio"),
  mes("m06", "2026-06", "Junho 2026", "mês cheio"),
  mes("m05", "2026-05", "Maio 2026", "entrega da v1 · início do controle"),
];

export const CUSTO_MENSAL = CONTAS_FIXAS.reduce((s, c) => s + c.valor, 0);

/** [data, título, descrição, tier] */
export type DevEntry = [string, string, string, Tier];

const DEV_05: DevEntry[] = [
  [
    "12/05",
    "NO MOMENTO — stories do estabelecimento",
    "A casa posta fotos do movimento ao vivo; o card dela ganha borda animada no app e o cliente assiste como stories, com validade automática.",
    "G",
  ],
  [
    "12/05",
    "Chat com moderação e mídia de verdade",
    "Áudio e foto dentro da conversa, bloqueio de palavrão antes de a mensagem existir e denúncia caindo direto na fila da moderação.",
    "G",
  ],
  [
    "12/05",
    "Créditos, planos e cortesias da casa",
    "Pacotes de crédito com checkout PIX e cartão, bônus de boas-vindas, saldo visível no topo e cortesias (drink, desconto) enviadas a quem está com check-in ativo.",
    "G",
  ],
  [
    "12/05",
    "Premium da Casa e travas de monetização",
    "O estabelecimento paga e libera o chat para todo mundo que estiver no local; perfil 360, filtros avançados e envio de mídia destravam por plano ou crédito.",
    "G",
  ],
  [
    "12/05",
    "Sprint 1 — primeiros passos do usuário",
    "Onboarding guiado, foto de perfil, telas com carregamento suave, botão de pânico e código de conduta.",
    "G",
  ],
  [
    "12/05",
    "Sprint 2 — fidelidade e casa cheia ao vivo",
    "Programa de fidelidade do estabelecimento, recado em massa para os presentes, melhor horário para ir, top frequentadores e contador de gente ao vivo.",
    "G",
  ],
  [
    "12/05",
    "Sprint 3 — confiança e quebra-gelo",
    "Verificação por selfie com selo, sugestão de assunto para puxar conversa e presença em tempo real no local.",
    "G",
  ],
  [
    "12/05",
    "Sprint 4 — mapa, retenção e impulso",
    "Mapa geográfico dos check-ins, safras de retenção, valor por cliente ao longo do tempo, análise de match, pesquisa de satisfação, impulsionar perfil, modo casal e central de alertas.",
    "X",
  ],
  [
    "12/05",
    "Painel do comercial — pipeline e comissões",
    "Funil de leads por etapa, cadastro de estabelecimentos em campo, comissões por venda e exportação em PDF.",
    "G",
  ],
  [
    "12/05",
    "Relatórios do admin — 19 telas",
    "Rankings de casas, usuários, categorias e cidades, funil de aquisição, check-ins, mapa de calor, horários, safras e análise de match, todos com filtro de período.",
    "X",
  ],
  [
    "13/05",
    "Sprint 5a — senha, busca no Google e quiz",
    "Recuperação de senha por e-mail, páginas públicas prontas para o Google, limite anti-abuso, story agendado e quiz de afinidade puxando o match.",
    "G",
  ],
  [
    "13/05",
    "Landing nova, sala de imprensa e roteiros",
    "Dois caminhos na home (cliente e estabelecimento), depoimentos, planos por abas, prévia bonita ao compartilhar link de casa e roteiro dos 3 vídeos de demonstração.",
    "G",
  ],
  [
    "13/05",
    "Memorial descritivo da plataforma",
    "Documento completo do que foi entregue, com capa profissional e credenciais de acesso de cada nível.",
    "M",
  ],
  [
    "13/05",
    "Correções de acesso e de avisos",
    "Link de recuperação passou a usar o endereço certo e o aviso de mensagem nova voltou a disparar.",
    "P",
  ],
  [
    "19/05",
    "Tour guiado por nível",
    "Primeira visita ganha um tour explicando a tela — versões diferentes para cliente, estabelecimento, comercial e administrador, com mockup animado.",
    "M",
  ],
  [
    "26/05",
    "Painel do admin no celular",
    "Todas as tabelas do administrador viram cards no celular, sem rolagem lateral.",
    "P",
  ],
];

const DEV_07: DevEntry[] = [
  [
    "04/07",
    "Apresentação do projeto em 2 versões",
    "Deck de slides do I'm Here para levar a cliente e a investidor.",
    "M",
  ],
  [
    "07/07",
    "Apresentação legível no celular",
    "Deck ajustado para o celular em pé, sem precisar girar a tela.",
    "P",
  ],
  [
    "14/07",
    "Ícone da marca no navegador e no deck",
    "Pin do mapa vira o ícone oficial em todos os tamanhos, incluindo a aba do navegador.",
    "P",
  ],
  [
    "22/07",
    "Conector da Ana — pulso do sistema",
    "Endereço protegido que entrega o pulso da plataforma para a assistente Ana acompanhar de fora.",
    "M",
  ],
  [
    "27/07",
    "Pulso v2 — cadastros por nível e quem está online",
    "Cadastros separados por papel, quem esteve online nos últimos 15 minutos e marcação automática de presença.",
    "M",
  ],
  [
    "27/07",
    "Modo manutenção comandado pela Ana",
    "A Ana coloca e tira o sistema do ar por comando, com aviso amigável na tela para quem tentar entrar.",
    "P",
  ],
  [
    "28/07",
    "Assinatura da Diretório Web no rodapé",
    "Crédito com link em todas as páginas públicas.",
    "P",
  ],
];

const DEV_08: DevEntry[] = [
  [
    "03/08",
    "Conector da Ana — chamados um a um",
    "A Ana lista os chamados abertos do sistema e dá baixa em cada um pelo próprio conector.",
    "M",
  ],
  [
    "04/08",
    "Relatório Custos & Desenvolvimento",
    "Página nova no admin: contas fixas mês a mês com baixa individual ou do mês inteiro, investimento inicial, histórico de tudo que foi desenvolvido e as taxas dos serviços conectados.",
    "G",
  ],
];

export interface DevMes {
  key: string;
  nome: string;
  tag: string;
  itens: DevEntry[];
}

export const DEV_MESES: DevMes[] = [
  {
    key: "dev08",
    nome: "Desenvolvimento — Agosto 2026",
    tag: "toda sessão de trabalho no I'm Here é registrada aqui",
    itens: DEV_08,
  },
  {
    key: "dev07",
    nome: "Desenvolvimento — Julho 2026",
    tag: "apresentação, marca e integração com a Ana",
    itens: DEV_07,
  },
  {
    key: "dev05",
    nome: "Desenvolvimento — Maio 2026",
    tag: "evoluções logo depois da v1 no ar",
    itens: DEV_05,
  },
];

/** Setup inicial — investimento contratado, já pago, fora do custo mensal. */
export const INVESTIMENTO: { nome: string; desc: string; valor: number }[] = [
  {
    nome: `Plataforma I'm Here — v1 no ar (${SETUP_DATA})`,
    desc: "Escopo contratado: check-in por geolocalização, quem está no local agora, contato e chat entre presentes, 4 níveis de acesso (cliente, estabelecimento, comercial e administrador), cardápio público, painéis com indicadores e app instalável no celular.",
    valor: SETUP_TOTAL,
  },
];

export type ServicoStatus = "ativo" | "gratis" | "pend" | "anual";

export const SERVICOS: { nome: string; desc: string; custo: string; status: ServicoStatus }[] = [
  {
    nome: "Efí Bank",
    desc: "PIX e cartão recorrente dos planos e pacotes de crédito. Código pronto — falta a conta do cliente entrar no ar.",
    custo: "PIX 1,19% por transação",
    status: "pend",
  },
  {
    nome: "Supabase (login, tempo real e mídias)",
    desc: "Cadastro, sessão, chat em tempo real, fotos de perfil e stories.",
    custo: "incluso na conta mensal",
    status: "ativo",
  },
  {
    nome: "Notificações push (VAPID)",
    desc: "Aviso de contato, cortesia e story novo. Funciona sem custo — falta gerar as chaves em produção.",
    custo: "grátis",
    status: "pend",
  },
  {
    nome: "Mapa OpenStreetMap + Leaflet",
    desc: "Mapa dos estabelecimentos e mapa de calor dos check-ins.",
    custo: "grátis",
    status: "gratis",
  },
  {
    nome: "ViaCEP + geocodificação aberta",
    desc: "Endereço preenchido pelo CEP e coordenada do estabelecimento.",
    custo: "grátis",
    status: "gratis",
  },
  {
    nome: "Moderação de linguagem",
    desc: "Filtro próprio de palavrão e ofensa rodando antes de salvar a mensagem.",
    custo: "grátis",
    status: "gratis",
  },
  {
    nome: "Prévia de link (Open Graph)",
    desc: "Ao compartilhar a página de uma casa, a imagem mostra nome, cidade e quantos estão lá.",
    custo: "incluso na hospedagem",
    status: "gratis",
  },
  {
    nome: "Conector da Ana",
    desc: "Pulso do sistema, chamados e trava de manutenção via assistente.",
    custo: "incluso na VPS de agentes",
    status: "ativo",
  },
];

/** Custos que não são mensais — anuais ou de uma vez só. Informativo. */
export const ANUAIS: { nome: string; desc: string; custo: string; periodicidade: string }[] = [
  {
    nome: "Apple Developer Program",
    desc: "Obrigatório para publicar o app do iPhone na App Store. Ainda não contratado.",
    custo: "R$ 539,55 (US$ 99)",
    periodicidade: "anual",
  },
  {
    nome: "Google Play Console",
    desc: "Obrigatório para publicar o app Android. Taxa cobrada uma única vez. Ainda não contratado.",
    custo: "R$ 136,25 (US$ 25)",
    periodicidade: "pagamento único",
  },
  {
    nome: "Expo EAS (geração dos apps)",
    desc: "Monta os instaladores do iPhone e do Android. Hoje o plano grátis atende.",
    custo: "R$ 0 hoje · US$ 19/mês se precisar de fila prioritária",
    periodicidade: "opcional",
  },
  {
    nome: "Domínio próprio",
    desc: "Hoje o sistema roda em imhere-nine.vercel.app. Registrar o domínio definitivo é um custo pequeno e anual.",
    custo: "≈ R$ 40",
    periodicidade: "anual",
  },
];
