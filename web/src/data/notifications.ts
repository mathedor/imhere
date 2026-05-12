/**
 * Mock de notificações pra modo dev sem Supabase.
 * Em produção, vem da tabela `notifications` via repository.
 */
export interface MockNotification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  createdAt: string;
  readAt: string | null;
}

export const mockNotifications: MockNotification[] = [
  {
    id: "n1",
    kind: "contact_request",
    title: "Lucas Andrade quer falar com você",
    body: "Toque para responder ao pedido de contato.",
    link: "/app/notificacoes",
    createdAt: "Agora",
    readAt: null,
  },
  {
    id: "n2",
    kind: "courtesy_received",
    title: "Drink cortesia do Lume Rooftop 🍸",
    body: "Passa lá no balcão pra retirar!",
    link: "/app/cortesias",
    createdAt: "5 min atrás",
    readAt: null,
  },
  {
    id: "n3",
    kind: "new_message",
    title: "Mariana Costa enviou uma mensagem",
    body: "Que cara legal! Esse drink que você pediu é o que?",
    link: "/app/chat/conv-mari",
    createdAt: "12 min atrás",
    readAt: null,
  },
  {
    id: "n4",
    kind: "checkin_done",
    title: "Check-in confirmado",
    body: "Você está em Lume Rooftop 📍",
    link: "/app/estabelecimento/lume-rooftop",
    createdAt: "Hoje 21:34",
    readAt: "lido",
  },
  {
    id: "n5",
    kind: "contact_accepted",
    title: "Contato aceito!",
    body: "Carolina aceitou seu pedido. Inicie a conversa.",
    link: "/app/chat",
    createdAt: "Ontem 22:15",
    readAt: "lido",
  },
  {
    id: "n6",
    kind: "payment_confirmed",
    title: "Pagamento confirmado 💳",
    body: "R$ 39,90 recebido via PIX",
    link: "/app/planos",
    createdAt: "2026-04-22",
    readAt: "lido",
  },
  {
    id: "n7",
    kind: "moderation_warning",
    title: "Atenção — mensagem bloqueada 🛡️",
    body: "Detectamos um termo inadequado. Respeite a comunidade.",
    link: "/app/chat",
    createdAt: "2026-04-18",
    readAt: "lido",
  },
];

export const KIND_META: Record<string, { icon: string; color: string; label: string }> = {
  contact_request: { icon: "👋", color: "#3b82f6", label: "Pedido de contato" },
  contact_accepted: { icon: "✓", color: "#22c55e", label: "Contato aceito" },
  contact_rejected: { icon: "✕", color: "#6b6b75", label: "Contato recusado" },
  courtesy_received: { icon: "🎁", color: "#ef2c39", label: "Cortesia recebida" },
  new_message: { icon: "💬", color: "#a855f7", label: "Nova mensagem" },
  checkin_done: { icon: "📍", color: "#3b82f6", label: "Check-in" },
  guest_checkin: { icon: "🎉", color: "#22c55e", label: "Cliente chegou" },
  payment_confirmed: { icon: "💳", color: "#22c55e", label: "Pagamento" },
  subscription_created: { icon: "✨", color: "#f59e0b", label: "Assinatura" },
  moderation_warning: { icon: "🛡️", color: "#ef2c39", label: "Moderação" },
  courtesy_redeemed: { icon: "🎫", color: "#22c55e", label: "Cortesia resgatada" },
};
