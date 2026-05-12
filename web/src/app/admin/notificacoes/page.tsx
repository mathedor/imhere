"use client";

import { NotificationsList } from "@/components/NotificationsList";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export default function AdminNotificacoesPage() {
  return (
    <PanelLayout
      scope="admin"
      title="Notificações"
      subtitle="Atividades, alertas e eventos da plataforma"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <NotificationsList />
    </PanelLayout>
  );
}
