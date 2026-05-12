"use client";

import { NotificationsList } from "@/components/NotificationsList";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export default function ComercialNotificacoesPage() {
  return (
    <PanelLayout
      scope="comercial"
      title="Notificações"
      subtitle="Vendas, comissões e atividades dos seus estabelecimentos"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Renata Vidal", role: "Executiva de contas" }}
    >
      <NotificationsList />
    </PanelLayout>
  );
}
