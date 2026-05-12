import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NovoLeadForm } from "@/components/comercial/NovoLeadForm";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { NAV_COMERCIAL, QUICK_COMERCIAL } from "@/lib/panel-nav";

export const dynamic = "force-dynamic";

export default function NovoLeadPage() {
  return (
    <PanelLayout
      scope="comercial"
      title="Novo lead"
      subtitle="Adicione um estabelecimento ao funil"
      nav={NAV_COMERCIAL}
      quickNav={QUICK_COMERCIAL}
      user={{ name: "Comercial", role: "Executivo de contas" }}
    >
      <div className="mb-4">
        <Link
          href="/comercial/pipeline"
          className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text hover:border-brand/40"
        >
          <ArrowLeft className="size-3.5" />
          Voltar pro pipeline
        </Link>
      </div>

      <NovoLeadForm />
    </PanelLayout>
  );
}
