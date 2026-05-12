"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";

export function AppHeader() {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between gap-3 px-5 pb-4 pt-[max(env(safe-area-inset-top),14px)] bg-gradient-to-b from-bg via-bg/95 to-transparent backdrop-blur-sm">
      <Link href="/app">
        <Logo size={32} />
      </Link>
      <Link href="/app/notificacoes">
        <motion.div
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -1 }}
          className="relative grid size-11 place-items-center rounded-full border border-border bg-surface text-text transition-colors hover:border-brand/40"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2.5 size-2 rounded-full bg-brand ring-2 ring-bg live-dot" />
        </motion.div>
      </Link>
    </header>
  );
}
