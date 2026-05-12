"use client";

import { notFound, useParams } from "next/navigation";
import { UserForm } from "@/components/admin/UserForm";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { users } from "@/data/users";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export default function EditarUsuarioPage() {
  const params = useParams<{ id: string }>();
  const user = users.find((u) => u.id === params?.id);
  if (!user) notFound();

  return (
    <PanelLayout
      scope="admin"
      title={`Editar · ${user.name}`}
      subtitle={`ID ${user.id}`}
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <UserForm
        mode="edit"
        initial={{
          id: user.id,
          name: user.name,
          email: `${user.id}@imhere.app`,
          whatsapp: "(11) 99999-1234",
          gender: user.gender,
          profession: user.profession,
          bio: user.bio,
          status: user.status,
          role: "user",
          plan: "premium",
        }}
      />
    </PanelLayout>
  );
}
