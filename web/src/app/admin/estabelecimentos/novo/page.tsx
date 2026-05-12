"use client";

import { EstablishmentForm } from "@/components/admin/EstablishmentForm";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export default function NovoEstabelecimentoAdminPage() {
  return (
    <PanelLayout
      scope="admin"
      title="Novo estabelecimento"
      subtitle="Cria e atribui um responsável"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <EstablishmentForm mode="create" />
    </PanelLayout>
  );
}
