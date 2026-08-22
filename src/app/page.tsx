"use client";

import { ToastProvider } from "@/lib/toast-context";
import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
