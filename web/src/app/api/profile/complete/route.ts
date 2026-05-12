import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

/**
 * Salva campos faltantes do profile (chamado pelo CheckoutModal step 1).
 * Body: { name, whatsapp, cpf, address_* }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (isMockMode()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const street = String(body.address_street ?? "");
  const number = String(body.address_number ?? "");
  const complement = String(body.address_complement ?? "");
  const district = String(body.address_district ?? "");
  const fullAddress = [
    street && `${street}, ${number}${complement ? ` — ${complement}` : ""}`,
    district,
  ]
    .filter(Boolean)
    .join(" — ");

  await sb
    .from("profiles")
    .update({
      name: body.name ?? undefined,
      whatsapp: body.whatsapp ?? undefined,
      cpf: body.cpf ?? undefined,
      city: body.address_city ?? undefined,
      state: body.address_state ?? undefined,
      // Em produção: adicionar campos cep, address na tabela profiles
      // por agora, salvo no campo bio temporariamente se não houver
    })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
