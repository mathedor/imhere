const BLOCKED_PATTERNS = [
  /\b(p[uo0]rr[ao]|m[e3]rd[ao]|c[a@]r[a@]lh[o0]|f[uo]d[e3]r?|f[il1]lh[ao]?\s*d[ae]?\s*[pq]ut[ao])\b/i,
  /\b(v[ae]i\s*[stc][eo](\s*f[uo]d[e3]r)?)\b/i,
  /\b(b[uo]c[e3]t[ao]|p[il1]nt[oa]|c[uo]?\s*[uo]?\s*\b)\b/i,
  /\b(idiota|imbecil|burr[ao]|retardad[ao]|tro[ck]ha|gad[ao])\b/i,
  /\b(arromba[d]?[ao]|cuzao|cuz[aã]o|veado|viado|bich[ae]|sapat[ao])\b/i,
  /\b(macac[ao]|nego(\s*do\s*caralho)?|preto\s*de\s*merda)\b/i,
  /\b(estupr[oa]r?|matar?\s*voc[eê])\b/i,
];

const WARNING_PATTERNS = [
  /\b(dr[ou]g[ao]|c[ou]c[ao][ií]n[ao]|m[a@]conh[ao])\b/i,
  /\b(garot[ao]\s*de\s*programa|prostitui[cç][aã]o)\b/i,
];

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: "blocked"; matched: string }
  | { ok: false; reason: "warning"; matched: string };

export function moderate(message: string): ModerationResult {
  for (const re of BLOCKED_PATTERNS) {
    const m = message.match(re);
    if (m) return { ok: false, reason: "blocked", matched: m[0] };
  }
  for (const re of WARNING_PATTERNS) {
    const m = message.match(re);
    if (m) return { ok: false, reason: "warning", matched: m[0] };
  }
  return { ok: true };
}
