"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Edit3, EyeOff, Gift, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Field, Input, Textarea } from "@/components/Field";
import {
  createLoyaltyProgramAction,
  deleteLoyaltyProgramAction,
  toggleLoyaltyProgramAction,
  updateLoyaltyProgramAction,
} from "@/lib/actions/loyalty";
import type { LoyaltyProgram } from "@/lib/db/loyalty";
import { cn } from "@/lib/utils";

interface Props {
  programs: LoyaltyProgram[];
}

export function LoyaltyProgramsClient({ programs }: Props) {
  const [editing, setEditing] = useState<LoyaltyProgram | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <ProgramCard
            key={p.id}
            program={p}
            onEdit={() => setEditing(p)}
          />
        ))}

        <button
          onClick={() => setCreating(true)}
          className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface/40 p-5 text-muted transition-colors hover:border-brand/60 hover:text-brand"
        >
          <div className="grid size-12 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Plus className="size-6" />
          </div>
          <p className="text-sm font-bold">Criar programa</p>
          <p className="text-[0.65rem]">Ex: 5 check-ins = drink grátis</p>
        </button>
      </div>

      <AnimatePresence>
        {(creating || editing) && (
          <ProgramDrawer
            program={editing}
            onClose={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ProgramCard({ program, onEdit }: { program: LoyaltyProgram; onEdit: () => void }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4",
        program.active
          ? "border-border bg-surface"
          : "border-dashed border-border bg-surface/40 opacity-70"
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-warn to-brand text-white shadow-glow">
            <Gift className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-text">{program.name}</p>
            {program.description && (
              <p className="text-[0.65rem] text-text-soft">{program.description}</p>
            )}
          </div>
        </div>
        {!program.active && (
          <span className="rounded-pill bg-muted/20 px-2 py-0.5 text-[0.55rem] font-bold uppercase text-muted">
            Inativo
          </span>
        )}
      </header>

      <div className="rounded-xl bg-surface-2 p-3 text-center">
        <p className="text-3xl font-black text-brand">
          {program.checkins_required}
          <span className="ml-1 text-xs font-normal text-muted">check-ins</span>
        </p>
        <p className="mt-1 text-xs font-bold text-text">→ {program.reward_label}</p>
        {program.reward_description && (
          <p className="mt-0.5 text-[0.6rem] text-text-soft">{program.reward_description}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-border pt-2">
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-[0.7rem] font-bold text-text-soft hover:text-text"
        >
          <Edit3 className="size-3" />
          Editar
        </button>
        <form action={toggleLoyaltyProgramAction}>
          <input type="hidden" name="id" value={program.id} />
          <input type="hidden" name="active" value={program.active ? "true" : "false"} />
          <button
            type="submit"
            className="grid size-7 place-items-center rounded-lg bg-surface-2 text-text-soft hover:text-text"
            title={program.active ? "Desativar" : "Reativar"}
          >
            <EyeOff className="size-3.5" />
          </button>
        </form>
        <form
          action={deleteLoyaltyProgramAction}
          onSubmit={(e) => {
            if (!confirm("Apagar este programa? O progresso dos clientes será perdido.")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={program.id} />
          <button
            type="submit"
            className="grid size-7 place-items-center rounded-lg bg-surface-2 text-text-soft hover:text-brand"
            title="Apagar"
          >
            <Trash2 className="size-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function ProgramDrawer({
  program,
  onClose,
}: {
  program: LoyaltyProgram | null;
  onClose: () => void;
}) {
  const isEdit = !!program;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-base font-black text-text">
              {isEdit ? "Editar programa" : "Novo programa de fidelidade"}
            </h3>
            <p className="text-xs text-text-soft">
              Cliente faz X check-ins, ganha Y
            </p>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:text-text">
            <X className="size-4" />
          </button>
        </header>

        <form
          action={isEdit ? updateLoyaltyProgramAction : createLoyaltyProgramAction}
          onSubmit={() => setTimeout(onClose, 200)}
          className="flex flex-col gap-3 p-4"
        >
          {isEdit && program && <input type="hidden" name="id" value={program.id} />}

          <Field label="Nome do programa">
            <Input
              name="name"
              required
              defaultValue={program?.name ?? "Cliente fiel"}
              placeholder="Ex: Brava VIP"
            />
          </Field>

          <Field label="Quantos check-ins?">
            <Input
              name="checkinsRequired"
              type="number"
              min="1"
              max="100"
              required
              defaultValue={program?.checkins_required ?? 5}
            />
          </Field>

          <Field label="Recompensa (nome)">
            <Input
              name="rewardLabel"
              required
              defaultValue={program?.reward_label ?? "Drink grátis"}
              placeholder="Ex: Drink grátis, Welcome shot, Mesa premium"
            />
          </Field>

          <Field label="Descrição da recompensa" hint="Opcional · explica pro cliente o que ele ganha">
            <Textarea
              name="rewardDescription"
              defaultValue={program?.reward_description ?? ""}
              rows={2}
              placeholder="Ex: Escolha qualquer drink da casa, válido no próximo check-in"
            />
          </Field>

          <Field label="Descrição do programa" hint="Opcional">
            <Textarea
              name="description"
              defaultValue={program?.description ?? ""}
              rows={2}
              placeholder="Ex: Pra quem é da casa de verdade"
            />
          </Field>

          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
          >
            <Gift className="size-4" />
            {isEdit ? "Salvar alterações" : "Criar programa"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
