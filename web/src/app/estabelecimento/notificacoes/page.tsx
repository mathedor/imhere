"use client";

import { NotificationsList } from "@/components/NotificationsList";

export default function EstabelecimentoNotificacoesPage() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">Notificações</h1>
        <p className="mt-1 text-sm text-text-soft">Check-ins, cortesias resgatadas e mensagens</p>
      </header>
      <NotificationsList />
    </>
  );
}
