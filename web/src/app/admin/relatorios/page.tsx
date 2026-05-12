import { PanelLayout } from "@/components/panel/PanelLayout";
import { RelatoriosClient } from "@/components/admin/RelatoriosClient";
import {
  getAllCheckinsByDay,
  getInteractionsByDay,
  getNewUsersByDay,
  getRevenueByDay,
} from "@/lib/db/admin-dashboard";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const [revenue, users, interactions, checkins] = await Promise.all([
    getRevenueByDay(30),
    getNewUsersByDay(30),
    getInteractionsByDay(30),
    getAllCheckinsByDay(30),
  ]);

  return (
    <PanelLayout
      scope="admin"
      title="Relatórios"
      subtitle="Gere relatórios filtrados e exporte para análise externa"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <RelatoriosClient revenue={revenue} users={users} interactions={interactions} checkins={checkins} />
    </PanelLayout>
  );
}
