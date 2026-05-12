"use client";

import { Check, Loader2, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { Field, Input } from "./Field";
import { MaskedInput } from "./MaskedInput";
import { fetchAddressByCEP, onlyDigits } from "@/lib/masks";
import { cn } from "@/lib/utils";

interface Props {
  /** Prefixo dos `name` (ex: "address" gera "address_cep", "address_street") */
  namePrefix?: string;
  /** Valores iniciais (controlled). */
  defaultValues?: Partial<{
    cep: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
  }>;
  /** Esconde campos opcionais (complemento). */
  compact?: boolean;
}

export function AddressFieldset({ namePrefix = "address", defaultValues, compact }: Props) {
  const [cep, setCep] = useState(defaultValues?.cep ?? "");
  const [street, setStreet] = useState(defaultValues?.street ?? "");
  const [district, setDistrict] = useState(defaultValues?.district ?? "");
  const [city, setCity] = useState(defaultValues?.city ?? "");
  const [state, setState] = useState(defaultValues?.state ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "notfound">("idle");
  const numberRef = useRef<HTMLInputElement>(null);

  async function handleCEPLookup(raw: string) {
    const clean = onlyDigits(raw);
    if (clean.length !== 8) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const addr = await fetchAddressByCEP(clean);
    if (!addr) {
      setStatus("notfound");
      return;
    }
    setStreet(addr.street);
    setDistrict(addr.district);
    setCity(addr.city);
    setState(addr.state);
    setStatus("ok");
    // foca no número (UX: cep → preenche → cursor pula pra "número")
    setTimeout(() => numberRef.current?.focus(), 80);
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="CEP" hint={
        status === "loading" ? "Buscando endereço..." :
        status === "notfound" ? "CEP não encontrado" :
        status === "ok" ? "Endereço preenchido automaticamente" :
        "Digite e preenchemos o resto"
      }>
        <div className="relative">
          <MaskedInput
            mask="cep"
            name={`${namePrefix}_cep`}
            defaultValue={cep}
            placeholder="00000-000"
            required
            autoComplete="postal-code"
            onValueChange={(raw, masked) => {
              setCep(masked);
              if (raw.length === 8) handleCEPLookup(raw);
            }}
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {status === "loading" && <Loader2 className="size-4 animate-spin text-brand" />}
            {status === "ok" && <Check className="size-4 text-success" />}
            {status === "idle" && <MapPin className="size-4 text-muted" />}
            {status === "notfound" && <MapPin className="size-4 text-warn" />}
          </div>
        </div>
      </Field>

      <div
        className={cn(
          "grid gap-3 transition-opacity",
          status === "idle" && !cep ? "opacity-50" : "opacity-100"
        )}
      >
        <div className="grid grid-cols-[1fr_8rem] gap-3">
          <Field label="Rua / Logradouro">
            <Input
              name={`${namePrefix}_street`}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Avenida Paulista"
              required
              autoComplete="address-line1"
            />
          </Field>
          <Field label="Número">
            <Input
              ref={numberRef}
              name={`${namePrefix}_number`}
              placeholder="123"
              required
              autoComplete="address-line2"
            />
          </Field>
        </div>

        {!compact && (
          <Field label="Complemento" hint="Opcional">
            <Input name={`${namePrefix}_complement`} placeholder="Apto, sala, andar..." />
          </Field>
        )}

        <Field label="Bairro">
          <Input
            name={`${namePrefix}_district`}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Centro"
            required
          />
        </Field>

        <div className="grid grid-cols-[1fr_5rem] gap-3">
          <Field label="Cidade">
            <Input
              name={`${namePrefix}_city`}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="São Paulo"
              required
              autoComplete="address-level2"
            />
          </Field>
          <Field label="UF">
            <Input
              name={`${namePrefix}_state`}
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              maxLength={2}
              required
              className="uppercase"
              autoComplete="address-level1"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
