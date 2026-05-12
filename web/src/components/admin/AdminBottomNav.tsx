"use client";

import { CircleDollarSign, LayoutDashboard, Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/vendas", label: "Vendas", icon: CircleDollarSign },
  { href: "/admin/moderacao", label: "Moderação", icon: ShieldCheck },
];

interface Props {
  /** Conteúdo do menu completo (a Sidebar) */
  drawerContent: React.ReactNode;
}

export function AdminBottomNav({ drawerContent }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Fecha drawer ao trocar de rota
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
          {ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors",
                  active ? "text-brand" : "text-text-soft hover:text-text"
                )}
              >
                <Icon className="size-5" />
                <span className="text-[0.6rem] font-bold">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-text-soft hover:text-text"
          >
            <Menu className="size-5" />
            <span className="text-[0.6rem] font-bold">Mais</span>
          </button>
        </div>
      </nav>

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-72 max-w-[88vw] transform overflow-y-auto border-l border-border bg-bg transition-transform duration-300 md:hidden",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div onClick={() => setDrawerOpen(false)}>{drawerContent}</div>
      </aside>
    </>
  );
}
