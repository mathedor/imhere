"use client";

import { Target } from "lucide-react";
import { ComingSoonPanel } from "@/components/panel/ComingSoonPanel";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export default function ComercialPipelinePage() {
  return (
    <PanelLayout
      scope="comercial"
      title="Pipeline de vendas"
      subtitle="Kanban com leads, reuniões, propostas e fechamentos"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Renata Vidal", role: "Executiva de contas" }}
    >
      <ComingSoonPanel
        icon={Target}
        title="Kanban de pipeline"
        description="Arraste leads entre colunas: Novo → Reunião → Proposta → Fechado / Perdido"
        features={[
          "Drag-and-drop entre stages",
          "Forecast por probabilidade",
          "Tarefas e lembretes por lead",
          "Integração com calendário",
        ]}
      />
    </PanelLayout>
  );
}
