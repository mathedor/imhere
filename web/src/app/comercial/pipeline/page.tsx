import { Plus, Target } from "lucide-react";
import Link from "next/link";
import { LeadColumn } from "@/components/comercial/LeadColumn";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { listMyLeads, STAGE_ORDER, type Lead, type LeadStage } from "@/lib/db/leads";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default async function ComercialPipelinePage() {
  const leads = await listMyLeads();

  const byStage: Record<LeadStage, Lead[]> = {
    new: [],
    meeting: [],
    proposal: [],
    closed_won: [],
    closed_lost: [],
  };
  for (const l of leads) byStage[l.stage].push(l);

  return (
    <PanelLayout
      scope="comercial"
      title="Pipeline de vendas"
      subtitle={`${leads.length} lead${leads.length !== 1 ? "s" : ""} no funil`}
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Comercial", role: "Executivo de contas" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted">
          <Target className="size-3.5 text-brand" />
          Kanban
        </span>
        <Link
          href="/comercial/pipeline/novo"
          className="flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-4 py-2 text-sm font-bold text-white shadow-glow"
        >
          <Plus className="size-4" />
          Novo lead
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGE_ORDER.map((stage) => (
          <LeadColumn key={stage} stage={stage} leads={byStage[stage]} />
        ))}
      </div>

      {byStage.closed_lost.length > 0 && (
        <details className="mt-6 rounded-2xl border border-border bg-surface/40 p-4">
          <summary className="cursor-pointer text-sm font-bold text-text-soft">
            Leads perdidos · {byStage.closed_lost.length}
          </summary>
          <div className="mt-3">
            <LeadColumn stage="closed_lost" leads={byStage.closed_lost} compact />
          </div>
        </details>
      )}
    </PanelLayout>
  );
}
