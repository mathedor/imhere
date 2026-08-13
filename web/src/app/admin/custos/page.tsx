import type { Metadata } from "next";
import { CustosClient } from "@/components/admin/CustosClient";
import { contasDaAna, comValorDaAna } from "@/lib/custosAna";
import { MESES } from "@/lib/custos/data";

export const metadata: Metadata = {
  title: "Custos & Desenvolvimento · Admin",
};

export default async function CustosPage() {
  // o preço de verdade da infraestrutura deste mês, lido pela Ana na fatura
  const daAna = await contasDaAna("imhere");
  const contasReais = daAna
    ? comValorDaAna(
        (MESES[0]?.itens ?? []).map((c) => ({ ...c, obs: c.desc })),
        daAna,
      ).map((c) => ({ nome: c.nome, valor: c.valor, obs: c.obs ?? c.desc, estimado: Boolean(c.estimado) }))
    : null;

  return <CustosClient contasReais={contasReais} />;
}
