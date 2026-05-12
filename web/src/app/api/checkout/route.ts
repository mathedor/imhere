import { NextRequest, NextResponse } from "next/server";
import { createCardSubscription, createPixCharge } from "@/lib/efi/charges";
import { grantCreditsForPack } from "@/lib/actions/credits";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

interface Body {
  planId: string;
  billingCycle: "monthly" | "annual";
  amountCents: number;
  method: "pix" | "credit_card";
  paymentToken?: string;
  customer: { name: string; document: string; email: string; phone: string };
  target?: "user" | "establishment" | "credit_pack";
  establishmentId?: string;
  /** Quando target=credit_pack, ID do pacote a creditar após pagamento */
  packId?: string;
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
    const description =
      body.target === "credit_pack"
        ? `I'm Here · pacote de créditos`
        : `Plano I'm Here · ${body.planId}`;
    const charge = await createPixCharge({
      amountCents: body.amountCents,
      description,
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
        profile_id: body.target !== "establishment" ? profileId : null,
        establishment_id: body.target === "establishment" ? body.establishmentId ?? null : null,
      });

      // Para credit_pack: grant créditos otimisticamente (PIX será confirmado depois via webhook).
      // TODO: mover pra webhook quando integração Efí estiver 100%.
      if (body.target === "credit_pack" && body.packId) {
        try {
          await grantCreditsForPack(profileId, body.packId);
        } catch (e) {
          console.error("Falha ao creditar pack:", e);
        }
      }
    }

    return NextResponse.json({ charge });
  }

  if (body.method === "credit_card") {
    if (!body.paymentToken) {
      return NextResponse.json({ error: "missing_payment_token" }, { status: 400 });
    }

    // Credit pack via cartão: charge one-shot (sem subscription) e libera créditos
    if (body.target === "credit_pack") {
      const sub = await createCardSubscription({
        amountCents: body.amountCents,
        intervalMonths: 1,
        description: `I'm Here · pacote de créditos`,
        paymentToken: body.paymentToken,
        customer: body.customer,
      });

      if (!isMockMode() && profileId) {
        const admin = supabaseAdmin();
        await admin.from("payments").insert({
          amount_cents: body.amountCents,
          method: "credit_card",
          status: "paid",
          efi_charge_id: sub.subscriptionId,
          profile_id: profileId,
          paid_at: new Date().toISOString(),
        });
        if (body.packId) {
          await grantCreditsForPack(profileId, body.packId);
        }
      }
      return NextResponse.json({ subscription: sub });
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
