import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/supabase/config";

interface PixWebhookEvent {
  pix?: Array<{
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string;
    chave?: string;
  }>;
  subscription?: { subscription_id: number; status: string };
}

export async function POST(req: NextRequest) {
  const event = (await req.json()) as PixWebhookEvent;

  if (isMockMode()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const admin = supabaseAdmin();

  // PIX paid
  if (event.pix?.length) {
    for (const tx of event.pix) {
      await admin
        .from("payments")
        .update({ status: "paid", paid_at: tx.horario })
        .eq("efi_charge_id", tx.txid);
    }
  }

  // Subscription status changed
  if (event.subscription) {
    const status = event.subscription.status === "active" ? "active" : "past_due";
    await admin
      .from("subscriptions")
      .update({ status })
      .eq("efi_subscription_id", String(event.subscription.subscription_id));
  }

  return NextResponse.json({ ok: true });
}

// Efí valida o webhook fazendo GET
export async function GET() {
  return NextResponse.json({ ok: true });
}
