/* ─────────────────────────────────────────────────────────────────────────────
   OS MESES DA PÁGINA = O QUE ESTÁ ESCRITO + O QUE NASCE SOZINHO + A ANA

   `data.ts` é escrito à mão e a Ana lê ele do GitHub do jeito que está
   (MESES[0].itens são as contas atuais; DEV_MESES o desenvolvimento) — por
   isso nada daqui mexe nele. A página monta tudo por estas funções, e a
   conferência roda as mesmas.

   1. O mês nasce sozinho (06/10/2026). MESES parava no último mês que alguém
      lembrou de acrescentar — em outubro a página ainda abria em agosto.
      Regra do dono: no dia 1º o mês já tem que estar aqui, com as contas. Mês
      que falta até o corrente (fuso de São Paulo) repete as contas do mês
      escrito mais recente; anuidade/pagamento único não se repete. O preço
      real da Ana (comValorDaAna) continua indo pro mês corrente. Quem escrever
      o mês no arquivo depois manda: o gerado deixa de nascer.

   2. O que a Ana entregou aqui:
      · tarefa → entra no desenvolvimento do mês dela, pelo tier, igual a uma
        sessão escrita à mão (a margem de set/2026 incluída). A Ana soma igual
        no dev do mês dela, então os dois números batem;
      · pedido → fatura própria, cobrada de quem pediu: fica fora do mês, num
        bloco à parte, com o pago da fatura (só leitura).
   ───────────────────────────────────────────────────────────────────────────── */

import { DEV_MESES, MESES, TIERS, type MesCustos, type Tier } from "./data";
import type { EntregaDaAna, PagamentosAna, SaldoAna } from "../custosAna";

const NOMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

/** "2026-10" → "Outubro 2026" */
export const nomeDoMes = (ym: string) => `${NOMES[Number(ym.slice(5, 7)) - 1] ?? ym} ${ym.slice(0, 4)}`;

/** Mês corrente (AAAA-MM) no fuso de São Paulo. */
export function mesCorrenteSP(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" })
    .format(new Date())
    .slice(0, 7);
}

const proximo = (ym: string) => {
  const a = Number(ym.slice(0, 4)), m = Number(ym.slice(5, 7));
  return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`;
};

/** Conta que não se repete todo mês (não nasce no mês gerado). */
const naoRepete = (nome: string, desc: string) => /anuidade|anual|pontual|único|única vez/i.test(`${nome} ${desc}`);

/** Todos os meses de contas, do mês corrente (em cima) até o primeiro escrito. */
export function mesesAteHoje(agora: string = mesCorrenteSP()): MesCustos[] {
  const lista = [...MESES];
  if (!/^\d{4}-\d{2}$/.test(agora) || !lista.length) return lista;
  let base = lista[0];
  while (base.ym < agora) {
    const ym = proximo(base.ym);
    const curto = `m${ym.slice(5, 7)}`;
    /* "m08" de 2027 não pode bater com o "m08" de 2026 (é a chave do ✓) */
    const key = lista.some((x) => x.key === curto) ? `m${ym.replace("-", "")}` : curto;
    const novo: MesCustos = {
      key,
      ym,
      nome: nomeDoMes(ym),
      tag: ym === agora ? "mês corrente · contas geradas sozinhas no dia 1º" : "mês cheio · contas geradas sozinhas",
      itens: base.itens
        .filter((it) => !naoRepete(it.nome, it.desc))
        .map((it) => ({ ...it, id: it.id.replace(/^[^-]+-/, `${key}-`) })),
    };
    lista.unshift(novo);
    base = novo;
  }
  /* o "mês corrente · parcial" que ficou pra trás vira mês cheio */
  return lista.map((m) => (m.ym < agora && /mês corrente/.test(m.tag) ? { ...m, tag: "mês cheio" } : m));
}

/* ── desenvolvimento ── */

export type LinhaDev = {
  /** `<key>-<i>` pras sessões escritas à mão (como sempre foi — o ✓ antigo
   *  continua no lugar); `<key>-ana:<ref>` pras tarefas da Ana */
  id: string;
  data: string;
  nome: string;
  desc: string;
  tier: Tier;
  ana?: true;
};

export type GrupoDev = { key: string; ym: string; nome: string; tag: string; itens: LinhaDev[] };

const ddmm = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
const diaDe = (data: string) => Number(data.slice(0, 2)) || 0;

/** DEV_MESES + as tarefas da Ana, mês mais recente em cima. Mês que só tem
 *  tarefa da Ana nasce aqui. Com tarefa da Ana misturada, o mês fica em ordem
 *  de data (mais nova em cima); sem ela, a ordem do arquivo não muda. */
export function devMesesComAna(entregas: EntregaDaAna[]): GrupoDev[] {
  const grupos: GrupoDev[] = DEV_MESES.map((dm) => ({
    key: dm.key,
    ym: dm.ym,
    nome: dm.nome,
    tag: dm.tag,
    itens: dm.itens.map(([data, nome, desc, tier], i) => ({ id: `${dm.key}-${i}`, data, nome, desc, tier })),
  }));
  const comAna = new Set<GrupoDev>();
  for (const e of entregas) {
    if (e.tipo !== "tarefa") continue;
    const ym = e.dia.slice(0, 7);
    let g = grupos.find((x) => x.ym === ym);
    if (!g) {
      const curto = `dev${ym.slice(5, 7)}`;
      g = {
        key: grupos.some((x) => x.key === curto) ? `dev${ym.replace("-", "")}` : curto,
        ym,
        nome: `Desenvolvimento — ${nomeDoMes(ym)}`,
        tag: "entregas da Ana neste mês",
        itens: [],
      };
      grupos.push(g);
    }
    g.itens.push({
      id: `${g.key}-ana:${e.ref}`,
      data: ddmm(e.dia),
      nome: e.titulo,
      desc: e.descricao,
      tier: e.tier in TIERS ? e.tier : "P",
      ana: true,
    });
    comAna.add(g);
  }
  for (const g of comAna) g.itens.sort((a, b) => diaDe(b.data) - diaDe(a.data));
  return grupos.sort((a, b) => b.ym.localeCompare(a.ym));
}

/* ── pedidos ── */

export type PedidoDaAna = {
  id: string;
  numero: string;
  data: string;
  nome: string;
  desc: string;
  quem: string | null;
  valor: number;
  tokens: number;
  pago: boolean;
};

export type GrupoPedidos = { key: string; ym: string; nome: string; itens: PedidoDaAna[] };

/** Pedidos entregues pela Ana, um grupo por mês, mais recente em cima. */
export function pedidosDaAnaPorMes(entregas: EntregaDaAna[]): GrupoPedidos[] {
  const porYm = new Map<string, GrupoPedidos>();
  for (const e of entregas) {
    if (e.tipo !== "pedido") continue;
    const ym = e.dia.slice(0, 7);
    const g = porYm.get(ym) ?? { key: `ped${ym.replace("-", "")}`, ym, nome: `Pedidos pela Ana — ${nomeDoMes(ym)}`, itens: [] };
    porYm.set(ym, g);
    g.itens.push({
      id: `ped-${e.ref}`,
      numero: e.ref.split(":")[1] ?? "",
      data: ddmm(e.dia),
      nome: e.titulo,
      desc: e.descricao,
      quem: e.quem,
      valor: (e.valor_centavos ?? 0) / 100,
      tokens: e.tokens_milhoes,
      pago: e.pago,
    });
  }
  const out = [...porYm.values()].sort((a, b) => b.ym.localeCompare(a.ym));
  for (const g of out) g.itens.sort((a, b) => diaDe(b.data) - diaDe(a.data));
  return out;
}

/* ── saldos (06/10/2026) ──
   Mês pago que mudou depois vira saldo no próximo mês em aberto (a Ana
   calcula). Aqui ele aparece como linha no mês de DESTINO (soma no total, no %
   pago e nos KPIs) e como nota no mês de ORIGEM, cujo total continua o do
   relatório. O pago é o da Ana, só leitura: ela baixa o saldo junto com o mês
   de destino. Mês de destino que ainda não começou não aparece antes da hora —
   mas o saldo dele entra no "em aberto". */

/** Evento da página quando a Ana devolve o estado novo (baixa dada no quadro de
 *  pagamentos) — o relatório redesenha os saldos com a mesma resposta. */
export const EVENTO_PAGAMENTOS = "imhere:pagamentos-ana";

export function avisarPagamentos(estado: PagamentosAna) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENTO_PAGAMENTOS, { detail: estado }));
}

export type LinhaSaldo = { id: string; nome: string; desc: string; valor: number; pago: boolean };

const minusculo = (ym: string) => nomeDoMes(ym).toLowerCase();
const reais = (centavos: number) =>
  (Math.abs(centavos) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Linhas de saldo que caem neste mês (destino), do tipo pedido. */
export function saldosNoMes(saldos: SaldoAna[], tipo: "dev" | "custos", ym: string): LinhaSaldo[] {
  return saldos
    .filter((s) => s.tipo === tipo && s.destino === ym && s.centavos !== 0)
    .map((s) => ({
      id: `saldo-${s.ref}`,
      nome: `Saldo de ${nomeDoMes(s.origem)}`,
      desc: s.centavos < 0
        ? `crédito: ${minusculo(s.origem)} pago acima do valor real`
        : tipo === "dev"
          ? `entregas de ${minusculo(s.origem)} registradas depois do pagamento`
          : `${minusculo(s.origem)} pago abaixo do custo real`,
      valor: s.centavos / 100,
      pago: s.pago,
    }));
}

/** Notas do mês de origem: pra onde foi a diferença. */
export function notasDaOrigem(saldos: SaldoAna[], tipo: "dev" | "custos", ym: string): string[] {
  return saldos
    .filter((s) => s.tipo === tipo && s.origem === ym && s.centavos !== 0)
    .map((s) => s.centavos < 0
      ? `pago ${reais(s.centavos)} acima do real → crédito em ${nomeDoMes(s.destino)}`
      : tipo === "dev"
        ? `${reais(s.centavos)} entrou depois do pagamento → saldo em ${nomeDoMes(s.destino)}`
        : `pago ${reais(s.centavos)} abaixo do real → saldo em ${nomeDoMes(s.destino)}`);
}

/* ── o ✓ do relatório é da Ana (06/10/2026) ──
   Marcar item a item ou "marcar mês como pago" aqui dentro vivia só no
   navegador; só o quadro de pagamentos de cima falava com a Ana. Agora o
   estado do mês na Ana entra nas marcações ao abrir (e a cada baixa): mês pago
   lá marca todas as linhas daqui; mês reaberto lá desmarca — só depois da
   migração, pra não apagar marcação feita enquanto a ponte não existia. */
export function aplicarPagosDaAna<T extends { p?: number }>(
  marcas: Record<string, T>,
  ana: Pick<PagamentosAna, "custos" | "dev">,
  chaves: (tipo: "custos" | "dev", ym: string) => string[],
  migrado: boolean,
): Record<string, T> {
  const out = { ...marcas };
  for (const tipo of ["custos", "dev"] as const) {
    for (const [ym, e] of Object.entries(ana[tipo] ?? {})) {
      if (!e) continue;
      const ks = chaves(tipo, ym);
      if (!ks.length) continue;
      if (e.pago) for (const k of ks) out[k] = { ...out[k], p: 1 };
      else if (migrado && ks.every((k) => out[k]?.p)) for (const k of ks) out[k] = { ...out[k], p: 0 };
    }
  }
  return out;
}
