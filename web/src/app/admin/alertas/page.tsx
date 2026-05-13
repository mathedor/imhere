import { AdminAlertsClient } from "@/components/admin/AdminAlertsClient";
import { listAdminAlerts } from "@/lib/db/match-analysis";

export const dynamic = "force-dynamic";

export default async function AdminAlertasPage() {
  const alerts = await listAdminAlerts(false);

  const counts = alerts.reduce(
    (acc, a) => {
      acc[a.severity] = (acc[a.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Alertas do sistema
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Anomalias e sinais que merecem atenção · resolva quando endereçados
        </p>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Counter label="Críticos" value={counts.critical ?? 0} color="#ef2c39" />
        <Counter label="Altos" value={counts.high ?? 0} color="#f97316" />
        <Counter label="Médios" value={counts.medium ?? 0} color="#f59e0b" />
        <Counter label="Leves" value={counts.low ?? 0} color="#6b6b75" />
      </section>

      <AdminAlertsClient alerts={alerts} />
    </>
  );
}

function Counter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black" style={{ color: value > 0 ? color : undefined }}>
        {value}
      </p>
    </div>
  );
}
