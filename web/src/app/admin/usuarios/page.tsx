import { UsuariosClient } from "@/components/admin/UsuariosClient";
import { listAllProfiles } from "@/lib/db/admin-queries";
import { isMockMode } from "@/lib/supabase/config";
import { users as mockUsers } from "@/data/users";

export const dynamic = "force-dynamic";

export default async function UsuariosAdminPage() {
  const profiles = isMockMode() ? [] : await listAllProfiles();

  const rows = isMockMode()
    ? mockUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: `${u.id}@imhere.app`,
        age: u.age,
        gender: u.gender,
        city: u.city,
        state: u.state,
        profession: u.profession,
        status: u.status,
        role: "user",
        photo: u.photo,
      }))
    : profiles.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        gender: p.gender ?? undefined,
        city: p.city ?? undefined,
        state: p.state ?? undefined,
        profession: p.profession ?? undefined,
        status: p.status,
        role: p.role,
        photo: p.photo_url ?? undefined,
      }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Usuários</h1>
        <p className="mt-1 text-sm text-text-soft">{`${rows.length.toLocaleString("pt-BR")} cadastrados`}</p>
      </header>
      <UsuariosClient users={rows} total={rows.length} />
    </>
  );
}
