"use client";

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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-brand/60",
        className
      )}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-brand/60",
        className
      )}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-brand/60",
        className
      )}
    >
      {children}
    </select>
  );
}
