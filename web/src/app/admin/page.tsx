import { AdminDashboardClient } from "@/components/admin/DashboardClient";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { parseRange, rangeToDays } from "@/components/panel/DateRangeUrlFilter";
import {
  getAdminDashboardKPIs,
  getInteractionsByDay,
  getNewUsersByDay,
  getPlanDistribution,
  getRevenueByDay,
  listRecentSubscriptions,
} from "@/lib/db/admin-dashboard";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeKey = parseRange(range);
  const days = rangeToDays(rangeKey);

  const [kpis, planDist, recentSubs, revenueByDay, usersByDay, interactionsByDay] = await Promise.all([
    getAdminDashboardKPIs(),
    getPlanDistribution(),
    listRecentSubscriptions(),
    getRevenueByDay(days),
    getNewUsersByDay(days),
    getInteractionsByDay(days),
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
      <AdminDashboardClient
        kpis={kpis}
        planDistribution={planDist}
        recentSubs={recentSubs}
        revenueByDay={revenueByDay}
        usersByDay={usersByDay}
        interactionsByDay={interactionsByDay}
        range={rangeKey}
      />
    </PanelLayout>
  );
}
