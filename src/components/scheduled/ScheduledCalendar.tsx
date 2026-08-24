"use client";

import { useState } from "react";
import { Post } from "@/lib/types";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

interface ScheduledCalendarProps {
  scheduledPosts: Post[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ScheduledCalendar({ scheduledPosts, selectedDate, onSelectDate }: ScheduledCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const countsByDate = new Map<string, number>();
  for (const post of scheduledPosts) {
    if (!post.scheduled_at) continue;
    const key = dateKey(new Date(post.scheduled_at));
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
  }

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const todayKey = dateKey(new Date());

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1;
    const cellDate = new Date(year, month, dayNum);
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const key = dateKey(cellDate);
    return { key, dayNum: cellDate.getDate(), inMonth, count: countsByDate.get(key) ?? 0 };
  });

  return (
    <div className="p-4 rounded-2xl bg-bg-elevated border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-ink">
          {monthCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonthCursor(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-bg-inset transition-colors"
            aria-label="Previous month"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => setMonthCursor(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-bg-inset transition-colors"
            aria-label="Next month"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-ink-faint font-mono mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isSelected = selectedDate === cell.key;
          const isToday = cell.key === todayKey;
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => onSelectDate(isSelected ? null : cell.key)}
              className={`relative aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${
                !cell.inMonth
                  ? "text-ink-faint/30 cursor-default"
                  : isSelected
                    ? "bg-accent text-accent-ink font-bold"
                    : isToday
                      ? "border border-accent text-accent font-semibold"
                      : "text-ink hover:bg-bg-inset"
              }`}
            >
              {cell.dayNum}
              {cell.count > 0 && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <button type="button" onClick={() => onSelectDate(null)} className="mt-3 text-xs text-accent hover:underline">
          Clear date filter
        </button>
      )}
    </div>
  );
}
