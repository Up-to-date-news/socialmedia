"use client";

import { ActiveTab, ThemeMode } from "@/lib/types";
import { NAV_ITEMS } from "./nav-items";
import { IconGrid, IconEdit, IconClock, IconShield, IconSun, IconMoon, IconSparkle } from "@/components/icons";

const ICONS: Record<string, (props: { className?: string }) => JSX.Element> = {
  dashboard: IconGrid,
  create: IconEdit,
  history: IconClock,
  auth: IconShield,
};

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  postCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  userName: string;
  userRole: string;
  onInjectSample: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  postCount,
  theme,
  onToggleTheme,
  userName,
  userRole,
  onInjectSample,
}: SidebarProps) {
  return (
    <aside className="hidden sm:flex w-64 bg-bg-elevated border-r border-border flex-col justify-between p-4 shrink-0">
      <div>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-accent-ink text-lg">
              Ω
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-none text-ink">OmniSocial</h1>
              <span className="text-[10px] text-ink-faint font-mono tracking-widest uppercase">8-Hub</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-mono">v1.0</span>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.tab];
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-bg-inset text-ink" : "text-ink-muted hover:text-ink hover:bg-bg-inset/60"
                }`}
              >
                <Icon className={isActive ? "text-accent" : ""} />
                <span>{item.label}</span>
                {item.tab === "history" && postCount > 0 && (
                  <span className="ml-auto bg-bg-inset text-ink-muted text-xs px-2 py-0.5 rounded-full border border-border">
                    {postCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <button
          onClick={onInjectSample}
          className="w-full py-2 px-3 rounded-xl border border-border hover:border-border-strong bg-bg-inset/60 hover:bg-bg-inset text-xs text-ink-muted font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <IconSparkle />
          <span>Inject Test Post Data</span>
        </button>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center font-bold text-xs text-accent-ink">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-ink leading-tight">{userName}</span>
              <span className="text-[10px] text-ink-faint">{userRole}</span>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-bg-inset text-ink-muted hover:text-ink hover:bg-border transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </div>
    </aside>
  );
}
