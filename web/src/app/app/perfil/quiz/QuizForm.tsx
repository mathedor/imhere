"use client";

import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveQuizAction } from "@/lib/actions/quiz";
import type { QuizAnswers } from "@/lib/db/quiz";

const QUESTIONS: Array<{
  name: keyof QuizAnswers;
  label: string;
  options: Array<{ value: string; label: string; emoji: string }>;
}> = [
  {
    name: "q1_vibe",
    label: "Que vibe você curte?",
    options: [
      { value: "agitado", label: "Agitado", emoji: "🔥" },
      { value: "tranquilo", label: "Tranquilo", emoji: "🌙" },
      { value: "misto", label: "Depende do dia", emoji: "🎲" },
    ],
  },
  {
    name: "q2_drink",
    label: "Sua bebida preferida?",
    options: [
      { value: "cerveja", label: "Cerveja", emoji: "🍺" },
      { value: "drink", label: "Drink", emoji: "🍹" },
      { value: "vinho", label: "Vinho", emoji: "🍷" },
      { value: "nenhum", label: "Não bebo", emoji: "🥤" },
    ],
  },
  {
    name: "q3_music",
    label: "Estilo musical favorito?",
    options: [
      { value: "sertanejo", label: "Sertanejo", emoji: "🤠" },
      { value: "eletronica", label: "Eletrônica", emoji: "🎧" },
      { value: "pagode", label: "Pagode", emoji: "🥁" },
      { value: "rock", label: "Rock", emoji: "🎸" },
      { value: "indie", label: "Indie/Alternativo", emoji: "🎤" },
    ],
  },
  {
    name: "q4_company",
    label: "Você costuma sair com...",
    options: [
      { value: "sozinho", label: "Sozinho(a)", emoji: "🕺" },
      { value: "amigos", label: "Galera", emoji: "👯" },
      { value: "casal", label: "Par", emoji: "💞" },
      { value: "familia", label: "Família", emoji: "👨‍👩‍👧" },
    ],
  },
  {
    name: "q5_time",
    label: "Horário ideal?",
    options: [
      { value: "jantar", label: "Jantar (até 21h)", emoji: "🍽️" },
      { value: "happy", label: "Happy hour (até 0h)", emoji: "🌆" },
      { value: "madrugada", label: "Madrugada (até o fim)", emoji: "🌃" },
    ],
  },
];

function nameToFormField(name: keyof QuizAnswers): string {
  return name.replace(/^q(\d)_.*$/, "q$1");
}

export function QuizForm({ initial }: { initial: QuizAnswers | null }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (initial) {
      for (const q of QUESTIONS) {
        const v = initial[q.name];
        if (v) out[nameToFormField(q.name)] = v;
      }
    }
    return out;
  });
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completion = Math.round(
    (QUESTIONS.filter((q) => answers[nameToFormField(q.name)]).length / QUESTIONS.length) * 100
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await saveQuizAction(fd);
    setSaving(false);
    if (res.ok) {
      setSavedOk(true);
      setTimeout(() => router.push("/app/perfil/match-analysis"), 1200);
    } else {
      setError(res.error ?? "Erro ao salvar");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="mb-1 flex items-center justify-between text-[0.7rem] font-bold text-text-soft">
          <span>Progresso</span>
          <span>{completion}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-strong via-brand to-brand-soft transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {QUESTIONS.map((q, i) => {
        const field = nameToFormField(q.name);
        const selected = answers[field];
        return (
          <motion.div
            key={q.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <h2 className="mb-3 text-sm font-bold text-text">
              {i + 1}. {q.label}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt) => {
                const isSelected = selected === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                      isSelected
                        ? "border-brand bg-brand/10 font-bold text-text"
                        : "border-border bg-surface-2/40 text-text-soft hover:border-brand/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name={field}
                      value={opt.value}
                      checked={isSelected}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      className="sr-only"
                    />
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="flex-1">{opt.label}</span>
                    {isSelected && <Check className="size-4 text-brand" />}
                  </label>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || savedOk || completion === 0}
        className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all ${
          saving || savedOk || completion === 0
            ? "bg-surface-2 text-muted"
            : "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow"
        }`}
      >
        {savedOk ? <Check className="size-4" /> : <Send className="size-4" />}
        {savedOk ? "Salvo!" : saving ? "Salvando..." : "Salvar respostas"}
      </button>
    </form>
  );
}
