import { Sparkles } from "lucide-react";
import { getMyQuizAnswers } from "@/lib/db/quiz";
import { QuizForm } from "./QuizForm";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const answers = await getMyQuizAnswers();

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-brand/15 text-brand">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-text">Quiz de afinidade</h1>
          <p className="text-xs text-text-soft">
            5 perguntas rápidas. Usamos pra calcular o match com outras pessoas.
          </p>
        </div>
      </header>

      <QuizForm initial={answers} />
    </div>
  );
}
