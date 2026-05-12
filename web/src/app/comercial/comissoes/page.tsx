"use client";

import { CircleDollarSign } from "lucide-react";
import { ComingSoonPanel } from "@/components/panel/ComingSoonPanel";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export default function ComercialComissoesPage() {
  return (
    <PanelLayout
      scope="comercial"
      title="Comissões"
      subtitle="Histórico e detalhamento das suas comissões mensais"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Renata Vidal", role: "Executiva de contas" }}
    >
      <ComingSoonPanel
        icon={CircleDollarSign}
        title="Histórico de comissões"
        description="Detalhamento por mês, estabelecimento e plano. PIX automático no dia 5."
        features={[
          "Extrato mensal exportável",
          "Recorrência (10% MRR enquanto cliente ativo)",
          "Bônus por meta atingida",
          "Recebimento via PIX automático",
        ]}
      />
    </PanelLayout>
  );
}
