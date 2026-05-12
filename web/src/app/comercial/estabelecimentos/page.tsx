"use client";

import { Building2 } from "lucide-react";
import { ComingSoonPanel } from "@/components/panel/ComingSoonPanel";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export default function ComercialEstabelecimentosPage() {
  return (
    <PanelLayout
      scope="comercial"
      title="Meus estabelecimentos"
      subtitle="Lista completa dos estabelecimentos que você gerencia"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Renata Vidal", role: "Executiva de contas" }}
    >
      <ComingSoonPanel
        icon={Building2}
        title="Lista detalhada chegando"
        description="A versão atual está no dashboard. Em breve: filtros avançados, exportação, atribuição em massa."
        features={[
          "Filtro por status (ativo/trial/lead)",
          "Exportar CSV com todos os contatos",
          "Reatribuir vendedor responsável",
          "Histórico de interações por estabelecimento",
        ]}
      />
    </PanelLayout>
  );
}
