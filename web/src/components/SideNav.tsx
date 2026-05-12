"use client";

import { motion } from "framer-motion";
import { Bell, Compass, LogOut, MessageCircle, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditBadge } from "./CreditBadge";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

interface SideNavProps {
  unreadChat?: number;
  unreadNotif?: number;
  credits?: number;
}

export function SideNav({ unreadChat = 0, unreadNotif = 0, credits = 0 }: SideNavProps = {}) {
  const pathname = usePathname();
  const items = [
    { href: "/app", label: "Explorar", icon: Compass, desc: "Lugares ao seu redor", badge: 0 },
    { href: "/app/chat", label: "Chat", icon: MessageCircle, desc: "Suas conversas", badge: unreadChat },
    { href: "/app/planos", label: "Planos", icon: Sparkles, desc: "Liberar recursos", badge: 0 },
    { href: "/app/perfil", label: "Perfil", icon: User, desc: "Seu cadastro", badge: 0 },
  ];

  return (
    <aside className="hidden md:flex sticky top-0 h-dvh w-72 shrink-0 flex-col border-r border-border bg-surface/40 px-5 py-6 backdrop-blur-sm">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/app" className="inline-flex">
          <Logo size={36} />
        </Link>
        <ThemeToggle compact />
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative">
              <motion.div
                whileTap={{ scale: 0.97 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors",
                  active ? "text-white" : "text-text-soft hover:bg-white/[0.04] hover:text-text"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sideNavPill"
                    className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft shadow-glow"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <div
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                    active ? "bg-white/15" : "bg-surface-2"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-tight">{item.label}</p>
                  <p
                    className={cn(
                      "truncate text-[0.7rem] leading-tight",
                      active ? "text-white/80" : "text-muted"
                    )}
                  >
                    {item.desc}
                  </p>
                </div>
                {item.badge > 0 && (
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold",
                      active ? "bg-white text-brand" : "bg-brand text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <div className="flex justify-center">
          <CreditBadge balance={credits} />
        </div>

        <Link href="/app/notificacoes">
          <motion.div
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 16 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-brand/40"
          >
            <div className="relative grid size-9 place-items-center rounded-xl bg-surface-2">
              <Bell className="size-4 text-text" />
              {unreadNotif > 0 && (
                <span className="absolute right-1 top-1 size-1.5 rounded-full bg-brand live-dot" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-sm font-semibold text-text">Notificações</div>
            {unreadNotif > 0 && (
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[0.65rem] font-bold text-brand">
                {unreadNotif} nova{unreadNotif > 1 ? "s" : ""}
              </span>
            )}
          </motion.div>
        </Link>

        <form action={signOutAction}>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted transition-colors hover:text-text"
          >
            <LogOut className="size-4" />
            Sair
          </motion.button>
        </form>
      </div>
    </aside>
  );
}
