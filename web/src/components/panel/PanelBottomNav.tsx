"use client";

import { motion } from "framer-motion";
import { type LucideIcon, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PanelQuickItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  highlight?: boolean;
}

interface Props {
  items: PanelQuickItem[];
  onMenu: () => void;
  scope: "estabelecimento" | "comercial" | "admin";
}

const SCOPE_GRADIENT: Record<Props["scope"], string> = {
  admin: "linear-gradient(135deg, #ef2c39, #b41822)",
  estabelecimento: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  comercial: "linear-gradient(135deg, #a855f7, #7c3aed)",
};

export function PanelBottomNav({ items, onMenu, scope }: Props) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <div className="mx-3 flex w-full max-w-md items-center justify-around gap-1 rounded-[24px] glass-strong p-1.5 shadow-soft">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-1 items-center justify-center">
              <motion.div
                whileTap={{ scale: 0.88 }}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                className={cn(
                  "relative flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-2xl px-1 transition-colors",
                  active ? "text-white" : "text-text hover:bg-surface-2"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="panelBottomPill"
                    className="absolute inset-0 -z-10 rounded-2xl shadow-glow"
                    style={{ background: SCOPE_GRADIENT[scope] }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <Icon className="size-[18px] shrink-0" />
                <span className="text-[10px] font-bold leading-none whitespace-nowrap">
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={cn(
                      "absolute right-1 top-1 grid min-w-4 place-items-center rounded-full px-1 text-[0.55rem] font-bold ring-2 ring-bg",
                      active ? "bg-white text-text" : "bg-brand text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}

        <button onClick={onMenu} className="relative flex flex-1 items-center justify-center">
          <motion.div
            whileTap={{ scale: 0.88 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-text hover:bg-surface-2 transition-colors"
          >
            <Menu className="size-[18px]" />
            <span className="text-[10px] font-bold leading-none">Menu</span>
          </motion.div>
        </button>
      </div>
    </nav>
  );
}
