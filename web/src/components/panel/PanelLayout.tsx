"use client";

import { motion } from "framer-motion";
import { Bell, LogOut, type LucideIcon, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export interface PanelNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface PanelLayoutProps {
  title: string;
  subtitle?: string;
  nav: PanelNavItem[];
  scope: "estabelecimento" | "comercial" | "admin";
  user: { name: string; role: string; photo?: string };
  children: React.ReactNode;
}

const scopeColors: Record<PanelLayoutProps["scope"], string> = {
  admin: "linear-gradient(135deg, #ef2c39, #b41822)",
  estabelecimento: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  comercial: "linear-gradient(135deg, #a855f7, #7c3aed)",
};

export function PanelLayout({ title, subtitle, nav, scope, user, children }: PanelLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <Logo size={32} />
        <button
          onClick={() => setMobileOpen(false)}
          className="grid size-9 place-items-center rounded-full text-muted md:hidden"
        >
          <X className="size-5" />
        </button>
      </div>

      <span
        className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-pill px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-white"
        style={{ background: scopeColors[scope] }}
      >
        {scope === "admin" ? "Administração" : scope === "estabelecimento" ? "Estabelecimento" : "Comercial"}
      </span>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" + scope && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="relative"
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                whileHover={{ x: 2 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                  active ? "text-white" : "text-text-soft hover:bg-white/[0.04] hover:text-text"
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`panelNav-${scope}`}
                    className="absolute inset-0 -z-10 rounded-2xl shadow-glow"
                    style={{ background: scopeColors[scope] }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 font-semibold">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold",
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
      </nav>

      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
        <div
          className="grid size-9 place-items-center rounded-xl text-sm font-bold text-white"
          style={{ background: scopeColors[scope] }}
        >
          {user.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-bold text-text">{user.name}</p>
          <p className="truncate text-[0.65rem] text-muted">{user.role}</p>
        </div>
        <button className="grid size-7 place-items-center rounded-lg text-muted hover:text-text" title="Sair">
          <LogOut className="size-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden md:flex sticky top-0 h-dvh w-64 shrink-0 border-r border-border bg-surface/40 backdrop-blur-sm">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-bg border-r border-border md:hidden"
      >
        {sidebar}
      </motion.aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/85 px-5 py-4 backdrop-blur-md md:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid size-9 place-items-center rounded-xl border border-border text-text md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black tracking-tight text-text md:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-text-soft md:text-sm">{subtitle}</p>
            )}
          </div>
          <button className="hidden md:grid size-9 place-items-center rounded-xl border border-border text-text-soft hover:text-text">
            <Search className="size-4" />
          </button>
          <button className="relative grid size-9 place-items-center rounded-xl border border-border text-text-soft hover:text-text">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand live-dot" />
          </button>
        </header>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
