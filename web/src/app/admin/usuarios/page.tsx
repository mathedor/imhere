import { UsuariosClient } from "@/components/admin/UsuariosClient";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { listAllProfiles } from "@/lib/db/admin-queries";
import { isMockMode } from "@/lib/supabase/config";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";
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
    <PanelLayout
      scope="admin"
      title="Usuários"
      subtitle={`${rows.length.toLocaleString("pt-BR")} cadastrados`}
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <UsuariosClient users={rows} total={rows.length} />
    </PanelLayout>
  );
}
