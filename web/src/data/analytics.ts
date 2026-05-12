function generateSeries(days: number, base: number, variance = 0.3): { label: string; value: number }[] {
  const today = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const dayBoost = [0, 0.6, 1, 1.4, 1.7, 2.2, 1.8][d.getDay()];
    const noise = 1 + (Math.random() - 0.5) * variance;
    return {
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      value: Math.max(1, Math.round(base * dayBoost * noise)),
    };
  });
}

export const checkinsByDay = generateSeries(30, 22);
export const revenueByDay = generateSeries(30, 1280);
export const usersByDay = generateSeries(30, 48);
export const interactionsByDay = generateSeries(30, 380);

export const planDistribution = [
  { label: "Free", value: 7430 },
  { label: "Básico", value: 2104 },
  { label: "Premium", value: 1842 },
  { label: "VIP", value: 312 },
];

export const topEstablishments = [
  { id: "lume-rooftop", name: "Lume Rooftop", city: "São Paulo", checkins7d: 1842, mrr: 2400, rating: 4.8 },
  { id: "noir-club", name: "Noir Club", city: "São Paulo", checkins7d: 3210, mrr: 2400, rating: 4.6 },
  { id: "palco-arena", name: "Palco Arena", city: "São Paulo", checkins7d: 5420, mrr: 4800, rating: 4.5 },
  { id: "neon-after", name: "Neon After", city: "São Paulo", checkins7d: 2840, mrr: 2400, rating: 4.2 },
  { id: "boteco-da-vila", name: "Boteco da Vila", city: "São Paulo", checkins7d: 980, mrr: 0, rating: 4.7 },
  { id: "subsolo-bar", name: "Subsolo Bar", city: "São Paulo", checkins7d: 1240, mrr: 1200, rating: 4.3 },
  { id: "mar-azul", name: "Mar Azul", city: "Florianópolis", checkins7d: 720, mrr: 1200, rating: 4.4 },
  { id: "kazoku-omakase", name: "Kazoku Omakase", city: "São Paulo", checkins7d: 380, mrr: 0, rating: 4.9 },
  { id: "trattoria-fellini", name: "Trattoria Fellini", city: "São Paulo", checkins7d: 520, mrr: 0, rating: 4.7 },
  { id: "horto-cafe", name: "Horto Café", city: "São Paulo", checkins7d: 410, mrr: 0, rating: 4.6 },
];

export const recentSubscriptions = [
  { id: "s-001", user: "Mariana Costa", plan: "Premium", amount: 39.9, status: "active", date: "2026-05-10", method: "PIX" },
  { id: "s-002", user: "Lucas Andrade", plan: "VIP", amount: 89.9, status: "active", date: "2026-05-10", method: "Cartão" },
  { id: "s-003", user: "Bruno Salles", plan: "Básico", amount: 19.9, status: "active", date: "2026-05-09", method: "PIX" },
  { id: "s-004", user: "Carolina Reis", plan: "Premium", amount: 39.9, status: "trialing", date: "2026-05-09", method: "Cartão" },
  { id: "s-005", user: "Pedro Vasco", plan: "Básico", amount: 19.9, status: "active", date: "2026-05-08", method: "PIX" },
  { id: "s-006", user: "Júlia Carvalho", plan: "Premium", amount: 39.9, status: "active", date: "2026-05-08", method: "Cartão" },
  { id: "s-007", user: "André Tavares", plan: "VIP", amount: 89.9, status: "canceled", date: "2026-05-07", method: "Cartão" },
  { id: "s-008", user: "Sofia Nunes", plan: "Premium", amount: 39.9, status: "active", date: "2026-05-07", method: "PIX" },
  { id: "s-009", user: "Tiago Rocha", plan: "Básico", amount: 19.9, status: "active", date: "2026-05-06", method: "PIX" },
  { id: "s-010", user: "Ana Beatriz", plan: "Premium", amount: 39.9, status: "trialing", date: "2026-05-06", method: "Cartão" },
];

export const salesAgents = [
  { id: "sa-1", name: "Carlos Lemos", email: "carlos@imhere.com", establishments: 14, mrr: 18200, commission: 1820 },
  { id: "sa-2", name: "Renata Vidal", email: "renata@imhere.com", establishments: 11, mrr: 14800, commission: 1480 },
  { id: "sa-3", name: "Fernando Brito", email: "fernando@imhere.com", establishments: 8, mrr: 9600, commission: 960 },
  { id: "sa-4", name: "Patrícia Sá", email: "patricia@imhere.com", establishments: 19, mrr: 24300, commission: 2430 },
];
