"use client";

import { ActiveTab } from "@/lib/types";
import { TAB_HEADINGS } from "./nav-items";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/icons";

interface HeaderProps {
  activeTab: ActiveTab;
  onNewPost: () => void;
  connectedCount: number;
  totalCount: number;
}

export function Header({ activeTab, onNewPost, connectedCount, totalCount }: HeaderProps) {
  return (
    <header className="hidden sm:flex h-16 border-b border-border px-6 lg:px-8 items-center justify-between sticky top-0 bg-bg/80 backdrop-blur-md z-20">
      <h2 className="text-base lg:text-lg font-bold tracking-tight text-ink">
        {TAB_HEADINGS[activeTab]}
      </h2>

      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            connectedCount > 0 ? "bg-success-soft text-success" : "bg-bg-inset text-ink-faint"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? "bg-success" : "bg-ink-faint"}`} />
          <span>
            {connectedCount} / {totalCount} Platforms Connected
          </span>
        </div>

        <Button size="sm" onClick={onNewPost}>
          <IconPlus />
          <span>New Post</span>
        </Button>
      </div>
    </header>
  );
}
