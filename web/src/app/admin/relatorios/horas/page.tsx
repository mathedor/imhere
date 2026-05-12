import Link from "next/link";
import { Clock, MessageSquare, MapPin } from "lucide-react";
import { BarChart } from "@/components/panel/BarChart";
import { KpiCard } from "@/components/panel/KpiCard";
import { getCheckinsHourly, getMessagesHourly, type HourlyPoint } from "@/lib/db/admin-indices";
import type { Period } from "@/lib/db/admin-reports";

export const dynamic = "force-dynamic";

function parsePeriod(v?: string): Period {
  if (v === "today" || v === "7d" || v === "30d") return v;
  return "30d";
}

function peakHour(rows: HourlyPoint[]): { hour: number; count: number } | null {
  if (!rows.length) return null;
  let best = rows[0];
  for (const r of rows) if (r.count > best.count) best = r;
  return best.count === 0 ? null : best;
}

function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}h`;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);

  const [checkins, messages] = await Promise.all([
    getCheckinsHourly(period),
    getMessagesHourly(period),
  ]);

  const peakCheckins = peakHour(checkins);
  const peakMessages = peakHour(messages);

  const checkinsData = checkins.map((r) => ({ label: hourLabel(r.hour), value: r.count }));
  const messagesData = messages.map((r) => ({ label: hourLabel(r.hour), value: r.count }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Hora de uso</h1>
        <p className="mt-1 text-sm text-text-soft">Quando o app mais bomba</p>
      </header>

      <div className="mb-5 flex gap-2">
        {(["today", "7d", "30d"] as const).map((p) => (
          <Link
            key={p}
            href={p === "30d" ? "?" : `?period=${p}`}
            className={`rounded-pill px-3 py-1.5 text-xs font-bold ${
              period === p
                ? "bg-gradient-to-r from-brand-strong to-brand text-white shadow-glow"
                : "border border-border bg-surface text-text-soft hover:text-text"
            }`}
          >
            {p === "today" ? "Hoje" : p === "7d" ? "7 dias" : "30 dias"}
          </Link>
        ))}
      </div>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <KpiCard
          icon={MapPin}
          label="Pico de check-ins"
          value={peakCheckins ? hourLabel(peakCheckins.hour) : "—"}
          delta={peakCheckins ? { value: 0, sign: "up", period: `${peakCheckins.count} no horário` } : undefined}
          color="#22c55e"
          index={0}
        />
        <KpiCard
          icon={MessageSquare}
          label="Pico de mensagens"
          value={peakMessages ? hourLabel(peakMessages.hour) : "—"}
          delta={peakMessages ? { value: 0, sign: "up", period: `${peakMessages.count} no horário` } : undefined}
          color="#ef2c39"
          index={1}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-4 text-success" />
            <h2 className="text-sm font-bold text-text">Check-ins por hora</h2>
          </div>
          <BarChart data={checkinsData} color="#22c55e" height={220} />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-4 text-brand" />
            <h2 className="text-sm font-bold text-text">Mensagens por hora</h2>
          </div>
          <BarChart data={messagesData} color="#ef2c39" height={220} />
        </div>
      </section>
    </>
  );
}
