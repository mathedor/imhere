import { PlanosClient } from "@/components/app/PlanosClient";
import { plans as mockPlans } from "@/data/plans";
import { getCurrentProfile } from "@/lib/db/profiles";
import type { Plan } from "@/lib/db/types";

export const dynamic = "force-dynamic";

const plansData: Plan[] = mockPlans.map((p, i) => ({
  id: p.id,
  target: "user" as const,
  code: p.id,
  name: p.name,
  tagline: p.tagline,
  monthly_price_cents: Math.round(p.monthlyPrice * 100),
  annual_price_cents: Math.round(p.annualPrice * 100),
  features: p.features,
  highlight: p.highlight ?? false,
  active: true,
  sort_order: i,
}));

export default async function PlanosPage() {
  const profile = await getCurrentProfile();

  const userData = profile
    ? {
        name: profile.name,
        email: profile.email,
        whatsapp: profile.whatsapp,
        cpf: (profile as { cpf?: string | null }).cpf ?? null,
        city: profile.city,
        state: profile.state,
      }
    : undefined;

  return <PlanosClient plans={plansData} userData={userData} />;
}
