"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "@/components/icons";

export interface ListboxOption {
  value: string;
  label: string;
}

interface ListboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ListboxOption[];
  className?: string;
  ariaLabel?: string;
}

// Replaces native <select> for menus that need to match the app's rounded
// design language — the browser's native option popup is OS-rendered and its
// corners can't be styled with CSS.
export function Listbox({ value, onChange, options, className = "", ariaLabel }: ListboxProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-xl bg-bg-inset border border-border px-3.5 py-2.5 text-sm text-ink hover:border-border-strong focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-shadow"
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <IconChevronDown
          className={`w-3.5 h-3.5 text-ink-faint shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1.5 w-full max-h-60 overflow-auto rounded-xl border border-border bg-bg-elevated shadow-popover p-1"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  opt.value === value ? "bg-accent-soft text-accent font-medium" : "text-ink hover:bg-bg-inset"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
