"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Copy, CreditCard, Loader2, Lock, QrCode, UserCog, X } from "lucide-react";
import { useState } from "react";
import { AddressFieldset } from "@/components/AddressFieldset";
import { Field, Input } from "@/components/Field";
import { MaskedInput } from "@/components/MaskedInput";
import type { Plan } from "@/lib/db/types";
import { cn } from "@/lib/utils";

interface UserData {
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  cpf?: string | null;
  cep?: string | null;
  city?: string | null;
  state?: string | null;
}

interface Props {
  plan: Plan;
  billing: "monthly" | "annual";
  open: boolean;
  onClose: () => void;
  target?: "user" | "establishment";
  establishmentId?: string;
  userData?: UserData;
}

type Method = "pix" | "credit_card";
type Step = "profile-check" | "payment" | "pix-result" | "success";

interface PixResult {
  txid: string;
  qrCodeImage: string;
  qrCodePayload: string;
}

function isProfileComplete(u?: UserData): boolean {
  if (!u) return false;
  return Boolean(u.name && u.email && u.whatsapp && u.cpf);
}

export function CheckoutModal({ plan, billing, open, onClose, target = "user", establishmentId, userData }: Props) {
  const profileComplete = isProfileComplete(userData);
  const [step, setStep] = useState<Step>(profileComplete ? "payment" : "profile-check");
  const [method, setMethod] = useState<Method>("pix");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<PixResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const amountCents =
    billing === "monthly" ? plan.monthly_price_cents : plan.annual_price_cents;
  const amountLabel = `R$ ${(amountCents / 100).toFixed(2).replace(".", ",")}`;

  async function submitProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      // Salva via fetch a API (sem redirect)
      await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          whatsapp: fd.get("whatsapp"),
          cpf: fd.get("cpf"),
          address_cep: fd.get("address_cep"),
          address_street: fd.get("address_street"),
          address_number: fd.get("address_number"),
          address_complement: fd.get("address_complement"),
          address_district: fd.get("address_district"),
          address_city: fd.get("address_city"),
          address_state: fd.get("address_state"),
        }),
      });
      setProfileSaved(true);
      setTimeout(() => setStep("payment"), 700);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function submitPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: billing,
          amountCents,
          method,
          target,
          establishmentId,
          paymentToken: fd.get("paymentToken")?.toString(),
          customer: {
            name: String(fd.get("name") ?? userData?.name ?? ""),
            document: String(fd.get("document") ?? userData?.cpf ?? ""),
            email: String(fd.get("email") ?? userData?.email ?? ""),
            phone: String(fd.get("phone") ?? userData?.whatsapp ?? ""),
          },
        }),
      });
      const data = await res.json();
      if (method === "pix") {
        setPix(data.charge);
        setStep("pix-result");
      } else {
        setStep("success");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function copyPix() {
    if (!pix) return;
    navigator.clipboard.writeText(pix.qrCodePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface max-h-[92dvh] overflow-y-auto scrollbar-hide"
          >
            <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-surface p-4">
              <div className="grid size-10 place-items-center rounded-xl bg-brand text-white shadow-glow">
                <Lock className="size-4" />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-sm font-extrabold text-text">
                  {step === "profile-check" ? "Complete seu cadastro" : `Assinar ${plan.name}`}
                </p>
                <p className="text-[0.65rem] text-text-soft">
                  {amountLabel} · {billing === "monthly" ? "mensal" : "anual"}
                </p>
              </div>
              <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:bg-white/[0.04] hover:text-text">
                <X className="size-4" />
              </button>
            </header>

            {/* STEP 1: COMPLETAR CADASTRO */}
            {step === "profile-check" && (
              <form onSubmit={submitProfile} className="flex flex-col gap-4 p-5">
                <div className="flex items-start gap-3 rounded-2xl border border-warn/30 bg-warn/10 p-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
                  <p className="text-xs leading-snug text-warn">
                    Pra assinar um plano você precisa completar seu cadastro com CPF, WhatsApp e endereço. Cobramos isso para emitir nota fiscal e seguir as regras de pagamento.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Nome completo" className="md:col-span-2">
                    <Input name="name" defaultValue={userData?.name ?? ""} required placeholder="Como na sua identidade" />
                  </Field>
                  <Field label="E-mail" hint="Não editável aqui">
                    <Input type="email" defaultValue={userData?.email ?? ""} disabled />
                  </Field>
                  <Field label="WhatsApp">
                    <MaskedInput
                      mask="phone"
                      name="whatsapp"
                      defaultValue={userData?.whatsapp ?? ""}
                      required
                      placeholder="(11) 99999-9999"
                    />
                  </Field>
                  <Field label="CPF" hint="Obrigatório pra nota fiscal" className="md:col-span-2">
                    <MaskedInput
                      mask="cpf"
                      name="cpf"
                      defaultValue={userData?.cpf ?? ""}
                      required
                      placeholder="000.000.000-00"
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-border bg-surface-2/40 p-4">
                  <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
                    Endereço de cobrança
                  </p>
                  <AddressFieldset
                    namePrefix="address"
                    compact
                    defaultValues={{
                      cep: userData?.cep ?? "",
                      city: userData?.city ?? "",
                      state: userData?.state ?? "",
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -1 }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all",
                    "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow disabled:opacity-70"
                  )}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : profileSaved ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Cadastro salvo, indo pro pagamento...
                    </>
                  ) : (
                    <>
                      <UserCog className="size-4" />
                      Salvar e continuar
                    </>
                  )}
                </motion.button>

                <p className="text-center text-[0.65rem] text-muted">
                  Seus dados são criptografados · LGPD respeitada
                </p>
              </form>
            )}

            {/* STEP 2: PAGAMENTO */}
            {step === "payment" && (
              <form onSubmit={submitPayment} className="flex flex-col gap-4 p-5">
                <div className="rounded-2xl border border-success/30 bg-success/10 p-3 text-xs text-success">
                  ✓ Cadastro completo · dados puxados automaticamente
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <MethodButton
                    active={method === "pix"}
                    onClick={() => setMethod("pix")}
                    icon={QrCode}
                    title="PIX"
                    desc="Aprovação na hora"
                  />
                  <MethodButton
                    active={method === "credit_card"}
                    onClick={() => setMethod("credit_card")}
                    icon={CreditCard}
                    title="Cartão"
                    desc="Recorrente automático"
                  />
                </div>

                {/* Dados readonly (do cadastro) */}
                <div className="rounded-2xl border border-border bg-surface-2/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                      Dados do pagador
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep("profile-check")}
                      className="text-[0.65rem] font-bold text-brand hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <DataRow label="Nome" value={userData?.name ?? ""} />
                    <DataRow label="CPF" value={userData?.cpf ?? ""} />
                    <DataRow label="E-mail" value={userData?.email ?? ""} />
                    <DataRow label="WhatsApp" value={userData?.whatsapp ?? ""} />
                  </div>
                  {/* Hidden inputs com os valores que vao pro POST */}
                  <input type="hidden" name="name" value={userData?.name ?? ""} />
                  <input type="hidden" name="document" value={userData?.cpf ?? ""} />
                  <input type="hidden" name="email" value={userData?.email ?? ""} />
                  <input type="hidden" name="phone" value={userData?.whatsapp ?? ""} />
                </div>

                {method === "credit_card" && (
                  <div className="rounded-2xl border border-border bg-surface-2 p-4">
                    <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-widest text-muted">
                      Cartão (tokenizado pela Efí)
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <Input name="cardNumber" placeholder="Número do cartão" />
                      <div className="grid grid-cols-3 gap-2">
                        <Input name="cardExpMonth" placeholder="MM" />
                        <Input name="cardExpYear" placeholder="AAAA" />
                        <Input name="cardCvv" placeholder="CVV" />
                      </div>
                      <Input name="cardHolder" placeholder="Nome impresso" />
                    </div>
                    <input type="hidden" name="paymentToken" value="mock-token" />
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl bg-surface-2 p-3 text-xs">
                  <span className="text-text-soft">Total agora</span>
                  <span className="text-lg font-black text-text">{amountLabel}</span>
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -1 }}
                  disabled={loading}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all",
                    "bg-gradient-to-r from-brand-strong via-brand to-brand-soft text-white shadow-glow disabled:opacity-70"
                  )}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : method === "pix" ? (
                    <>
                      <QrCode className="size-4" />
                      Gerar PIX
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      Assinar e pagar
                    </>
                  )}
                </motion.button>

                <p className="text-center text-[0.65rem] text-muted">
                  Pagamento processado pela Efí Bank · Cancele quando quiser
                </p>
              </form>
            )}

            {/* STEP 3: PIX RESULT */}
            {step === "pix-result" && pix && (
              <div className="flex flex-col gap-4 p-5">
                <p className="text-center text-xs text-text-soft">
                  Pague com PIX em qualquer banco. Aprovação automática.
                </p>
                <div className="mx-auto flex aspect-square w-56 items-center justify-center rounded-2xl bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pix.qrCodeImage} alt="QR Code PIX" className="size-full" />
                </div>
                <button
                  onClick={copyPix}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-bold text-text hover:border-brand/40"
                >
                  <Copy className="size-4" />
                  {copied ? "Copiado!" : "Copiar código PIX"}
                </button>
                <p className="text-center text-[0.65rem] text-muted">
                  Expira em 1h · TXID {pix.txid.slice(0, 12)}...
                </p>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-xl font-black text-text">Pagamento aprovado!</h3>
                <p className="text-xs text-text-soft">Seu plano {plan.name} já está ativo.</p>
                <button
                  onClick={onClose}
                  className="mt-4 rounded-pill bg-brand px-6 py-2.5 text-sm font-bold text-white"
                >
                  Aproveitar agora
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MethodButton({ active, onClick, icon: Icon, title, desc }: {
  active: boolean;
  onClick: () => void;
  icon: typeof QrCode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-all",
        active ? "border-brand bg-brand/10" : "border-border bg-surface-2 hover:border-brand/40"
      )}
    >
      <div className={cn("grid size-9 place-items-center rounded-lg", active ? "bg-brand text-white" : "bg-surface-3 text-brand")}>
        <Icon className="size-4" />
      </div>
      <div className="leading-tight">
        <p className="text-xs font-bold text-text">{title}</p>
        <p className="text-[0.6rem] text-text-soft">{desc}</p>
      </div>
    </button>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[0.6rem] uppercase tracking-wider text-muted">{label}</span>
      <span className="truncate font-semibold text-text">{value || "—"}</span>
    </div>
  );
}
