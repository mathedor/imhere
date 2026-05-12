"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Coins, Copy, CreditCard, Loader2, QrCode, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Field, Input } from "@/components/Field";
import { MaskedInput } from "@/components/MaskedInput";
import type { CreditPack } from "@/lib/actions/credits";
import { cn } from "@/lib/utils";

interface UserData {
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  cpf?: string | null;
}

interface Props {
  pack: CreditPack | null;
  open: boolean;
  onClose: () => void;
  userData?: UserData;
}

type Method = "pix" | "credit_card";
type Step = "payment" | "pix-result" | "success";

interface PixResult {
  txid: string;
  qrCodeImage: string;
  qrCodePayload: string;
}

function fmtMoney(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function CreditPackCheckoutModal({ pack, open, onClose, userData }: Props) {
  const [step, setStep] = useState<Step>("payment");
  const [method, setMethod] = useState<Method>("pix");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<PixResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("payment");
      setMethod("pix");
      setPix(null);
    }
  }, [open, pack?.id]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!pack) return null;
  const totalCredits = pack.credits + (pack.bonus ?? 0);

  async function submitPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pack) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: pack.id,
          billingCycle: "monthly",
          amountCents: pack.price_cents,
          method,
          target: "credit_pack",
          packId: pack.id,
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
      alert("Falha no checkout. Tenta de novo.");
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl border border-border bg-surface p-5 shadow-soft"
          >
            <header className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-warn via-brand to-brand-strong text-white shadow-glow">
                  <Coins className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-text">{pack.name}</h3>
                  <p className="text-[0.7rem] text-text-soft">
                    {totalCredits} créditos · {fmtMoney(pack.price_cents)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
              >
                <X className="size-4" />
              </button>
            </header>

            {step === "payment" && (
              <form onSubmit={submitPayment} className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border bg-surface-2 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-soft">Créditos base</span>
                    <span className="font-bold text-text">{pack.credits}</span>
                  </div>
                  {pack.bonus > 0 && (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-text-soft">Bônus</span>
                      <span className="font-bold text-success">+{pack.bonus}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                    <span className="font-bold text-text">Total</span>
                    <span className="text-lg font-black text-brand">{totalCredits} 🪙</span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                    Método de pagamento
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod("pix")}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border px-3 py-3 text-left transition-all",
                        method === "pix"
                          ? "border-brand bg-brand/10 shadow-glow"
                          : "border-border bg-surface hover:border-brand/40"
                      )}
                    >
                      <QrCode className="size-5 text-brand" />
                      <div className="leading-tight">
                        <p className="text-sm font-bold text-text">PIX</p>
                        <p className="text-[0.65rem] text-text-soft">Aprovação na hora</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("credit_card")}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border px-3 py-3 text-left transition-all",
                        method === "credit_card"
                          ? "border-brand bg-brand/10 shadow-glow"
                          : "border-border bg-surface hover:border-brand/40"
                      )}
                    >
                      <CreditCard className="size-5 text-brand" />
                      <div className="leading-tight">
                        <p className="text-sm font-bold text-text">Cartão</p>
                        <p className="text-[0.65rem] text-text-soft">Visa, Master, Elo</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Nome completo">
                    <Input name="name" defaultValue={userData?.name ?? ""} required placeholder="Como aparece no cartão" />
                  </Field>
                  <Field label="CPF">
                    <MaskedInput mask="cpf" name="document" defaultValue={userData?.cpf ?? ""} required placeholder="000.000.000-00" />
                  </Field>
                  <Field label="E-mail">
                    <Input type="email" name="email" defaultValue={userData?.email ?? ""} required placeholder="seu@email.com" />
                  </Field>
                  <Field label="WhatsApp">
                    <MaskedInput mask="phone" name="phone" defaultValue={userData?.whatsapp ?? ""} required placeholder="(11) 99999-9999" />
                  </Field>
                </div>

                {method === "credit_card" && (
                  <div className="rounded-xl border border-warn/30 bg-warn/5 p-3 text-[0.65rem] text-text-soft">
                    Token de cartão (paymentToken) — em produção será gerado pelo SDK da Efí. Por agora,
                    qualquer valor é aceito no mock.
                    <Input name="paymentToken" defaultValue="mock-token-123" className="mt-2" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-warn via-brand to-brand-strong px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-glow disabled:opacity-70"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  Pagar {fmtMoney(pack.price_cents)}
                </button>

                <p className="text-center text-[0.6rem] text-muted">
                  Pagamento via Efí Bank · seus dados não passam pelo I&apos;m Here
                </p>
              </form>
            )}

            {step === "pix-result" && pix && (
              <div className="flex flex-col items-center gap-4">
                <div className="grid size-14 place-items-center rounded-2xl bg-brand/15 text-brand">
                  <QrCode className="size-7" />
                </div>
                <h4 className="text-center text-base font-black text-text">
                  Pague o PIX pra liberar {totalCredits} créditos
                </h4>
                {pix.qrCodeImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pix.qrCodeImage}
                    alt="QR Code PIX"
                    className="size-56 rounded-2xl bg-white p-3"
                  />
                )}
                <button
                  onClick={copyPix}
                  className="flex items-center gap-2 rounded-pill border border-border bg-surface-2 px-4 py-2 text-xs font-bold text-text hover:border-brand/40"
                >
                  {copied ? <CheckCircle2 className="size-4 text-success" /> : <Copy className="size-4" />}
                  {copied ? "Código copiado!" : "Copiar PIX copia e cola"}
                </button>
                <p className="text-center text-[0.65rem] text-text-soft">
                  Assim que o PIX for confirmado, seus créditos entram automaticamente.
                </p>
                <button
                  onClick={() => setStep("success")}
                  className="text-xs font-bold text-brand hover:underline"
                >
                  Já paguei →
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 360, damping: 16 }}
                  className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-success to-brand text-white shadow-glow"
                >
                  <CheckCircle2 className="size-10" />
                </motion.div>
                <div>
                  <h4 className="text-xl font-black text-text">Pagamento recebido!</h4>
                  <p className="mt-1 text-sm text-text-soft">
                    <strong className="text-brand">+{totalCredits} créditos</strong> foram liberados na sua conta.
                  </p>
                </div>
                <Link
                  href="/app/creditos"
                  onClick={onClose}
                  className="w-full rounded-2xl bg-gradient-to-r from-brand-strong via-brand to-brand-soft px-5 py-3.5 text-center text-sm font-extrabold uppercase tracking-wider text-white shadow-glow"
                >
                  Ver meu saldo
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
