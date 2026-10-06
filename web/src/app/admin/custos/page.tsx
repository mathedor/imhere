import type { Metadata } from "next";
import { CustosClient } from "@/components/admin/CustosClient";
import { contasDaAna, comValorDaAna, entregasDaAna, pagamentosDaAna } from "@/lib/custosAna";
import { mesCorrenteSP, mesesAteHoje } from "@/lib/custos/meses";

import PagamentosAna from "./PagamentosAna";
import { marcarPagamentoNaAna } from "./acoes-ana";
export const metadata: Metadata = {
  title: "Custos & Desenvolvimento · Admin",
};

/* sempre na hora: o mês corrente (e o que nasce nele) não pode ficar congelado
   no dia do deploy, e os pagamentos/entregas vêm vivos da Ana */
export const dynamic = "force-dynamic";

export default async function CustosPage() {
  /* o mês corrente sai daqui (fuso de São Paulo) e vai pra tela: se o arquivo
     de dados parou num mês antigo, os que faltam nascem com as contas */
  const mesCorrente = mesCorrenteSP();
  const [pagamentosNaAna, daAna, entregasAna] = await Promise.all([
    pagamentosDaAna("imhere"),
    // o preço de verdade da infraestrutura deste mês, lido pela Ana na fatura
    contasDaAna("imhere"),
    // o que a Ana entregou aqui (tarefas e pedidos) — o token fica no servidor
    entregasDaAna("imhere"),
  ]);
  const contasReais = daAna
    ? comValorDaAna(
        (mesesAteHoje(mesCorrente)[0]?.itens ?? []).map((c) => ({ ...c, obs: c.desc })),
        daAna,
      ).map((c) => ({ nome: c.nome, valor: c.valor, obs: c.obs ?? c.desc, estimado: Boolean(c.estimado) }))
    : null;

  return (

    <>

      <PagamentosAna inicial={pagamentosNaAna} marcar={marcarPagamentoNaAna} mesCorrente={mesCorrente} />

      <CustosClient
        contasReais={contasReais}
        mesCorrente={mesCorrente}
        entregasAna={entregasAna}
        pagosAna={pagamentosNaAna}
        marcar={marcarPagamentoNaAna}
      />

    </>

  );
}
