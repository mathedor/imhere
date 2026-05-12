"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number;
}

interface Props<T extends object> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  emptyText?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends object>({
  columns,
  data,
  pageSize = 10,
  emptyText = "Sem registros",
  rowKey,
  onRowClick,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => String(c.key) === sortKey);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const av = col.accessor ? col.accessor(a) : (a as Record<string, unknown>)[sortKey];
      const bv = col.accessor ? col.accessor(b) : (b as Record<string, unknown>)[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv), "pt-BR")
        : String(bv).localeCompare(String(av), "pt-BR");
    });
  }, [data, sortKey, sortDir, columns]);

  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              {columns.map((col) => {
                const k = String(col.key);
                const isSort = sortKey === k;
                return (
                  <th
                    key={k}
                    className={cn(
                      "select-none whitespace-nowrap px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.sortable && "cursor-pointer hover:text-text"
                    )}
                    onClick={col.sortable ? () => toggleSort(k) : undefined}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable &&
                        (isSort ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="size-3 text-brand" />
                          ) : (
                            <ChevronDown className="size-3 text-brand" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-50" />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-muted">
                  {emptyText}
                </td>
              </tr>
            )}
            {pageData.map((row, i) => (
              <motion.tr
                key={rowKey(row)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-border/60 transition-colors last:border-0",
                  onRowClick && "cursor-pointer hover:bg-white/[0.03]"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      "px-4 py-3 text-text",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? "—")}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
          <span className="text-muted">
            {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sorted.length)} de {sorted.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-border px-2.5 py-1 text-text-soft disabled:opacity-40 hover:bg-white/[0.04]"
            >
              Anterior
            </button>
            <span className="px-2 text-text-soft">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-border px-2.5 py-1 text-text-soft disabled:opacity-40 hover:bg-white/[0.04]"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
