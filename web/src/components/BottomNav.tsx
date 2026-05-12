"use client";

import { motion } from "framer-motion";
import { Compass, MessageCircle, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Explorar", icon: Compass },
  { href: "/app/chat", label: "Chat", icon: MessageCircle, badge: 3 },
  { href: "/app/planos", label: "Planos", icon: Sparkles },
  { href: "/app/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <div className="mx-3 flex w-full max-w-md items-center justify-around gap-1 rounded-[24px] glass-strong p-1.5 shadow-soft">
        {items.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 items-center justify-center"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "relative flex h-12 w-full items-center justify-center gap-2 rounded-2xl transition-colors",
                  active ? "text-white" : "text-text-soft hover:text-text"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottomNavPill"
                    className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-brand-strong via-brand to-brand-soft shadow-glow"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <Icon className="size-5 shrink-0" />
                <span
                  className={cn(
                    "text-xs font-semibold transition-all",
                    active ? "opacity-100" : "opacity-0 absolute"
                  )}
                >
                  {item.label}
                </span>
                {"badge" in item && item.badge ? (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-brand text-[0.6rem] font-bold text-white ring-2 ring-bg">
                    {item.badge}
                  </span>
                ) : null}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
