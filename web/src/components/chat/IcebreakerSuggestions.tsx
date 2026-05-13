"use client";

import { motion } from "framer-motion";
import { MessageCircleHeart, Sparkles } from "lucide-react";

interface Props {
  otherName: string;
  estabName?: string;
  estabType?: string;
  onPick: (text: string) => void;
}

function buildSuggestions(otherName: string, estabName?: string, estabType?: string): string[] {
  const firstName = otherName.split(" ")[0];
  const place = estabName ? `no ${estabName}` : "aqui";

  const generic = [
    `Oi ${firstName}, tudo bem? Tô curtindo ${place} 😊`,
    `${firstName}, qual sua dica de drink ${place}?`,
    `Boa noite ${firstName}! Primeira vez que você vem ${place}?`,
  ];

  // Sugestões específicas por tipo
  const byType: Record<string, string[]> = {
    bar: [
      `${firstName}, recomenda algum drink autoral ${place}?`,
      `Qual seu drink favorito ${place}, ${firstName}?`,
    ],
    restaurant: [
      `${firstName}, o que você pediu ${place}? Tô na dúvida do menu 😅`,
      `Vale a pena pedir entrada ou ir direto pro principal ${place}?`,
    ],
    club: [
      `${firstName}, tá animado(a) com o set de hoje ${place}?`,
      `Que vibe ${place} hein! Já tá indo na pista, ${firstName}?`,
    ],
    show: [
      `${firstName}, primeira vez vendo a banda?`,
      `Tô amando o show ${place} · você também tá curtindo, ${firstName}?`,
    ],
    lounge: [
      `${firstName}, que pôr do sol ${place}, né?`,
      `Mar tá lindo ${place}! Você vem sempre, ${firstName}?`,
    ],
  };

  const specific = (estabType && byType[estabType]) ?? [];
  return [...specific, ...generic].slice(0, 4);
}

export function IcebreakerSuggestions({ otherName, estabName, estabType, onPick }: Props) {
  const suggestions = buildSuggestions(otherName, estabName, estabType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-md rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/10 via-warn/5 to-brand/10 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-warn to-brand text-white shadow-glow">
          <MessageCircleHeart className="size-5" />
        </div>
        <div>
          <p className="text-sm font-black text-text">Quebre o gelo</p>
          <p className="text-[0.65rem] text-text-soft">
            Toque pra usar de inspiração · edite antes de enviar
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {suggestions.map((s, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <button
              onClick={() => onPick(s)}
              className="group flex w-full items-start gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 text-left transition-all hover:border-brand/40 hover:bg-surface-2"
            >
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-warn transition-colors group-hover:text-brand" />
              <span className="flex-1 text-xs leading-snug text-text">{s}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
