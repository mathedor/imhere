import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const ROLE_REDIRECTS: Record<string, string> = {
  user: "/app",
  establishment: "/estabelecimento",
  sales: "/comercial",
  admin: "/admin",
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const sb = await supabaseServer();
    await sb.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await sb.auth.getUser();

    if (user) {
      const { data: profile } = await sb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const role = (profile?.role as string | undefined) ?? "user";
      return NextResponse.redirect(`${origin}${next ?? ROLE_REDIRECTS[role] ?? "/app"}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
