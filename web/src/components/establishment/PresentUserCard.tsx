"use client";

import { motion } from "framer-motion";
import { Eye, MessageCirclePlus } from "lucide-react";
import Image from "next/image";
import { AppUser } from "@/data/users";

interface Props {
  user: AppUser;
  index: number;
  onClick?: (id: string) => void;
}

export function PresentUserCard({ user, index, onClick }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -3 }}
      onClick={() => onClick?.(user.id)}
      className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-3 text-center transition-colors hover:border-brand/40"
    >
      <div className="relative">
        <div className="relative size-20 overflow-hidden rounded-full ring-2 ring-border transition-all group-hover:ring-brand/60">
          <Image src={user.photo} alt={user.name} fill sizes="80px" className="object-cover" />
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full ring-2 ring-surface"
          style={{
            background:
              user.status === "open"
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #f59e0b, #d97706)",
          }}
          title={user.status === "open" ? "Aberto a conversa" : "Só observando"}
        >
          {user.status === "open" ? (
            <MessageCirclePlus className="size-3 text-white" />
          ) : (
            <Eye className="size-3 text-white" />
          )}
        </span>
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-text">{user.name.split(" ")[0]}</span>
        <span className="text-[0.7rem] text-muted">
          {user.age} · {user.profession}
        </span>
      </div>

      <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[0.6rem] font-semibold text-text-soft">
        chegou {user.checkedInAt}
      </span>
    </motion.button>
  );
}
