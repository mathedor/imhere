import type { Metadata } from "next";
import { CustosClient } from "@/components/admin/CustosClient";
import { contasDaAna, comValorDaAna, pagamentosDaAna } from "@/lib/custosAna";
import { MESES } from "@/lib/custos/data";

import PagamentosAna from "./PagamentosAna";
import { marcarPagamentoNaAna } from "./acoes-ana";
export const metadata: Metadata = {
  title: "Custos & Desenvolvimento · Admin",
};

export default async function CustosPage() {
  const pagamentosNaAna = await pagamentosDaAna("imhere");
  // o preço de verdade da infraestrutura deste mês, lido pela Ana na fatura
  const daAna = await contasDaAna("imhere");
  const contasReais = daAna
    ? comValorDaAna(
        (MESES[0]?.itens ?? []).map((c) => ({ ...c, obs: c.desc })),
        daAna,
      ).map((c) => ({ nome: c.nome, valor: c.valor, obs: c.obs ?? c.desc, estimado: Boolean(c.estimado) }))
    : null;

  return (

    <>

      <PagamentosAna inicial={pagamentosNaAna} marcar={marcarPagamentoNaAna} />

      <CustosClient contasReais={contasReais} />

    </>

  );
}
