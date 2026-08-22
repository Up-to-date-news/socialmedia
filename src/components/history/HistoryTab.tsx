import { DateRange, Platform, Post } from "@/lib/types";
import { FilterBar } from "./FilterBar";
import { PostCard } from "./PostCard";
import { PostTable } from "./PostTable";

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
  onShowStats: (post: Post) => void;
  onDelete: (post: Post) => void;
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
  onDateRangeChange,
  onShowStats,
  onDelete,
  onResetFilters,
}: HistoryTabProps) {
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
        filteredCount={filteredPosts.length}
        totalCount={posts.length}
      />

      <div className="block sm:hidden space-y-3">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.post_id}
            post={post}
            platforms={platforms}
            onShowStats={() => onShowStats(post)}
            onDelete={() => onDelete(post)}
          />
        ))}
      </div>

      <PostTable
        posts={filteredPosts}
        platforms={platforms}
        onShowStats={onShowStats}
        onDelete={onDelete}
        onResetFilters={onResetFilters}
      />
    </div>
  );
}
