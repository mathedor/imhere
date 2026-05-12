"use client";

import { UserForm } from "@/components/admin/UserForm";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export default function NovoUsuarioPage() {
  return (
    <PanelLayout
      scope="admin"
      title="Novo usuário"
      subtitle="Cadastro manual pelo admin (sem confirmação de email)"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <UserForm mode="create" />
    </PanelLayout>
  );
}
