"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

type ToastType = "info" | "success" | "warning" | "error";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClasses: Record<ToastType, string> = {
  error: "bg-danger-soft border-danger/30 text-danger",
  warning: "bg-warning-soft border-warning/30 text-warning",
  success: "bg-success-soft border-success/30 text-success",
  info: "bg-accent-soft border-accent/30 text-accent",
};

const icons: Record<ToastType, string> = {
  error: "✕",
  warning: "!",
  success: "✓",
  info: "i",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2 items-stretch sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-popover flex items-center gap-3 border text-xs sm:text-sm font-medium backdrop-blur-md ${toneClasses[t.type]}`}
          >
            <span className="w-4 h-4 shrink-0 rounded-full bg-current/15 flex items-center justify-center text-[10px]">
              {icons[t.type]}
            </span>
            <span className="truncate">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
