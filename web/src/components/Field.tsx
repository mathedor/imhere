"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted">{label}</span>
      {children}
      {hint && <span className="text-[0.65rem] text-text-soft">{hint}</span>}
    </label>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      {...props}
      className={cn(
        "h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-brand/60",
        className
      )}
    />
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        "min-h-24 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-brand/60",
        className
      )}
    />
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      {...props}
      className={cn(
        "h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-brand/60",
        className
      )}
    >
      {children}
    </select>
  );
});
