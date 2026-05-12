"use client";

import { UserForm } from "@/components/admin/UserForm";

export default function NovoUsuarioPage() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Novo usuário</h1>
        <p className="mt-1 text-sm text-text-soft">Cadastro manual pelo admin (sem confirmação de email)</p>
      </header>
      <UserForm mode="create" />
    </>
  );
}
