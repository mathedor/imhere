import { AlertTriangle, Check, ShieldAlert, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { ModerationActions } from "@/components/admin/ModerationActions";
import { listPendingReports } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  harassment: { label: "Assédio", color: "#ef2c39" },
  spam: { label: "Spam / Golpe", color: "#f59e0b" },
  fake: { label: "Perfil falso", color: "#a855f7" },
  offensive: { label: "Ofensa", color: "#ef2c39" },
  safety: { label: "Risco real", color: "#dc2626" },
  other: { label: "Outro", color: "#6b6b75" },
};

function fmtTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default async function ModeracaoPage() {
  const reports = await listPendingReports(50);

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Moderação</h1>
          <p className="mt-1 text-sm text-text-soft">
            {reports.length} denúncia{reports.length !== 1 ? "s" : ""} pendente
            {reports.length !== 1 ? "s" : ""} · revise rapidamente
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand/15 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-brand">
          <ShieldAlert className="size-3.5" />
          Fila ao vivo
        </span>
      </header>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-success/30 bg-success/5 py-16 text-center">
          <ShieldCheck className="mx-auto size-12 text-success" />
          <p className="mt-4 text-base font-bold text-text">Nenhuma denúncia pendente</p>
          <p className="mt-1 text-xs text-text-soft">Comunidade limpinha · bom trabalho.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.map((r) => {
            const cat = CATEGORY_LABELS[r.category] ?? CATEGORY_LABELS.other;
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div
                    className="grid size-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: `${cat.color}25`, color: cat.color }}
                  >
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-pill px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider"
                        style={{ background: `${cat.color}25`, color: cat.color }}
                      >
                        {cat.label}
                      </span>
                      <span className="text-[0.65rem] text-muted">{fmtTimeAgo(r.createdAt)} atrás</span>
                    </div>
                    {r.reportedProfile && (
                      <p className="mt-1 text-sm">
                        <span className="text-text-soft">Denunciado: </span>
                        <Link
                          href={`/admin/usuarios/${r.reportedProfile.id}`}
                          className="font-bold text-text hover:text-brand hover:underline"
                        >
                          {r.reportedProfile.name ?? "—"}
                        </Link>
                      </p>
                    )}
                    {r.description && (
                      <p className="mt-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-soft">
                        {r.description}
                      </p>
                    )}
                  </div>
                </div>

                <ModerationActions reportId={r.id} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
