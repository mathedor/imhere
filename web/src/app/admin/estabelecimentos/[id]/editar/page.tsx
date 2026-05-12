"use client";

import { notFound, useParams } from "next/navigation";
import { EstablishmentForm } from "@/components/admin/EstablishmentForm";
import { establishments } from "@/data/establishments";

export default function EditarEstabelecimentoPage() {
  const params = useParams<{ id: string }>();
  const place = establishments.find((e) => e.id === params?.id);
  if (!place) notFound();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">{`Editar · ${place.name}`}</h1>
        <p className="mt-1 text-sm text-text-soft">{`${place.city}/${place.state}`}</p>
      </header>
      <EstablishmentForm
        mode="edit"
        initial={{
          id: place.id,
          name: place.name,
          cnpj: "",
          type: place.type,
          city: place.city,
          state: place.state,
          address: place.address,
          instagram: place.instagram,
          cover: place.cover,
        }}
      />
    </>
  );
}
