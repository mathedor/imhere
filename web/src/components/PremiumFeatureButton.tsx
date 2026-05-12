"use client";

import { motion } from "framer-motion";
import { Crown, type LucideIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { CreditConfirmDialog } from "./CreditConfirmDialog";
import { spendCreditsAction } from "@/lib/actions/credits";
import { cn } from "@/lib/utils";

interface Props {
  featureCode: string;
  label: string;
  cost: number;
  /** Saldo atual do user */
  balance: number;
  /** Se for premium/vip, não precisa gastar */
  isFree?: boolean;
  /** O que fazer após o sucesso */
  onUnlocked: () => void;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export function PremiumFeatureButton({
  featureCode,
  label,
  cost,
  balance,
  isFree = false,
  onUnlocked,
  icon: Icon = Sparkles,
  className,
  children,
}: Props) {
  const [pending, setPending] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(balance);

  async function handleConfirm() {
    const result = await spendCreditsAction(featureCode);
    if (result.success) {
      setCurrentBalance(result.newBalance);
      onUnlocked();
    } else {
      alert(result.message);
    }
  }

  function handleClick() {
    if (isFree) {
      onUnlocked();
      return;
    }
    setPending(true);
  }

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        whileHover={{ y: -2 }}
        onClick={handleClick}
        className={cn(
          "relative inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-bold transition-all",
          isFree
            ? "bg-success/15 text-success border border-success/30 hover:bg-success/25"
            : "bg-gradient-to-r from-warn to-brand text-white shadow-glow",
          className
        )}
      >
        {isFree ? <Crown className="size-4" /> : <Icon className="size-4" />}
        {children ?? label}
        {!isFree && (
          <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[0.65rem] font-black">
            {cost} 🪙
          </span>
        )}
      </motion.button>

      <CreditConfirmDialog
        open={pending}
        onClose={() => setPending(false)}
        cost={cost}
        balance={currentBalance}
        featureLabel={label}
        onConfirm={handleConfirm}
      />
    </>
  );
}
