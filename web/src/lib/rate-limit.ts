// Rate limiter in-memory simples — bom pra MVP, em prod escalável usar Upstash/Redis
// Cada action chama checkRateLimit(key, limit, windowMs) — bloqueia se exceder.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

// Limpa buckets expirados a cada 5 min (evita memory leak)
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (bucket.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetIn: number; // ms até reset
}

/**
 * Verifica e incrementa contador. Retorna ok=false se excedeu.
 *
 * @param key — geralmente `${action}:${userId|ip}`
 * @param limit — max tentativas no window
 * @param windowMs — janela (default 60s)
 */
export function checkRateLimit(key: string, limit: number, windowMs = 60_000): RateLimitResult {
  scheduleCleanup();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetIn: existing.resetAt - now };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, resetIn: existing.resetAt - now };
}

/** Helper pra usar em server actions: identifica caller por user.id (preferido) ou IP. */
export async function getRateLimitKey(prefix: string): Promise<string> {
  try {
    const { supabaseServer } = await import("@/lib/supabase/server");
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user?.id) return `${prefix}:user:${user.id}`;
  } catch {
    // fall through
  }
  // Anon: usa cabeçalho (best effort)
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "anon";
    return `${prefix}:ip:${ip}`;
  } catch {
    return `${prefix}:anon`;
  }
}

/** Pré-set de limites comuns */
export const LIMITS = {
  signIn: { limit: 5, windowMs: 60_000 },           // 5/min — login brute force
  signUp: { limit: 3, windowMs: 5 * 60_000 },       // 3/5min — anti-spam cadastro
  resetPassword: { limit: 3, windowMs: 15 * 60_000 }, // 3/15min — anti-spam reset
  sendMessage: { limit: 30, windowMs: 60_000 },     // 30/min — anti flood
  contactRequest: { limit: 10, windowMs: 60_000 },  // 10/min — anti spam
  report: { limit: 5, windowMs: 5 * 60_000 },       // 5/5min — anti spam de denúncia
  checkin: { limit: 10, windowMs: 60_000 },         // 10/min
};
