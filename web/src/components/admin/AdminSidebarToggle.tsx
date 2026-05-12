"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function AdminSidebarToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid size-9 place-items-center rounded-xl border border-border text-text md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-bg transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="text-sm font-bold text-text">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="grid size-9 place-items-center rounded-full text-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <div onClick={() => setOpen(false)}>{children}</div>
      </aside>
    </>
  );
}
