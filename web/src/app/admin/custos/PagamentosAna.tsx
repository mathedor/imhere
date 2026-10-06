"use client";

import { useState, useTransition } from "react";
import type { PagamentosAna as Estado } from "@/lib/custosAna";
import { avisarPagamentos } from "@/lib/custos/meses";

/* ══ O QUE JÁ FOI PAGO — E O QUE FALTA ══
   Este quadro não guarda nada aqui dentro: ele mostra as contas deste sistema
   como elas estão no controle da Diretório Web e escreve de volta lá quando
   você marca. Assim o "paguei" vale em qualquer computador, para todo mundo
   que abre esta página, e ninguém cobra o que já foi pago. */

type Marcar = (tipo: "custos" | "dev", mes: string, pago: boolean) => Promise<Estado | null>;

const real = (centavos: number) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const mesBonito = (m: string) => {
  const [a, mm] = m.split("-");
  return `${MESES[Number(mm) - 1] ?? mm}/${a}`;
};
const dia = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export default function PagamentosAna({ inicial, marcar, mesCorrente }: {
  inicial: Estado;
  marcar: Marcar;
  /** AAAA-MM (fuso de SP): mês só com saldo ganha botão quando já começou */
  mesCorrente: string;
}) {
  const [estado, setEstado] = useState<Estado>(inicial);
  const [mexendo, setMexendo] = useState<string | null>(null);
  const [, comecar] = useTransition();

  const saldos = estado.saldos ?? [];
  const meses = Array.from(new Set([
    ...Object.keys(estado.custos), ...Object.keys(estado.dev), ...saldos.map((x) => x.destino),
  ])).sort().reverse();
  if (meses.length === 0) return null;

  const clicar = (tipo: "custos" | "dev", mes: string, pago: boolean) => {
    setMexendo(`${tipo}:${mes}`);
    comecar(async () => {
      const novo = await marcar(tipo, mes, !pago);
      if (novo) {
        setEstado(novo);
        avisarPagamentos(novo);   // o relatório abaixo redesenha os saldos
      }
      setMexendo(null);
    });
  };

  /* saldo que cai neste mês: a Ana dá baixa nele junto com o mês */
  const notaSaldo = (tipo: "custos" | "dev", mes: string) => saldos
    .filter((x) => x.tipo === tipo && x.destino === mes && x.centavos !== 0)
    .map((x) => (
      <span key={x.ref} style={{ display: "block", fontSize: ".72rem", opacity: 0.75, marginTop: 3, color: x.centavos < 0 ? "#3ecf8e" : "inherit" }}>
        {x.centavos < 0 ? "crédito" : "+ saldo"} de {mesBonito(x.origem)}: {real(x.centavos)}{x.pago ? " · pago" : ""}
      </span>
    ));

  const celula = (tipo: "custos" | "dev", mes: string) => {
    const e = estado[tipo][mes];
    const ocupado = mexendo === `${tipo}:${mes}`;
    if (!e) {
      /* mês só com saldo (sem conta do mês na Ana): a baixa vale pros saldos */
      const so = saldos.filter((x) => x.tipo === tipo && x.destino === mes && x.centavos !== 0);
      if (!so.length || mes > mesCorrente) return <><span style={{ opacity: 0.4 }}>—</span>{notaSaldo(tipo, mes)}</>;
      const pagoSo = so.every((x) => x.pago);
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <b style={{ fontVariantNumeric: "tabular-nums" }}>{real(so.reduce((a, x) => a + x.centavos, 0))}</b>
          <button
            type="button"
            onClick={() => clicar(tipo, mes, pagoSo)}
            disabled={ocupado}
            title={pagoSo ? "marcado como pago — clique para desfazer" : "só o saldo cai neste mês — clique quando pagar"}
            style={{
              cursor: "pointer", borderRadius: 999, padding: "2px 10px", fontSize: ".72rem",
              border: "1px solid currentColor", background: "transparent",
              opacity: ocupado ? 0.5 : 1, color: pagoSo ? "#3ecf8e" : "inherit",
            }}
          >
            {ocupado ? "…" : pagoSo ? "✓ pago" : "em aberto · só saldo"}
          </button>
          {notaSaldo(tipo, mes)}
        </span>
      );
    }
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <b style={{ fontVariantNumeric: "tabular-nums" }}>{real(e.centavos)}</b>
        <button
          type="button"
          onClick={() => clicar(tipo, mes, e.pago)}
          disabled={ocupado}
          title={e.pago ? "marcado como pago — clique para desfazer" : `vence ${dia(e.vencimento)} — clique quando pagar`}
          style={{
            cursor: "pointer", borderRadius: 999, padding: "2px 10px", fontSize: ".72rem",
            border: "1px solid currentColor", background: "transparent",
            opacity: ocupado ? 0.5 : 1, color: e.pago ? "#3ecf8e" : "inherit",
          }}
        >
          {ocupado ? "…" : e.pago ? "✓ pago" : `em aberto · vence ${dia(e.vencimento)}`}
        </button>
        {notaSaldo(tipo, mes)}
      </span>
    );
  };

  return (
    <section style={{ border: "1px solid rgba(127,127,127,.28)", borderRadius: 14, padding: 16, margin: "0 0 22px" }}>
      <p style={{ margin: "0 0 2px", fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.6 }}>
        pagamentos
      </p>
      <p style={{ margin: "0 0 12px", fontSize: ".8rem", opacity: 0.7 }}>
        o que já foi pago e o que está em aberto, mês a mês. Marcar aqui avisa o controle da Diretório Web na hora —
        e o que for baixado lá aparece aqui.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".84rem" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.6, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".08em" }}>
              <th style={{ padding: "6px 10px 6px 0" }}>mês</th>
              <th style={{ padding: "6px 10px" }}>infraestrutura</th>
              <th style={{ padding: "6px 0 6px 10px" }}>desenvolvimento</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m) => (
              <tr key={m} style={{ borderTop: "1px solid rgba(127,127,127,.18)" }}>
                <td style={{ padding: "9px 10px 9px 0", whiteSpace: "nowrap" }}>{mesBonito(m)}</td>
                <td style={{ padding: "9px 10px" }}>{celula("custos", m)}</td>
                <td style={{ padding: "9px 0 9px 10px" }}>{celula("dev", m)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
