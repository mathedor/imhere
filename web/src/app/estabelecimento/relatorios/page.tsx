"use client";

import { BarChart3 } from "lucide-react";
import { ComingSoonPanel } from "@/components/panel/ComingSoonPanel";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

export default function EstabelecimentoRelatoriosPage() {
  return (
    <PanelLayout
      scope="estabelecimento"
      title="Relatórios"
      subtitle="Inteligência sobre seu público e desempenho"
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Carla Pires", role: "Gerente" }}
    >
      <ComingSoonPanel
        icon={BarChart3}
        title="Relatórios detalhados"
        description="Demografia, picos, retenção e funil completo"
        features={[
          "Demografia detalhada por dia/semana",
          "Picos de horário",
          "Retenção (clientes que voltam)",
          "Tempo médio de permanência",
          "Conversão de visitas em conexões",
          "Comparativo com mês anterior",
        ]}
      />
    </PanelLayout>
  );
}
