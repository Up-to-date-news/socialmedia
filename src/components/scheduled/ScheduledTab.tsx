"use client";

import { useState } from "react";
import { Platform, PlatformId, Post } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/platform-icons";
import { IconClock, IconCalendar, IconChevronLeft, IconChevronRight } from "@/components/icons";
import { ScheduledCalendar } from "./ScheduledCalendar";
import {
  ScheduledFilterBar,
  ScheduledDateRange,
  ScheduledSortBy,
  SortOrder,
} from "./ScheduledFilterBar";

interface ScheduledTabProps {
  posts: Post[];
  platforms: Platform[];
  onPublishNow: (post: Post) => void;
  onCancel: (post: Post) => void;
  onCreateNew: () => void;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type ScheduledPost = Post & { scheduled_at: string };

export function ScheduledTab({ posts, platforms, onPublishNow, onCancel, onCreateNew }: ScheduledTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState<ScheduledDateRange>("ALL");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [sortBy, setSortBy] = useState<ScheduledSortBy>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  const allScheduled = posts.filter(
    (p): p is ScheduledPost => p.status === "SCHEDULED" && Boolean(p.scheduled_at)
  );

  let filtered = allScheduled;

  if (platformFilter !== "ALL") {
    filtered = filtered.filter((p) => Boolean(p.platforms[platformFilter as PlatformId]));
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  }
  if (dateRange !== "ALL" && !customFrom && !customTo) {
    const now = new Date();
    filtered = filtered.filter((p) => {
      const d = new Date(p.scheduled_at);
      if (dateRange === "TODAY") return isSameDay(d, now);
      if (dateRange === "WEEK") return d.getTime() - now.getTime() <= 7 * 24 * 3600000;
      if (dateRange === "MONTH") return d.getTime() - now.getTime() <= 30 * 24 * 3600000;
      return true;
    });
  }
  if (customFrom) {
    const from = new Date(customFrom);
    from.setHours(0, 0, 0, 0);
    filtered = filtered.filter((p) => new Date(p.scheduled_at) >= from);
  }
  if (customTo) {
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    filtered = filtered.filter((p) => new Date(p.scheduled_at) <= to);
  }

  filtered = [...filtered].sort((a, b) => {
    const cmp =
      sortBy === "time"
        ? new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        : a.title.localeCompare(b.title);
    return sortOrder === "asc" ? cmp : -cmp;
  });

  // Reset to page 1 whenever filters/sort/page-size change (adjust state
  // during render instead of a setState-in-effect).
  const filterSignature = `${searchQuery}|${platformFilter}|${dateRange}|${customFrom}|${customTo}|${sortBy}|${sortOrder}|${perPage}`;
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * perPage;
  const visiblePosts = filtered.slice(pageStart, pageStart + perPage);

  const calendarSelectedDate = customFrom && customFrom === customTo ? customFrom : null;

  const handleSelectCalendarDate = (day: string | null) => {
    if (day === null) {
      setCustomFrom("");
      setCustomTo("");
    } else {
      setCustomFrom(day);
      setCustomTo(day);
      setDateRange("ALL");
    }
  };

  return (
    <div className="space-y-6">
      <ScheduledFilterBar
        platforms={platforms}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
        dateRange={dateRange}
        onDateRangeChange={(v) => {
          setDateRange(v);
          setCustomFrom("");
          setCustomTo("");
        }}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={(v) => {
          setCustomFrom(v);
          setDateRange("ALL");
        }}
        onCustomToChange={(v) => {
          setCustomTo(v);
          setDateRange("ALL");
        }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        perPage={perPage}
        onPerPageChange={setPerPage}
        filteredCount={filtered.length}
        totalCount={allScheduled.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-5">
          <ScheduledCalendar
            scheduledPosts={allScheduled}
            selectedDate={calendarSelectedDate}
            onSelectDate={handleSelectCalendarDate}
          />
        </div>

        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {calendarSelectedDate
                ? `Scheduled for ${new Date(calendarSelectedDate).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                  })}`
                : "Upcoming Scheduled Posts"}
            </h3>
            <span className="text-[11px] text-ink-faint font-mono">{filtered.length} queued</span>
          </div>

          {visiblePosts.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-xl bg-bg-inset flex items-center justify-center text-ink-faint">
                <IconCalendar />
              </div>
              <p className="text-sm text-ink-muted">
                {allScheduled.length === 0
                  ? "Nothing scheduled yet. Posts you schedule from Publishing Studio show up here — and disappear automatically once they go live."
                  : "No posts match the active filters."}
              </p>
              {allScheduled.length === 0 && (
                <Button size="sm" onClick={onCreateNew}>
                  Schedule a Post
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {visiblePosts.map((post) => (
                <Card key={post.post_id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-ink text-sm truncate">{post.title}</h4>
                      <p className="text-ink-muted text-xs truncate mt-0.5">{post.content}</p>
                    </div>
                    <Badge tone="accent" className="shrink-0">
                      <IconClock className="w-3 h-3" />
                      {new Date(post.scheduled_at).toLocaleString()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/70">
                    <div className="flex flex-wrap gap-1.5">
                      {platforms
                        .filter((p) => post.platforms[p.id])
                        .map((p) => (
                          <span
                            key={p.id}
                            title={p.name}
                            className="p-1 rounded border bg-bg-inset border-border text-ink-faint flex items-center justify-center"
                          >
                            <PlatformIcon id={p.id} className="w-3 h-3" />
                          </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => onPublishNow(post)}>
                        Publish Now
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => onCancel(post)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted pt-1">
              <span>
                Showing <span className="text-ink font-semibold">{pageStart + 1}</span>–
                <span className="text-ink font-semibold">{Math.min(pageStart + perPage, filtered.length)}</span> of{" "}
                {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                  <IconChevronLeft />
                  Prev
                </Button>
                <span className="font-mono text-ink-faint px-1">
                  Page {safePage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                >
                  Next
                  <IconChevronRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
