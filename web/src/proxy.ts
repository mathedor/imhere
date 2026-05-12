import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/app", "/estabelecimento", "/comercial", "/admin"];
const ROLE_AREA: Record<string, string> = {
  user: "/app",
  establishment: "/estabelecimento",
  sales: "/comercial",
  admin: "/admin",
};

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // Se Supabase não está configurado, libera tudo (mock mode)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const protectedPath = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  if (!protectedPath) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) =>
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Garante que o usuário só acesse a área do seu role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile?.role as string | undefined) ?? "user";
  const expectedArea = ROLE_AREA[role] ?? "/app";

  // Admin pode acessar tudo
  if (role !== "admin" && !path.startsWith(expectedArea)) {
    return NextResponse.redirect(new URL(expectedArea, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
