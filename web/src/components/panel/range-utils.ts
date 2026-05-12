// Utilitários client-safe pra parsing de período em URL.
// Sem "use client" — pode ser importado tanto de Server Components quanto Client Components.

export type RangeKey = "today" | "7d" | "30d" | "90d" | "year";

export function parseRange(value: string | null | undefined): RangeKey {
  if (value === "today" || value === "7d" || value === "90d" || value === "year") return value;
  return "30d";
}

export function rangeToDays(r: RangeKey): number {
  switch (r) {
    case "today":
      return 1;
    case "7d":
      return 7;
    case "90d":
      return 90;
    case "year":
      return 365;
    default:
      return 30;
  }
}
