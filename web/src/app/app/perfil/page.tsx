import { PerfilForm } from "@/components/app/PerfilForm";
import { getCurrentProfile, getUserGallery } from "@/lib/db/profiles";
import { isMockMode } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile && !isMockMode()) {
    return <PerfilForm initial={{ saved: saved === "1" }} />;
  }

  const gallery = profile ? await getUserGallery(profile.id) : [];

  return (
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
        saved: saved === "1",
      }}
    />
  );
}
