"use client";

import { forwardRef, useState } from "react";
import { Input } from "./Field";
import { MASKS, type MaskKind } from "@/lib/masks";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: MaskKind;
  defaultValue?: string;
  onValueChange?: (raw: string, masked: string) => void;
}

export const MaskedInput = forwardRef<HTMLInputElement, Props>(function MaskedInput(
  { mask, defaultValue = "", onValueChange, ...rest },
  ref
) {
  const fn = MASKS[mask];
  const [value, setValue] = useState(() => fn(defaultValue));

  return (
    <Input
      ref={ref}
      {...rest}
      value={value}
      onChange={(e) => {
        const masked = fn(e.target.value);
        setValue(masked);
        onValueChange?.(masked.replace(/\D/g, ""), masked);
      }}
      inputMode={mask === "birth" ? "numeric" : mask === "cep" ? "numeric" : "numeric"}
    />
  );
});
