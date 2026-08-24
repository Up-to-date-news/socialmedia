"use client";

import { useState } from "react";
import { DateRange, Platform, Post } from "@/lib/types";
import { FilterBar } from "./FilterBar";
import { PostCard } from "./PostCard";
import { PostTable } from "./PostTable";
import { Button } from "@/components/ui/Button";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

const PAGE_SIZE = 10;

interface HistoryTabProps {
  posts: Post[];
  filteredPosts: Post[];
  platforms: Platform[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (v: DateRange) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
  onShowStats: (post: Post) => void;
  onDelete: (post: Post) => void;
  onPublishNow: (post: Post) => void;
  onResetFilters: () => void;
}

export function HistoryTab({
  posts,
  filteredPosts,
  platforms,
  searchQuery,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onDateRangeChange,
  onShowStats,
  onDelete,
  onPublishNow,
  onResetFilters,
}: HistoryTabProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the active filters change, following React's
  // "adjust state during render" pattern instead of a setState-in-effect.
  const filterSignature = `${searchQuery}|${platformFilter}|${statusFilter}|${dateRange}|${customFrom}|${customTo}`;
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature);
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagePosts = filteredPosts.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="space-y-6">
      <FilterBar
        platforms={platforms}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        platformFilter={platformFilter}
        onPlatformFilterChange={onPlatformFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={onCustomFromChange}
        onCustomToChange={onCustomToChange}
        filteredCount={filteredPosts.length}
        totalCount={posts.length}
      />

      <div className="block sm:hidden space-y-3">
        {pagePosts.map((post) => (
          <PostCard
            key={post.post_id}
            post={post}
            platforms={platforms}
            onShowStats={() => onShowStats(post)}
            onDelete={() => onDelete(post)}
            onPublishNow={() => onPublishNow(post)}
          />
        ))}
      </div>

      <PostTable
        posts={pagePosts}
        platforms={platforms}
        onShowStats={onShowStats}
        onDelete={onDelete}
        onPublishNow={onPublishNow}
        onResetFilters={onResetFilters}
      />

      {filteredPosts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <span>
            Showing <span className="text-ink font-semibold">{pageStart + 1}</span>–
            <span className="text-ink font-semibold">{Math.min(pageStart + PAGE_SIZE, filteredPosts.length)}</span> of{" "}
            {filteredPosts.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
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
  );
}
