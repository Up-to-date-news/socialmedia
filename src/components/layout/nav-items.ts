import { ActiveTab } from "@/lib/types";

export const NAV_ITEMS: { tab: ActiveTab; label: string }[] = [
  { tab: "dashboard", label: "Dashboard" },
  { tab: "create", label: "Publishing Studio" },
  { tab: "history", label: "Post History" },
  { tab: "auth", label: "API Vault" },
];

export const TAB_HEADINGS: Record<ActiveTab, string> = {
  dashboard: "Unified Analytics & Network Reach",
  create: "Multi-Channel Publishing Studio",
  history: "Centralized Post History & Logs",
  auth: "Authentication & API Vault",
};
