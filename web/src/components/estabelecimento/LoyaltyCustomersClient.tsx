"use client";

import { Crown, Gift, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { redeemLoyaltyAction } from "@/lib/actions/loyalty";
import type { CustomerProgressRow } from "@/lib/db/loyalty";
import { cn } from "@/lib/utils";

interface Props {
  customers: CustomerProgressRow[];
}

export function LoyaltyCustomersClient({ customers }: Props) {
  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-12 text-center">
        <Users className="mx-auto size-8 text-muted" />
        <p className="mt-3 text-sm font-bold text-text">Ninguém em progresso ainda</p>
        <p className="mt-1 text-xs text-text-soft">
          Cada check-in conta · clientes aparecem aqui automaticamente
        </p>
      </div>
    );
  }

  const ready = customers.filter((c) => c.ready);
  const inProgress = customers.filter((c) => !c.ready);

  return (
    <div className="flex flex-col gap-5">
      {ready.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Crown className="size-3.5 text-warn" />
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-warn">
              Prontos pra resgatar ({ready.length})
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {ready.map((c) => (
              <CustomerRow key={`${c.programId}-${c.profileId}`} customer={c} highlight />
            ))}
          </ul>
        </div>
      )}

      {inProgress.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-3.5 text-brand" />
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-muted">
              Em progresso ({inProgress.length})
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {inProgress.map((c) => (
              <CustomerRow key={`${c.programId}-${c.profileId}`} customer={c} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CustomerRow({ customer, highlight }: { customer: CustomerProgressRow; highlight?: boolean }) {
  const [redeeming, setRedeeming] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRedeem() {
    setRedeeming(true);
    const fd = new FormData();
    fd.append("programId", customer.programId);
    fd.append("profileId", customer.profileId);
    const result = await redeemLoyaltyAction(fd);
    setRedeeming(false);
    if (result.ok) {
      setDone(true);
    } else {
      alert(result.error ?? "Erro ao resgatar");
    }
  }

  const pct = Math.min(100, (customer.checkinsDone / customer.checkinsRequired) * 100);

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 transition-all",
        highlight
          ? "border-warn bg-warn/10 shadow-glow"
          : "border-border bg-surface"
      )}
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-surface-2">
        {customer.profilePhoto ? (
          <Image src={customer.profilePhoto} alt={customer.profileName} fill sizes="44px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs font-bold text-muted">
            {customer.profileName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-bold text-text">{customer.profileName}</p>
        <p className="text-[0.65rem] text-text-soft">
          {customer.programName} · {customer.rewardLabel}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: highlight
                  ? "linear-gradient(90deg, #f59e0b, #ef2c39)"
                  : "linear-gradient(90deg, #3b82f6, #a855f7)",
              }}
            />
          </div>
          <span className="shrink-0 text-[0.65rem] font-bold text-text">
            {customer.checkinsDone}/{customer.checkinsRequired}
          </span>
        </div>
      </div>

      {customer.ready ? (
        done ? (
          <span className="rounded-pill bg-success/15 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-success">
            ✓ Resgatado
          </span>
        ) : (
          <button
            onClick={handleRedeem}
            disabled={redeeming}
            className="flex shrink-0 items-center gap-1.5 rounded-pill bg-gradient-to-r from-warn via-brand to-brand-strong px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-glow disabled:opacity-50"
          >
            <Gift className="size-3" />
            {redeeming ? "..." : "Liberar"}
          </button>
        )
      ) : (
        <span className="shrink-0 text-[0.65rem] text-muted">
          faltam {customer.checkinsRequired - customer.checkinsDone}
        </span>
      )}
    </li>
  );
}
