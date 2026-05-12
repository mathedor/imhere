import { PessoasClient } from "@/components/estabelecimento/PessoasClient";
import { getMyEstablishmentContext } from "@/lib/db/my-establishment";

export const dynamic = "force-dynamic";

export default async function PessoasPage() {
  const ctx = await getMyEstablishmentContext();

  const presentUsers = ctx.presentProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.birth_date
      ? Math.floor((Date.now() - new Date(p.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
      : undefined,
    gender: p.gender ?? undefined,
    status: p.status,
    photo: p.photo_url ?? undefined,
    profession: p.profession ?? undefined,
    checkedInAt: p.last_seen_at ?? undefined,
  }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Pessoas no local agora</h1>
        <p className="mt-1 text-sm text-text-soft">{`${presentUsers.length} pessoa${presentUsers.length !== 1 ? "s" : ""} com check-in ativo · atualiza em tempo real`}</p>
      </header>
      <PessoasClient present={presentUsers} />
    </>
  );
}
