import { PanelLayout } from "@/components/panel/PanelLayout";
import { ComercialDashboardClient } from "@/components/comercial/DashboardClient";
import { getRevenueByDay } from "@/lib/db/admin-dashboard";
import { getMyCommercialContext } from "@/lib/db/sales-agents";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function ComercialDashboard() {
  const [ctx, revenueByDay] = await Promise.all([
    getMyCommercialContext(),
    getRevenueByDay(30),
  ]);

  return (
    <PanelLayout
      scope="comercial"
      title="Painel Comercial"
      subtitle="Acompanhe estabelecimentos, vendas e comissões"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: ctx.profile?.name ?? "Comercial", role: "Executivo de contas" }}
    >
      <ComercialDashboardClient ctx={ctx} revenueByDay={revenueByDay} />
    </PanelLayout>
  );
}
