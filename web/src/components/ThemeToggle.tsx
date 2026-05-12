"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== "undefined" && localStorage.getItem("imhere-theme")) as Theme | null;
    const initial: Theme = stored ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("imhere-theme", next);
  }

  if (!mounted) return <div className={compact ? "size-9" : "size-11"} />;

  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Modo claro" : "Modo escuro";

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.85, rotate: -180 }}
      whileHover={{ y: -2, rotate: 8 }}
      transition={{ type: "spring", stiffness: 380, damping: 14 }}
      className={
        compact
          ? "relative grid size-9 place-items-center rounded-xl border border-border bg-surface text-text hover:border-brand/40"
          : "relative grid size-11 place-items-center rounded-full border border-border bg-surface text-text hover:border-brand/40"
      }
      title={label}
      aria-label={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Icon className={compact ? "size-4" : "size-5"} />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
