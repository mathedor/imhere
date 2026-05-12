import { PanelLayout } from "@/components/panel/PanelLayout";
import { RelatoriosClient } from "@/components/admin/RelatoriosClient";
import {
  getCheckinReport,
  getContactReport,
  getGenderReport,
  getNewUsersReport,
  getOnlineUsersReport,
  getSearchReport,
  type Period,
} from "@/lib/db/admin-reports";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

function parsePeriod(value?: string): Period {
  if (value === "today" || value === "7d" || value === "30d" || value === "custom") return value;
  return "30d";
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const fromIso = sp.from;
  const toIso = sp.to;

  const [checkins, newUsers, online, searches, contacts, gender] = await Promise.all([
    getCheckinReport(period, { fromIso, toIso }),
    getNewUsersReport(period, { fromIso, toIso }),
    getOnlineUsersReport(),
    getSearchReport(period, { fromIso, toIso }),
    getContactReport(period, { fromIso, toIso }),
    getGenderReport(),
  ]);

  return (
    <PanelLayout
      scope="admin"
      title="Relatórios"
      subtitle="Análise completa da operação · escolha período pra refinar"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <RelatoriosClient
        period={period}
        fromIso={fromIso}
        toIso={toIso}
        checkins={checkins}
        newUsers={newUsers}
        online={online}
        searches={searches}
        contacts={contacts}
        gender={gender}
      />
    </PanelLayout>
  );
}
