import { Mail, Plus, Trophy, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { listSalesAgents, type SalesAgent } from "@/lib/db/sales-agents";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

function fmtMoney(cents: number): string {
  if (cents >= 100_000) return `R$ ${(cents / 100_000).toFixed(1)}k`;
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const columns: Column<SalesAgent>[] = [
  {
    key: "name",
    label: "Comercial",
    sortable: true,
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-strong to-brand text-xs font-bold text-white">
          {r.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-text">{r.name}</span>
          <span className="flex items-center gap-1 text-[0.7rem] text-muted">
            <Mail className="size-2.5" />
            {r.email}
          </span>
        </div>
      </div>
    ),
  },
  { key: "establishments", label: "Estabelecimentos", sortable: true, align: "right", accessor: (r) => r.establishments },
  {
    key: "mrr",
    label: "MRR sob gestão",
    sortable: true,
    align: "right",
    accessor: (r) => r.mrrCents,
    render: (r) => <span className="font-bold text-text">{fmtMoney(r.mrrCents)}</span>,
  },
  {
    key: "commission",
    label: "Comissão mensal",
    sortable: true,
    align: "right",
    accessor: (r) => r.commissionCents,
    render: (r) => <span className="text-success">{fmtMoney(r.commissionCents)}</span>,
  },
];

export default async function ComerciaisPage() {
  const agents = await listSalesAgents();
  const top3 = [...agents].sort((a, b) => b.mrrCents - a.mrrCents).slice(0, 3);

  return (
    <PanelLayout
      scope="admin"
      title="Comerciais"
      subtitle="Equipe de vendas que cadastra e gerencia estabelecimentos"
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">
          {agents.length} comerciais ativos
        </span>
        <button
          type="button"
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow"
        >
          <Plus className="size-4" />
          Novo comercial
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
          <Users className="mx-auto size-10 text-muted" />
          <p className="mt-3 text-sm font-bold text-text">Nenhum comercial cadastrado</p>
          <p className="mt-1 text-xs text-text-soft">
            Crie um profile com role &quot;sales&quot; pra começar a montar a equipe.
          </p>
        </div>
      ) : (
        <>
          {top3.length > 0 && (
            <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="size-4 text-warn" />
                <h2 className="text-sm font-bold text-text">Ranking do mês</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {top3.map((sa, i) => {
                  const colors = ["#f59e0b", "#94a3b8", "#b45309"];
                  return (
                    <div
                      key={sa.id}
                      className="flex items-center gap-3 rounded-xl bg-surface-2 p-3"
                      style={{ border: `1px solid ${colors[i]}30` }}
                    >
                      <div
                        className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black"
                        style={{ background: `${colors[i]}25`, color: colors[i] }}
                      >
                        #{i + 1}
                      </div>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-sm font-bold text-text">{sa.name}</p>
                        <p className="text-[0.7rem] text-muted">
                          {sa.establishments} estabelecimento{sa.establishments !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-sm font-black text-text">{fmtMoney(sa.mrrCents)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <DataTable columns={columns} data={agents} rowKey={(r) => r.id} pageSize={10} />
        </>
      )}
    </PanelLayout>
  );
}
