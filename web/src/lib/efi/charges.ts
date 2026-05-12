import { efiFetch } from "./client";
import { EFI_PIX_KEY, isEfiConfigured } from "./config";

export interface PixCharge {
  txid: string;
  status: string;
  qrCodeImage: string;
  qrCodePayload: string;
  amountCents: number;
  expiresInSec: number;
}

export interface CardSubscription {
  subscriptionId: string;
  status: string;
  nextChargeAt: string | null;
}

export async function createPixCharge(input: {
  amountCents: number;
  description: string;
  customer: { name: string; document: string; email: string };
  expiresInSec?: number;
}): Promise<PixCharge> {
  if (!isEfiConfigured()) {
    return {
      txid: `mock_${Date.now()}`,
      status: "ATIVA",
      qrCodeImage:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23000'/><text x='50' y='55' fill='%23fff' font-size='10' text-anchor='middle'>QR MOCK</text></svg>",
      qrCodePayload: `mock-pix-${Date.now()}`,
      amountCents: input.amountCents,
      expiresInSec: input.expiresInSec ?? 3600,
    };
  }

  const txid = `IMHERE${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 35);
  const payload = {
    calendario: { expiracao: input.expiresInSec ?? 3600 },
    devedor: { cpf: input.customer.document.replace(/\D/g, ""), nome: input.customer.name },
    valor: { original: (input.amountCents / 100).toFixed(2) },
    chave: EFI_PIX_KEY,
    solicitacaoPagador: input.description,
  };

  const cob = await efiFetch<{ status: string; loc: { id: number } }>(`/v2/cob/${txid}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const qr = await efiFetch<{ qrcode: string; imagemQrcode: string }>(
    `/v2/loc/${cob.loc.id}/qrcode`
  );

  return {
    txid,
    status: cob.status,
    qrCodeImage: qr.imagemQrcode,
    qrCodePayload: qr.qrcode,
    amountCents: input.amountCents,
    expiresInSec: input.expiresInSec ?? 3600,
  };
}

export async function createCardSubscription(input: {
  amountCents: number;
  intervalMonths: 1 | 12;
  description: string;
  paymentToken: string;
  customer: { name: string; document: string; email: string; phone: string };
}): Promise<CardSubscription> {
  if (!isEfiConfigured()) {
    return {
      subscriptionId: `mock_sub_${Date.now()}`,
      status: "active",
      nextChargeAt: new Date(Date.now() + input.intervalMonths * 30 * 86400_000).toISOString(),
    };
  }

  const planResp = await efiFetch<{ data: { plan_id: number } }>(
    `/v1/plan`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.description,
        interval: input.intervalMonths,
        repeats: null,
      }),
    },
    "card"
  );

  const subResp = await efiFetch<{ data: { subscription_id: number; status: string } }>(
    `/v1/plan/${planResp.data.plan_id}/subscription`,
    {
      method: "POST",
      body: JSON.stringify({
        items: [{ name: input.description, value: input.amountCents, amount: 1 }],
        payment: {
          credit_card: {
            payment_token: input.paymentToken,
            customer: {
              name: input.customer.name,
              cpf: input.customer.document.replace(/\D/g, ""),
              email: input.customer.email,
              phone_number: input.customer.phone.replace(/\D/g, ""),
              birth: "1990-01-01",
            },
          },
        },
      }),
    },
    "card"
  );

  return {
    subscriptionId: String(subResp.data.subscription_id),
    status: subResp.data.status,
    nextChargeAt: new Date(Date.now() + input.intervalMonths * 30 * 86400_000).toISOString(),
  };
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  if (!isEfiConfigured()) return;
  await efiFetch(`/v1/subscription/${subscriptionId}/cancel`, { method: "PUT" }, "card");
}
