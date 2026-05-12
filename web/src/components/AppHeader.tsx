"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  unreadNotif?: number;
}

export function AppHeader({ unreadNotif = 0 }: Props = {}) {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between gap-3 px-5 pb-4 pt-[max(env(safe-area-inset-top),14px)] bg-gradient-to-b from-bg via-bg/95 to-transparent backdrop-blur-sm">
      <Link href="/app">
        <Logo size={32} />
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/app/notificacoes">
          <motion.div
            whileTap={{ scale: 0.88 }}
            whileHover={{ y: -2, rotate: -8 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
            className="relative grid size-11 place-items-center rounded-full border border-border bg-surface text-text transition-colors hover:border-brand/40"
          >
            <Bell className="size-5" />
            {unreadNotif > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[0.55rem] font-bold text-white ring-2 ring-bg">
                {unreadNotif > 99 ? "99+" : unreadNotif}
              </span>
            )}
          </motion.div>
        </Link>
      </div>
    </header>
  );
}
