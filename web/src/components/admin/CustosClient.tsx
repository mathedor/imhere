"use client";

import {
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Package,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/Field";
import {
  ANUAIS,
  DEV_MESES,
  INVESTIMENTO,
  MESES,
  SERVICOS,
  SETUP_DATA,
  SETUP_TOTAL,
  STORAGE_KEY,
  STORAGE_KEY_CUSTOM,
  TIERS,
  USD,
  type DevEntry,
  type ServicoStatus,
} from "@/lib/custos/data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function brl(v: number): string {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseBRL(raw: string): number {
  return parseFloat(String(raw).replace(/\./g, "").replace(",", "."));
}

interface ItemState {
  p?: 0 | 1;
  v?: number;
}
type EstadoMap = Record<string, ItemState>;

interface CustoManual {
  id: number;
  titulo: string;
  valor: number;
  ym: string;
  dia: string;
  rec: boolean;
  from: string;
  obs: string;
}

interface LinhaItem {
  id: string;
  nome: string;
  desc: string;
  valor: number;
  estimado?: boolean;
  manual?: boolean;
  data?: string;
  tokens?: string;
  editavel?: boolean;
  delId?: number;
  valorBase: number;
}

interface Grupo {
  key: string;
  nome: string;
  tag: string;
  coluna: "meses" | "dev";
  itens: LinhaItem[];
  tokensTotal?: number;
}

/* ------------------------------------------------------------------ */

export function CustosClient() {
  const [estado, setEstado] = useState<EstadoMap>({});
  const [custom, setCustom] = useState<CustoManual[]>([]);
  const [aberto, setAberto] = useState<Record<string, boolean>>({ [MESES[0].key]: true, dev08: true });
  const [modal, setModal] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      setEstado(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {});
      setCustom(JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM) || "[]") || []);
    } catch {
      /* storage indisponível — segue com os valores padrão */
    }
    setPronto(true);
  }, []);

  function persistir(next: EstadoMap) {
    setEstado(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignora */
    }
  }

  function persistirCustom(next: CustoManual[]) {
    setCustom(next);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(next));
    } catch {
      /* ignora */
    }
  }

  const pago = (id: string) => Boolean(estado[id]?.p);
  const valor = (id: string, padrao: number) =>
    typeof estado[id]?.v === "number" ? (estado[id]!.v as number) : padrao;

  /* ---------------- montagem dos grupos ---------------- */

  const grupos = useMemo<Grupo[]>(() => {
    const out: Grupo[] = [];

    for (const m of MESES) {
      const itens: LinhaItem[] = m.itens.map((it) => ({
        id: it.id,
        nome: it.nome,
        desc: it.desc,
        valor: valor(it.id, it.valor),
        valorBase: it.valor,
        estimado: it.estimado,
        editavel: true,
      }));

      for (const c of custom) {
        const pertence = c.rec ? c.from <= m.ym : c.ym === m.ym;
        if (!pertence) continue;
        const oid = `c${c.id}-${m.key}`;
        const nomeMesOrigem = MESES.find((x) => x.ym === c.from)?.nome ?? c.from;
        itens.push({
          id: oid,
          nome: c.titulo,
          desc:
            (c.obs ? `${c.obs} · ` : "") +
            (c.rec ? `recorrente desde ${nomeMesOrigem}` : `lançamento único em ${c.dia}`),
          valor: valor(oid, c.valor),
          valorBase: c.valor,
          manual: true,
          editavel: true,
          delId: c.id,
        });
      }

      out.push({ key: m.key, nome: m.nome, tag: m.tag, coluna: "meses", itens });
    }

    for (const dm of DEV_MESES) {
      let tokens = 0;
      const itens: LinhaItem[] = dm.itens.map((e: DevEntry, i) => {
        const tier = TIERS[e[3]];
        tokens += tier.tokens;
        return {
          id: `${dm.key}-${i}`,
          nome: e[1],
          desc: e[2],
          data: e[0],
          valor: tier.brl,
          valorBase: tier.brl,
          tokens: tier.label,
        };
      });
      out.push({ key: dm.key, nome: dm.nome, tag: dm.tag, coluna: "dev", itens, tokensTotal: tokens });
    }

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, custom]);

  const totais = useMemo(() => {
    let devTotal = 0;
    let devTokens = 0;
    let devEntradas = 0;
    let emAberto = 0;
    let emAbertoN = 0;

    for (const g of grupos) {
      for (const it of g.itens) {
        if (!pago(it.id) && it.valor > 0) {
          emAberto += it.valor;
          emAbertoN += 1;
        }
      }
      if (g.coluna === "dev") {
        devTotal += g.itens.reduce((s, it) => s + it.valor, 0);
        devTokens += g.tokensTotal ?? 0;
        devEntradas += g.itens.length;
      }
    }

    const mesAtual = grupos.find((g) => g.key === MESES[0].key)!;
    const mesContas = mesAtual.itens.reduce((s, it) => s + it.valor, 0);
    const mesContasPagas = mesAtual.itens.reduce((s, it) => s + (pago(it.id) ? it.valor : 0), 0);
    const devMesAtual = grupos.find((g) => g.key === DEV_MESES[0].key);
    const mesDev = devMesAtual ? devMesAtual.itens.reduce((s, it) => s + it.valor, 0) : 0;
    const mesDevPago = devMesAtual
      ? devMesAtual.itens.reduce((s, it) => s + (pago(it.id) ? it.valor : 0), 0)
      : 0;
    const mesTotal = mesContas + mesDev;
    const mesPct = mesTotal > 0 ? Math.round(((mesContasPagas + mesDevPago) / mesTotal) * 100) : 100;

    return {
      investido: SETUP_TOTAL + devTotal,
      devTotal,
      devTokens,
      devEntradas,
      emAberto,
      emAbertoN,
      mesContas,
      mesDev,
      mesTotal,
      mesPct,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupos, estado]);

  /* ---------------- ações ---------------- */

  function alternarItem(id: string) {
    const next = { ...estado, [id]: { ...estado[id], p: estado[id]?.p ? 0 : (1 as 0 | 1) } };
    persistir(next);
  }

  function alternarGrupo(g: Grupo) {
    const todosPagos = g.itens.every((it) => pago(it.id) || it.valor === 0);
    const next = { ...estado };
    for (const it of g.itens) next[it.id] = { ...next[it.id], p: todosPagos ? 0 : 1 };
    persistir(next);
  }

  function editarValor(it: LinhaItem) {
    const atual = valor(it.id, it.valorBase);
    const raw = window.prompt(
      `Valor real de "${it.nome}" (R$):`,
      atual.toFixed(2).replace(".", ",")
    );
    if (raw === null) return;
    const num = parseBRL(raw);
    if (Number.isNaN(num) || num < 0) return;
    persistir({ ...estado, [it.id]: { ...estado[it.id], v: Math.round(num * 100) / 100 } });
  }

  function excluirCustom(id: number) {
    const c = custom.find((x) => x.id === id);
    if (!c) return;
    if (!window.confirm(`Excluir o custo "${c.titulo}"${c.rec ? " (some de todos os meses)" : ""}?`))
      return;
    persistirCustom(custom.filter((x) => x.id !== id));
  }

  function salvarCusto(form: {
    titulo: string;
    valor: string;
    data: string;
    rec: boolean;
    from: string;
    obs: string;
  }): string | null {
    const titulo = form.titulo.trim();
    const v = parseBRL(form.valor.trim());
    if (!titulo) return "Informe o título.";
    if (Number.isNaN(v) || v <= 0) return "Informe um valor válido.";
    if (!form.data) return "Informe a data.";
    const ym = form.data.slice(0, 7);
    const dia = `${form.data.slice(8, 10)}/${form.data.slice(5, 7)}`;
    if (!form.rec && !MESES.some((m) => m.ym === ym)) {
      return `Esse mês ainda não está no controle (vai de ${MESES[MESES.length - 1].nome} a ${MESES[0].nome}).`;
    }
    persistirCustom([
      ...custom,
      {
        id: Date.now(),
        titulo,
        valor: Math.round(v * 100) / 100,
        ym,
        dia,
        rec: form.rec,
        from: form.rec ? form.from : ym,
        obs: form.obs.trim(),
      },
    ]);
    setModal(false);
    return null;
  }

  const gruposMeses = grupos.filter((g) => g.coluna === "meses");
  const gruposDev = grupos.filter((g) => g.coluna === "dev");

  /* ---------------- render ---------------- */

  return (
    <>
      <header className="mb-5">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
          Custos &amp; Desenvolvimento
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Quanto o I&apos;m Here custou para existir e quanto custa manter no ar, mês a mês.
        </p>
      </header>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Kpi
          icon={TrendingUp}
          label="Total investido"
          value={brl(totais.investido)}
          sub={`${brl(SETUP_TOTAL)} de setup + ${brl(totais.devTotal)} de desenvolvimento`}
          color="#ef2c39"
        />
        <Kpi
          icon={Wallet}
          label="Custo mensal"
          value={brl(totais.mesContas)}
          sub={`${MESES[0].itens.length} contas fixas · dólar a R$ ${USD.toFixed(2).replace(".", ",")}`}
          color="#3b82f6"
        />
        <Kpi
          icon={CalendarDays}
          label={`Mês corrente · ${MESES[0].nome}`}
          value={brl(totais.mesTotal)}
          sub={`${brl(totais.mesContas)} em contas + ${brl(totais.mesDev)} em desenvolvimento · ${totais.mesPct}% pago`}
          color="#22c55e"
        />
      </div>

      <p className="mb-5 text-xs leading-relaxed text-text-soft">
        <b className="text-text">Como usar:</b> clique no mês para abrir as contas. Marque item a item
        no ✓ ou use &quot;Marcar mês como pago&quot; para baixar tudo de uma vez. Clique em qualquer
        valor para ajustar com o número real da fatura. Valores em dólar convertidos a{" "}
        <b className="text-text">R$ {USD.toFixed(2).replace(".", ",")}</b>. Linhas marcadas como{" "}
        <span className="rounded-pill bg-warn/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-warn">
          estimado
        </span>{" "}
        ainda precisam da fatura real para fechar. As contas fixas são a cesta padrão da casa: mesmo
        quando o serviço é compartilhado com outros projetos, o I&apos;m Here entra com o valor
        cheio.
        {pronto && totais.emAberto > 0 && (
          <>
            {" "}
            Hoje há <b className="text-brand">{brl(totais.emAberto)}</b> em aberto (
            {totais.emAbertoN} lançamentos).
          </>
        )}
      </p>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {/* coluna esquerda — contas mês a mês */}
        <section>
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
              <CalendarDays className="size-3.5" />
              Contas mês a mês
            </span>
            <button
              type="button"
              onClick={() => setModal(true)}
              className="flex items-center gap-1 rounded-pill border border-brand/40 bg-brand/10 px-3 py-1.5 text-[0.7rem] font-bold text-brand transition-colors hover:bg-brand/20"
            >
              <Plus className="size-3.5" />
              Registrar custo
            </button>
          </div>

          {gruposMeses.map((g) => (
            <Acordeao
              key={g.key}
              grupo={g}
              aberto={!!aberto[g.key]}
              onToggle={() => setAberto((a) => ({ ...a, [g.key]: !a[g.key] }))}
              pago={pago}
              onItem={alternarItem}
              onGrupo={() => alternarGrupo(g)}
              onEditar={editarValor}
              onExcluir={excluirCustom}
            />
          ))}
        </section>

        {/* coluna direita — investimento, desenvolvimento e serviços */}
        <section>
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
              <Package className="size-3.5" />
              Investimento, desenvolvimento &amp; serviços
            </span>
          </div>

          {/* setup inicial */}
          <Card
            aberto={!!aberto.invest}
            onToggle={() => setAberto((a) => ({ ...a, invest: !a.invest }))}
            done
            titulo="Setup inicial (investimento)"
            pill="Pago"
            tag={`Valor contratado da plataforma — entregue em ${SETUP_DATA}`}
            totalLabel={brl(SETUP_TOTAL)}
            totalSub="já liquidado — não entra no custo mensal"
          >
            {INVESTIMENTO.map((l) => (
              <div
                key={l.nome}
                className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text">{l.nome}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-soft">{l.desc}</p>
                </div>
                <p className="whitespace-nowrap text-sm font-black tabular-nums text-success">
                  {brl(l.valor)}
                </p>
              </div>
            ))}
          </Card>

          {/* desenvolvimento pós-entrega */}
          {gruposDev.map((g) => (
            <Acordeao
              key={g.key}
              grupo={g}
              aberto={!!aberto[g.key]}
              onToggle={() => setAberto((a) => ({ ...a, [g.key]: !a[g.key] }))}
              pago={pago}
              onItem={alternarItem}
              onGrupo={() => alternarGrupo(g)}
            />
          ))}

          {/* anuais / únicos */}
          <Card
            aberto={!!aberto.anuais}
            onToggle={() => setAberto((a) => ({ ...a, anuais: !a.anuais }))}
            titulo="Custos anuais e de uma vez só"
            tag="Fora do custo mensal — ligados à publicação dos apps"
            totalLabel={`${ANUAIS.length} itens`}
            totalSub="informativo · não somam no mês"
          >
            {ANUAIS.map((a) => (
              <div
                key={a.nome}
                className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-text">
                    {a.nome}
                    <span className="rounded-pill bg-surface-3 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-text-soft">
                      {a.periodicidade}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-soft">{a.desc}</p>
                </div>
                <p className="whitespace-nowrap text-right text-xs font-bold tabular-nums text-text-soft">
                  {a.custo}
                </p>
              </div>
            ))}
          </Card>

          {/* apis & serviços */}
          <Card
            aberto={!!aberto.apis}
            onToggle={() => setAberto((a) => ({ ...a, apis: !a.apis }))}
            titulo="APIs & serviços conectados"
            tag="Taxas por transação e serviços gratuitos usados pela plataforma"
            totalLabel={`${SERVICOS.length} serviços`}
            totalSub="taxas embutidas na operação"
          >
            {SERVICOS.map((s) => (
              <div
                key={s.nome}
                className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-text">
                    {s.nome}
                    <StatusPill status={s.status} />
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-soft">{s.desc}</p>
                </div>
                <p className="whitespace-nowrap text-right text-xs font-bold tabular-nums text-text-soft">
                  {s.custo}
                </p>
              </div>
            ))}
          </Card>
        </section>
      </div>

      {modal && (
        <ModalCusto
          onClose={() => setModal(false)}
          onSave={salvarCusto}
          meses={MESES.map((m) => ({ ym: m.ym, nome: m.nome })).reverse()}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4">
      <div
        className="grid size-9 place-items-center rounded-xl"
        style={{ background: `${color}25`, color }}
      >
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-text">{value}</p>
      <p className="mt-1 text-[0.68rem] leading-snug text-text-soft">{sub}</p>
      <span
        className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
    </div>
  );
}

function StatusPill({ status }: { status: ServicoStatus }) {
  const map: Record<ServicoStatus, { label: string; cls: string }> = {
    ativo: { label: "Ativo", cls: "bg-brand/15 text-brand" },
    gratis: { label: "Grátis", cls: "bg-success/15 text-success" },
    pend: { label: "Pendente", cls: "bg-warn/15 text-warn" },
    anual: { label: "Anual", cls: "bg-surface-3 text-text-soft" },
  };
  const s = map[status];
  return (
    <span
      className={cn(
        "rounded-pill px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide",
        s.cls
      )}
    >
      {s.label}
    </span>
  );
}

function Card({
  aberto,
  onToggle,
  titulo,
  tag,
  pill,
  totalLabel,
  totalSub,
  done,
  barra,
  children,
}: {
  aberto: boolean;
  onToggle: () => void;
  titulo: string;
  tag: string;
  pill?: string;
  totalLabel: string;
  totalSub: string;
  done?: boolean;
  barra?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-3 overflow-hidden rounded-2xl border bg-surface",
        done ? "border-success/45" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 text-left transition-colors hover:bg-surface-2"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-sm font-black text-text">
              <ChevronRight
                className={cn("size-3.5 shrink-0 text-muted transition-transform", aberto && "rotate-90")}
              />
              {titulo}
              {pill && (
                <span className="rounded-pill bg-success/15 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-success">
                  {pill}
                </span>
              )}
            </p>
            <p className="mt-0.5 pl-5 text-[0.68rem] leading-snug text-muted">{tag}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className={cn("text-sm font-black tabular-nums", done ? "text-success" : "text-text")}>
              {totalLabel}
            </p>
            <p className="text-[0.62rem] text-muted">{totalSub}</p>
          </div>
        </div>
        {typeof barra === "number" && (
          <span className="mt-2 block h-1.5 overflow-hidden rounded-pill bg-surface-3">
            <span
              className="block h-full rounded-pill bg-success transition-all"
              style={{ width: `${barra}%` }}
            />
          </span>
        )}
      </button>
      {aberto && <div className="border-t border-border">{children}</div>}
    </div>
  );
}

function Acordeao({
  grupo,
  aberto,
  onToggle,
  pago,
  onItem,
  onGrupo,
  onEditar,
  onExcluir,
}: {
  grupo: Grupo;
  aberto: boolean;
  onToggle: () => void;
  pago: (id: string) => boolean;
  onItem: (id: string) => void;
  onGrupo: () => void;
  onEditar?: (it: LinhaItem) => void;
  onExcluir?: (id: number) => void;
}) {
  const total = grupo.itens.reduce((s, it) => s + it.valor, 0);
  const pagoTotal = grupo.itens.reduce((s, it) => s + (pago(it.id) ? it.valor : 0), 0);
  const pct = total > 0 ? Math.round((pagoTotal / total) * 100) : 100;
  const done = pct >= 100;
  const ehMes = grupo.coluna === "meses";

  return (
    <Card
      aberto={aberto}
      onToggle={onToggle}
      done={done}
      titulo={grupo.nome}
      pill={done ? "Quitado" : undefined}
      tag={
        grupo.tokensTotal
          ? `${grupo.tag} · ${grupo.itens.length} entregas · ≈ ${grupo.tokensTotal
              .toFixed(1)
              .replace(".", ",")} M tokens`
          : grupo.tag
      }
      totalLabel={brl(total)}
      totalSub={`${pct}% pago`}
      barra={pct}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2/60 px-4 py-2">
        <span className="text-[0.68rem] font-bold tabular-nums text-muted">
          {brl(pagoTotal)} de {brl(total)} pagos
        </span>
        <button
          type="button"
          onClick={onGrupo}
          className={cn(
            "rounded-pill border px-3 py-1 text-[0.68rem] font-bold transition-colors",
            done
              ? "border-border bg-transparent text-muted hover:border-muted"
              : "border-success/50 bg-success/10 text-success hover:bg-success/20"
          )}
        >
          {done ? "Desmarcar tudo" : `Marcar ${ehMes ? "mês" : "tudo"} como pago`}
        </button>
      </div>

      {grupo.itens.map((it) => {
        const p = pago(it.id);
        return (
          <div
            key={it.id}
            className={cn(
              "grid grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-border px-4 py-3 last:border-b-0",
              p && "bg-success/[0.06]"
            )}
          >
            <button
              type="button"
              onClick={() => onItem(it.id)}
              aria-label={p ? "Desmarcar como pago" : "Marcar como pago"}
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                p
                  ? "border-success bg-success text-white"
                  : "border-border text-transparent hover:border-success"
              )}
            >
              <Check className="size-3" strokeWidth={3} />
            </button>

            <div className="min-w-0">
              <p
                className={cn(
                  "flex flex-wrap items-center gap-1.5 text-sm font-bold leading-snug",
                  p ? "text-success" : "text-text"
                )}
              >
                {it.data && (
                  <span className="rounded-pill bg-surface-3 px-1.5 py-0.5 text-[0.58rem] font-bold tabular-nums text-text-soft">
                    {it.data}
                  </span>
                )}
                {it.nome}
                {it.estimado && (
                  <span className="rounded-pill bg-warn/15 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-warn">
                    estimado
                  </span>
                )}
                {it.manual && (
                  <span className="rounded-pill bg-brand/15 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-brand">
                    manual
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-text-soft">{it.desc}</p>
            </div>

            <div className="flex shrink-0 items-start gap-1">
              <button
                type="button"
                disabled={!it.editavel || !onEditar}
                onClick={() => it.editavel && onEditar?.(it)}
                title={it.editavel ? "Clique para ajustar o valor" : undefined}
                className={cn(
                  "text-right",
                  it.editavel && onEditar && "cursor-pointer border-b border-dashed border-transparent hover:border-muted"
                )}
              >
                <span
                  className={cn(
                    "block text-sm font-black tabular-nums",
                    p ? "text-success" : "text-text"
                  )}
                >
                  {brl(it.valor)}
                </span>
                {it.tokens && (
                  <span className="block text-[0.6rem] font-semibold text-muted">
                    ≈ {it.tokens} tokens
                  </span>
                )}
              </button>
              {it.delId && onExcluir && (
                <button
                  type="button"
                  onClick={() => onExcluir(it.delId!)}
                  aria-label="Excluir custo manual"
                  className="mt-0.5 text-muted transition-colors hover:text-brand"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function ModalCusto({
  onClose,
  onSave,
  meses,
}: {
  onClose: () => void;
  onSave: (f: {
    titulo: string;
    valor: string;
    data: string;
    rec: boolean;
    from: string;
    obs: string;
  }) => string | null;
  meses: { ym: string; nome: string }[];
}) {
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [rec, setRec] = useState(false);
  const [from, setFrom] = useState(meses[0]?.ym ?? "");
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-black text-text">
            <CircleDollarSign className="size-4 text-brand" />
            Registrar custo
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-8 place-items-center rounded-xl border border-border text-muted transition-colors hover:text-text"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Título">
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Domínio imhere.com.br"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
              />
            </Field>
            <Field label="Data">
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-text">
            <input
              type="checkbox"
              checked={rec}
              onChange={(e) => setRec(e.target.checked)}
              className="size-4 accent-[#ef2c39]"
            />
            Recorrente — repete todos os meses
          </label>
          {rec && (
            <Field label="A partir de">
              <Select value={from} onChange={(e) => setFrom(e.target.value)}>
                {meses.map((m) => (
                  <option key={m.ym} value={m.ym}>
                    {m.nome}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Observação">
            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Opcional" />
          </Field>
          {erro && <p className="text-xs font-bold text-brand">{erro}</p>}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-pill border border-border px-4 py-2 text-xs font-bold text-text-soft transition-colors hover:text-text"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => setErro(onSave({ titulo, valor, data, rec, from, obs }))}
            className="flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-strong to-brand px-4 py-2 text-xs font-bold text-white shadow-glow"
          >
            <BadgeCheck className="size-3.5" />
            Salvar custo
          </button>
        </div>
      </div>
    </div>
  );
}
