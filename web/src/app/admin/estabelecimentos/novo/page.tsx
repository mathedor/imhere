"use client";

import { EstablishmentForm } from "@/components/admin/EstablishmentForm";

export default function NovoEstabelecimentoAdminPage() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Novo estabelecimento</h1>
        <p className="mt-1 text-sm text-text-soft">Cria e atribui um responsável</p>
      </header>
      <EstablishmentForm mode="create" />
    </>
  );
}
