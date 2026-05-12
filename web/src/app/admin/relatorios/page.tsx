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
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Relatórios</h1>
        <p className="mt-1 text-sm text-text-soft">Análise completa da operação · escolha período pra refinar</p>
      </header>
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
    </>
  );
}
