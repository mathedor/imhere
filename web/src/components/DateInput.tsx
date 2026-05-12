"use client";

import { forwardRef } from "react";
import { Input } from "./Field";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Idade mínima em anos (calcula max=today-N).  */
  minAge?: number;
  /** Idade máxima em anos (calcula min=today-N).  */
  maxAge?: number;
}

/**
 * Input nativo type="date" — abre calendário em iOS, Android e desktop.
 * Mostra placeholder estilizado e suporta limite de idade.
 */
export const DateInput = forwardRef<HTMLInputElement, Props>(function DateInput(
  { minAge = 18, maxAge = 100, ...rest },
  ref
) {
  const today = new Date();
  const max = new Date(today);
  max.setFullYear(today.getFullYear() - minAge);
  const min = new Date(today);
  min.setFullYear(today.getFullYear() - maxAge);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <Input
      ref={ref}
      type="date"
      min={fmt(min)}
      max={fmt(max)}
      {...rest}
    />
  );
});
