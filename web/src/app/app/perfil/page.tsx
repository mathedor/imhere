import { PerfilForm } from "@/components/app/PerfilForm";
import { PremiumBoostsSection } from "@/components/app/PremiumBoostsSection";
import { getMyActivePlanKey, getMyBalance } from "@/lib/actions/credits";
import { getCurrentProfile, getUserGallery } from "@/lib/db/profiles";
import { isMockMode } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile && !isMockMode()) {
    return <PerfilForm initial={{ saved: saved === "1" }} />;
  }

  const [gallery, credits, planKey] = await Promise.all([
    profile ? getUserGallery(profile.id) : Promise.resolve([]),
    getMyBalance(),
    getMyActivePlanKey(),
  ]);

  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-5 pt-5">
        <PremiumBoostsSection credits={credits} planKey={planKey} />
      </div>
      <PerfilForm
        initial={{
          name: profile?.name ?? "Mateus Henrique Silva",
          email: profile?.email ?? "mateus@exemplo.com",
          whatsapp: profile?.whatsapp ?? "",
          cpf: (profile as { cpf?: string | null } | null)?.cpf ?? "",
          instagram: profile?.instagram ?? "",
          birthDate: profile?.birth_date ?? "",
          gender: profile?.gender ?? "na",
          profession: profile?.profession ?? "",
          bio: profile?.bio ?? "",
          status: (profile?.status ?? "open") as "open" | "watching" | "invisible",
          photoUrl: profile?.photo_url ?? null,
          gallery: gallery ?? [],
          plan: planKey === "free" ? "Free" : planKey.charAt(0).toUpperCase() + planKey.slice(1),
          saved: saved === "1",
        }}
      />
    </>
  );
}
