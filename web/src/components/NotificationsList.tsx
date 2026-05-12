"use client";

import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { KIND_META, mockNotifications, type MockNotification } from "@/data/notifications";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

interface Props {
  /** Lista a renderizar; se omitido usa mock */
  items?: MockNotification[];
}

export function NotificationsList({ items = mockNotifications }: Props) {
  const [notifs, setNotifs] = useState(items);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unreadCount = notifs.filter((n) => !n.readAt).length;
  const visible = filter === "unread" ? notifs.filter((n) => !n.readAt) : notifs;

  function markAllLocal() {
    setNotifs(notifs.map((n) => ({ ...n, readAt: n.readAt ?? "lido" })));
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-text-soft">
          {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia"}
        </p>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              onClick={markAllLocal}
              className="flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text hover:border-brand/40"
            >
              <CheckCheck className="size-3.5" />
              Marcar tudo como lido
            </button>
          </form>
        )}
      </header>

      <div className="flex gap-1.5">
        {([
          { key: "all" as const, label: "Tudo" },
          { key: "unread" as const, label: `Não lidas${unreadCount ? ` (${unreadCount})` : ""}` },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-xs font-bold transition-all",
              filter === f.key
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-text-soft hover:text-text"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {visible.length === 0 && (
          <li className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 py-12 text-center">
            <Bell className="size-8 text-muted" />
            <p className="text-sm font-bold text-text">Nada por aqui</p>
            <p className="text-xs text-text-soft">Quando algo acontecer, você é o primeiro a saber.</p>
          </li>
        )}
        {visible.map((n, i) => {
          const meta = KIND_META[n.kind] ?? { icon: "🔔", color: "#6b6b75", label: "Notificação" };
          const unread = !n.readAt;
          const content = (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-3 transition-colors",
                unread
                  ? "border-brand/30 bg-brand/5 hover:bg-brand/10"
                  : "border-border bg-surface hover:bg-surface-2"
              )}
            >
              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl text-base"
                style={{ background: `${meta.color}25` }}
              >
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-text">{n.title}</p>
                  {unread && <span className="size-1.5 shrink-0 rounded-full bg-brand" />}
                </div>
                {n.body && <p className="mt-0.5 truncate text-xs text-text-soft">{n.body}</p>}
                <p className="mt-1 text-[0.65rem] text-muted">
                  <span className="rounded-pill bg-surface-2 px-1.5 py-0.5 font-bold text-text-soft">
                    {meta.label}
                  </span>{" "}
                  · {n.createdAt}
                </p>
              </div>
            </motion.div>
          );
          return (
            <li key={n.id}>
              {n.link ? <Link href={n.link}>{content}</Link> : content}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
