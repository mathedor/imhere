"use client";

import { motion } from "framer-motion";
import { Compass, MessageCircle, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  unreadChat?: number;
}

export function BottomNav({ unreadChat = 0 }: Props = {}) {
  const pathname = usePathname();
  const items = [
    { href: "/app", label: "Explorar", icon: Compass, badge: 0 },
    { href: "/app/chat", label: "Chat", icon: MessageCircle, badge: unreadChat },
    { href: "/app/planos", label: "Planos", icon: Sparkles, badge: 0 },
    { href: "/app/perfil", label: "Perfil", icon: User, badge: 0 },
  ];

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <div className="mx-3 flex w-full max-w-md items-center justify-around gap-1 rounded-[24px] glass-strong p-1.5 shadow-soft">
        {items.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 items-center justify-center"
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                className={cn(
                  "relative flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-2xl px-1",
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
                <Icon className="size-[18px] shrink-0" />
                <span className="text-[10px] font-bold leading-none">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[0.55rem] font-bold text-white ring-2 ring-bg">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
