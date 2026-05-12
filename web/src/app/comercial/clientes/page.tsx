"use client";

import { Users } from "lucide-react";
import { ComingSoonPanel } from "@/components/panel/ComingSoonPanel";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export default function ComercialClientesPage() {
  return (
    <PanelLayout
      scope="comercial"
      title="Contatos & CRM"
      subtitle="Lista de pessoas em estabelecimentos sob sua gestão"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Renata Vidal", role: "Executiva de contas" }}
    >
      <ComingSoonPanel
        icon={Users}
        title="CRM de contatos"
        description="Donos, gerentes e tomadores de decisão dos estabelecimentos da sua carteira."
        features={[
          "Anotações por contato",
          "Tags personalizadas",
          "Histórico de interações",
          "Lembretes de follow-up",
        ]}
      />
    </PanelLayout>
  );
}
