// Client-safe constants/types pra leads — não importar nada de @supabase/* aqui

export type LeadStage = "new" | "meeting" | "proposal" | "closed_won" | "closed_lost";

export const STAGE_LABEL: Record<LeadStage, string> = {
  new: "Novo",
  meeting: "Reunião",
  proposal: "Proposta",
  closed_won: "Fechado",
  closed_lost: "Perdido",
};

export const STAGE_COLOR: Record<LeadStage, string> = {
  new: "#6b6b75",
  meeting: "#3b82f6",
  proposal: "#f59e0b",
  closed_won: "#22c55e",
  closed_lost: "#ef2c39",
};

export const STAGE_ORDER: LeadStage[] = ["new", "meeting", "proposal", "closed_won"];
