"use client";

import { motion } from "framer-motion";
import { Bell, Compass, LogOut, MessageCircle, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Explorar", icon: Compass, desc: "Lugares ao seu redor" },
  { href: "/app/chat", label: "Chat", icon: MessageCircle, desc: "Suas conversas", badge: 3 },
  { href: "/app/planos", label: "Planos", icon: Sparkles, desc: "Liberar recursos" },
  { href: "/app/perfil", label: "Perfil", icon: User, desc: "Seu cadastro" },
] as const;

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex sticky top-0 h-dvh w-72 shrink-0 flex-col border-r border-border bg-surface/40 px-5 py-6 backdrop-blur-sm">
      <Link href="/app" className="mb-8 inline-flex">
        <Logo size={36} />
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative">
              <motion.div
                whileTap={{ scale: 0.98 }}
                whileHover={{ x: 2 }}
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
                {"badge" in item && item.badge ? (
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold",
                      active ? "bg-white text-brand" : "bg-brand text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -1 }}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-brand/40"
        >
          <div className="relative grid size-9 place-items-center rounded-xl bg-surface-2">
            <Bell className="size-4 text-text" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand live-dot" />
          </div>
          <div className="min-w-0 flex-1 text-sm font-semibold text-text">Notificações</div>
          <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[0.65rem] font-bold text-brand">
            2 novas
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted transition-colors hover:text-text"
        >
          <LogOut className="size-4" />
          Sair
        </motion.button>
      </div>
    </aside>
  );
}
