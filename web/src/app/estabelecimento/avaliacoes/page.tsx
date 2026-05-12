"use client";

import { motion } from "framer-motion";
import { MessageCircle, Star, ThumbsUp, TrendingUp } from "lucide-react";
import Image from "next/image";
import { KpiCard } from "@/components/panel/KpiCard";

const REVIEWS = [
  { id: "r1", user: "Mariana C.", photo: "https://i.pravatar.cc/100?img=47", stars: 5, when: "Hoje", text: "Lugar incrível, drinks autorais maravilhosos! Vou voltar." },
  { id: "r2", user: "Lucas A.", photo: "https://i.pravatar.cc/100?img=12", stars: 5, when: "Ontem", text: "Música top, ambiente perfeito pra noite de quinta." },
  { id: "r3", user: "Beatriz L.", photo: "https://i.pravatar.cc/100?img=44", stars: 4, when: "2 dias", text: "Cardápio caprichado, só o atendimento demorou um pouco." },
  { id: "r4", user: "Rafael M.", photo: "https://i.pravatar.cc/100?img=33", stars: 5, when: "3 dias", text: "DJ comandando, pôr do sol de tirar o fôlego. 10/10!" },
];

export default function AvaliacoesPage() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Avaliações</h1>
        <p className="mt-1 text-sm text-text-soft">O que seus clientes estão dizendo no I'm Here</p>
      </header>
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={Star} label="Nota média" value="4.8" delta={{ value: 0.2, sign: "up", period: "30 dias" }} color="#f59e0b" index={0} />
        <KpiCard icon={MessageCircle} label="Total avaliações" value="612" delta={{ value: 12, sign: "up" }} color="#3b82f6" index={1} />
        <KpiCard icon={ThumbsUp} label="Recomendariam" value="94%" color="#22c55e" index={2} />
        <KpiCard icon={TrendingUp} label="5 estrelas" value="412" delta={{ value: 18, sign: "up" }} color="#a855f7" index={3} />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">Avaliações recentes</h2>
        <ul className="flex flex-col gap-3">
          {REVIEWS.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <header className="mb-2 flex items-center gap-3">
                <div className="relative size-10 overflow-hidden rounded-full">
                  <Image src={r.photo} alt={r.user} fill sizes="40px" className="object-cover" />
                </div>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-bold text-text">{r.user}</p>
                  <p className="text-[0.7rem] text-muted">{r.when}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`size-3.5 ${j < r.stars ? "fill-warn text-warn" : "text-muted"}`} />
                  ))}
                </div>
              </header>
              <p className="text-sm leading-relaxed text-text-soft">{r.text}</p>
              <div className="mt-3 flex gap-2 text-xs">
                <button className="rounded-pill border border-border bg-surface-2 px-3 py-1 font-bold text-text-soft hover:text-text">
                  Responder
                </button>
                <button className="rounded-pill border border-border bg-surface-2 px-3 py-1 font-bold text-text-soft hover:text-text">
                  Marcar como destaque
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>
    </>
  );
}
