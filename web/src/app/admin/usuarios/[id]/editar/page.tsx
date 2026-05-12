"use client";

import { notFound, useParams } from "next/navigation";
import { UserForm } from "@/components/admin/UserForm";
import { users } from "@/data/users";

export default function EditarUsuarioPage() {
  const params = useParams<{ id: string }>();
  const user = users.find((u) => u.id === params?.id);
  if (!user) notFound();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">{`Editar · ${user.name}`}</h1>
        <p className="mt-1 text-sm text-text-soft">{`ID ${user.id}`}</p>
      </header>
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
    </>
  );
}
