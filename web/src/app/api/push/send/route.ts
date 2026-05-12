import { NextRequest, NextResponse } from "next/server";
import { sendWebPushTo } from "@/lib/push";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";

/**
 * POST /api/push/send
 * Body: { profileId, title, body?, url?, tag? }
 *
 * Cria notification (que dispara realtime) + envia push web pros tokens
 * ativos do user. Usa web-push lib com VAPID keys do .env.
 */
export async function POST(req: NextRequest) {
  const { profileId, title, body, url, tag } = await req.json();

  if (!profileId || !title) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  if (isMockMode()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const admin = supabaseAdmin();
  await admin.from("notifications").insert({
    profile_id: profileId,
    kind: tag ?? "push",
    title,
    body: body ?? null,
    link: url ?? null,
  });

  const sentCount = await sendWebPushTo(profileId, { title, body, url, tag });

  return NextResponse.json({ ok: true, pushesSent: sentCount });
}
