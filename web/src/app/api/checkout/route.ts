import { NextRequest, NextResponse } from "next/server";
import { createCardSubscription, createPixCharge } from "@/lib/efi/charges";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

interface Body {
  planId: string;
  billingCycle: "monthly" | "annual";
  amountCents: number;
  method: "pix" | "credit_card";
  paymentToken?: string;
  customer: { name: string; document: string; email: string; phone: string };
  target?: "user" | "establishment";
  establishmentId?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;

  let profileId: string | null = null;
  if (!isMockMode()) {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    profileId = user.id;
  }

  if (body.method === "pix") {
    const charge = await createPixCharge({
      amountCents: body.amountCents,
      description: `Plano I'm Here · ${body.planId}`,
      customer: body.customer,
    });

    if (!isMockMode() && profileId) {
      const sb = await supabaseServer();
      await sb.from("payments").insert({
        amount_cents: body.amountCents,
        method: "pix",
        status: "pending",
        efi_charge_id: charge.txid,
        efi_pix_qr: charge.qrCodeImage,
        efi_pix_code: charge.qrCodePayload,
        profile_id: body.target === "user" ? profileId : null,
        establishment_id: body.target === "establishment" ? body.establishmentId ?? null : null,
      });
    }

    return NextResponse.json({ charge });
  }

  if (body.method === "credit_card") {
    if (!body.paymentToken) {
      return NextResponse.json({ error: "missing_payment_token" }, { status: 400 });
    }
    const sub = await createCardSubscription({
      amountCents: body.amountCents,
      intervalMonths: body.billingCycle === "annual" ? 12 : 1,
      description: `Plano I'm Here · ${body.planId}`,
      paymentToken: body.paymentToken,
      customer: body.customer,
    });

    if (!isMockMode() && profileId) {
      const sb = await supabaseServer();
      await sb.from("subscriptions").insert({
        profile_id: body.target === "user" ? profileId : null,
        establishment_id: body.target === "establishment" ? body.establishmentId ?? null : null,
        plan_id: body.planId,
        amount_cents: body.amountCents,
        billing_cycle: body.billingCycle,
        method: "credit_card",
        status: "active",
        efi_subscription_id: sub.subscriptionId,
      });
    }
    return NextResponse.json({ subscription: sub });
  }

  return NextResponse.json({ error: "invalid_method" }, { status: 400 });
}
