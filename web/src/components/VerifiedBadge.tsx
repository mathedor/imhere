import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function VerifiedBadge({ size = "md", className, showLabel = false }: Props) {
  const dims = {
    sm: { box: "size-3.5", icon: "size-2.5" },
    md: { box: "size-4", icon: "size-3" },
    lg: { box: "size-5", icon: "size-3.5" },
  }[size];

  if (showLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-pill bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white",
          className
        )}
        title="Identidade verificada"
      >
        <Check className={dims.icon} />
        Verificado
      </span>
    );
  }

  return (
    <span
      title="Identidade verificada"
      className={cn(
        "inline-grid place-items-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white shadow-sm",
        dims.box,
        className
      )}
    >
      <Check className={dims.icon} strokeWidth={3} />
    </span>
  );
}
