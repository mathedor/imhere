"use client";

import { notFound, useParams } from "next/navigation";
import { EstablishmentForm } from "@/components/admin/EstablishmentForm";
import { PanelLayout } from "@/components/panel/PanelLayout";
import { establishments } from "@/data/establishments";
import { NAV_ADMIN, QUICK_ADMIN } from "@/lib/panel-nav";

export default function EditarEstabelecimentoPage() {
  const params = useParams<{ id: string }>();
  const place = establishments.find((e) => e.id === params?.id);
  if (!place) notFound();

  return (
    <PanelLayout
      scope="admin"
      title={`Editar · ${place.name}`}
      subtitle={`${place.city}/${place.state}`}
      nav={NAV_ADMIN}
      quickNav={QUICK_ADMIN}
      user={{ name: "Mateus H.", role: "Admin geral" }}
    >
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
    </PanelLayout>
  );
}
