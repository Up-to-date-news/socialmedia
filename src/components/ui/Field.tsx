import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { IconChevronDown } from "@/components/icons";

const fieldBase =
  "w-full rounded-xl bg-bg-inset border border-border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-shadow";

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-ink-muted mb-1.5 uppercase tracking-wide">
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${fieldBase} ${className}`} {...rest} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea className={`${fieldBase} resize-none ${className}`} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <div className="relative inline-block">
      <select className={`${fieldBase} appearance-none pr-9 cursor-pointer ${className}`} {...rest} />
      <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
    </div>
  );
}
