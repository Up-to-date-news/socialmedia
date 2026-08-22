"use client";

import { ActiveTab, ThemeMode } from "@/lib/types";
import { NAV_ITEMS } from "./nav-items";
import { IconGrid, IconEdit, IconClock, IconShield, IconMenu, IconX, IconSun, IconMoon, IconSparkle } from "@/components/icons";

const ICONS: Record<string, (props: { className?: string }) => JSX.Element> = {
  dashboard: IconGrid,
  create: IconEdit,
  history: IconClock,
  auth: IconShield,
};

interface MobileNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  postCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInjectSample: () => void;
}

export function MobileNav({
  activeTab,
  onTabChange,
  postCount,
  theme,
  onToggleTheme,
  open,
  onOpenChange,
  onInjectSample,
}: MobileNavProps) {
  return (
    <>
      <div className="sm:hidden flex items-center justify-between p-4 bg-bg-elevated border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-ink text-sm">
            Ω
          </div>
          <span className="font-bold text-sm tracking-tight text-ink">OmniSocial</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-bg-inset text-ink-muted"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
          <button
            onClick={() => onOpenChange(!open)}
            className="p-2 rounded-lg bg-bg-inset text-ink-muted hover:text-ink"
            aria-label="Toggle menu"
          >
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm pt-4 px-4 pb-6 flex flex-col justify-between">
          <nav className="space-y-2 bg-bg-elevated rounded-2xl border border-border p-3 shadow-popover mt-16">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.tab];
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    onTabChange(item.tab);
                    onOpenChange(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium justify-between transition-colors ${
                    isActive ? "bg-accent text-accent-ink" : "text-ink-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon />
                    <span>{item.label}</span>
                  </div>
                  {item.tab === "history" && postCount > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? "bg-accent-ink/20" : "bg-bg-inset border border-border"
                      }`}
                    >
                      {postCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => {
              onInjectSample();
              onOpenChange(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-bg-elevated text-xs text-ink-muted font-medium flex items-center justify-center gap-2"
          >
            <IconSparkle />
            <span>Inject Sample Post</span>
          </button>
        </div>
      )}
    </>
  );
}
