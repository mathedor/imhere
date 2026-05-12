import { AdminDashboardClient } from "@/components/admin/DashboardClient";
import { PanelLayout } from "@/components/panel/PanelLayout";
import {
  getAdminDashboardKPIs,
  getPlanDistribution,
  listRecentSubscriptions,
} from "@/lib/db/admin-dashboard";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [kpis, planDist, recentSubs] = await Promise.all([
    getAdminDashboardKPIs(),
    getPlanDistribution(),
    listRecentSubscriptions(),
  ]);

  return (
    <PanelLayout
      scope="admin"
      title="Visão geral da plataforma"
      subtitle="KPIs em tempo real direto do banco"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <AdminDashboardClient kpis={kpis} planDistribution={planDist} recentSubs={recentSubs} />
    </PanelLayout>
  );
}
