"use client";

import { NotificationsList } from "@/components/NotificationsList";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ESTAB, QUICK_ESTAB } from "@/lib/panel-nav";

export default function EstabelecimentoNotificacoesPage() {
  return (
    <PanelLayout
      scope="estabelecimento"
      title="Notificações"
      subtitle="Check-ins, cortesias resgatadas e mensagens"
      nav={NAV_ESTAB}
      quickNav={QUICK_ESTAB}
      user={{ name: "Carla Pires", role: "Gerente" }}
    >
      <NotificationsList />
    </PanelLayout>
  );
}
