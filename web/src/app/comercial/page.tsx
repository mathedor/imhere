import { PanelLayout } from "@/components/panel/PanelLayout";
import { ComercialDashboardClient } from "@/components/comercial/DashboardClient";
import { parseRange, rangeToDays } from "@/components/panel/range-utils";
import { getRevenueByDay } from "@/lib/db/admin-dashboard";
import { getMyLeadCounts } from "@/lib/db/leads";
import { getMyCommercialContext } from "@/lib/db/sales-agents";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function ComercialDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeKey = parseRange(range);
  const days = rangeToDays(rangeKey);

  const [ctx, revenueByDay, leadCounts] = await Promise.all([
    getMyCommercialContext(),
    getRevenueByDay(days),
    getMyLeadCounts(),
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
      <ComercialDashboardClient
        ctx={ctx}
        revenueByDay={revenueByDay}
        range={rangeKey}
        days={days}
        leadCounts={leadCounts}
      />
    </PanelLayout>
  );
}
