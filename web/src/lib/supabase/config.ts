export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Quando o projeto não tem credenciais configuradas, o app continua
 * funcionando com mocks. Use isMockMode() em qualquer repository para
 * decidir entre Supabase real ou mock.
 */
export function isMockMode(): boolean {
  return !SUPABASE_URL || !SUPABASE_ANON_KEY;
}
