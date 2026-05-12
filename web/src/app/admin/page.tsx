import { AdminDashboardClient } from "@/components/admin/DashboardClient";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { parseRange, rangeToDays } from "@/components/panel/range-utils";
import {
  getAdminDashboardKPIs,
  getInteractionsByDay,
  getNewUsersByDay,
  getPlanDistribution,
  getRevenueByDay,
  listRecentSubscriptions,
  type DailyPoint,
  type DashboardKPIs,
  type PlanRow,
  type RecentSubscription,
} from "@/lib/db/admin-dashboard";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

const FALLBACK_KPIS: DashboardKPIs = {
  totalUsers: 0,
  totalEstabs: 0,
  activeCheckins: 0,
  mrrCents: 0,
  totalInteractions: 0,
  totalCreditsInEconomy: 0,
  totalSubscriptions: 0,
  totalMomentsActive: 0,
};

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[admin/page] ${label} falhou:`, err);
    return fallback;
  }
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  let rangeKey: ReturnType<typeof parseRange> = "30d";
  let days = 30;
  try {
    const sp = await searchParams;
    rangeKey = parseRange(sp?.range);
    days = rangeToDays(rangeKey);
  } catch {
    // mantém defaults
  }

  const [kpis, planDist, recentSubs, revenueByDay, usersByDay, interactionsByDay] = await Promise.all([
    safe<DashboardKPIs>(() => getAdminDashboardKPIs(), FALLBACK_KPIS, "getAdminDashboardKPIs"),
    safe<PlanRow[]>(() => getPlanDistribution(), [], "getPlanDistribution"),
    safe<RecentSubscription[]>(() => listRecentSubscriptions(), [], "listRecentSubscriptions"),
    safe<DailyPoint[]>(() => getRevenueByDay(days), [], "getRevenueByDay"),
    safe<DailyPoint[]>(() => getNewUsersByDay(days), [], "getNewUsersByDay"),
    safe<DailyPoint[]>(() => getInteractionsByDay(days), [], "getInteractionsByDay"),
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
