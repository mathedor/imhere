"use client";

import { BarChart3 } from "lucide-react";
import { ComingSoonPanel } from "@/components/panel/ComingSoonPanel";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export default function ComercialRelatoriosPage() {
  return (
    <PanelLayout
      scope="comercial"
      title="Relatórios"
      subtitle="Performance, conversão e ranking"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Renata Vidal", role: "Executiva de contas" }}
    >
      <ComingSoonPanel
        icon={BarChart3}
        title="Relatórios comerciais"
        description="Insights pra você vender mais e mais rápido"
        features={[
          "Taxa de conversão lead → cliente",
          "Tempo médio de fechamento",
          "Ranking entre comerciais",
          "Forecast trimestral",
        ]}
      />
    </PanelLayout>
  );
}
