import { Platform } from "@/lib/types";
import { Input } from "@/components/ui/Field";
import { Listbox } from "@/components/ui/Listbox";
import { IconSearch, IconChevronDown } from "@/components/icons";

export type ScheduledDateRange = "ALL" | "TODAY" | "WEEK" | "MONTH";
export type ScheduledSortBy = "time" | "title";
export type SortOrder = "asc" | "desc";

const DATE_RANGES: ScheduledDateRange[] = ["ALL", "TODAY", "WEEK", "MONTH"];
const PER_PAGE_OPTIONS = [10, 20, 50];

interface ScheduledFilterBarProps {
  platforms: Platform[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (v: string) => void;
  dateRange: ScheduledDateRange;
  onDateRangeChange: (v: ScheduledDateRange) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
  sortBy: ScheduledSortBy;
  onSortByChange: (v: ScheduledSortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (v: SortOrder) => void;
  perPage: number;
  onPerPageChange: (v: number) => void;
  filteredCount: number;
  totalCount: number;
}

export function ScheduledFilterBar({
  platforms,
  searchQuery,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
  dateRange,
  onDateRangeChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  perPage,
  onPerPageChange,
  filteredCount,
  totalCount,
}: ScheduledFilterBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-bg-elevated border border-border space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search scheduled posts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-4 py-2 w-full sm:w-48"
            />
            <span className="absolute left-2.5 top-2.5 text-ink-faint">
              <IconSearch />
            </span>
          </div>

          <Listbox
            value={platformFilter}
            onChange={onPlatformFilterChange}
            ariaLabel="Filter by platform"
            className="w-auto min-w-[9.5rem]"
            options={[
              { value: "ALL", label: "All Platforms" },
              ...platforms.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />

          <div className="grid grid-cols-4 bg-bg-inset border border-border p-1 rounded-xl gap-1">
            {DATE_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => onDateRangeChange(range)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold text-center transition-colors ${
                  dateRange === range && !customFrom && !customTo
                    ? "bg-bg-elevated text-ink shadow-soft"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              aria-label="From date"
              className="py-2 w-auto text-xs"
            />
            <span className="text-ink-faint text-xs">–</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              aria-label="To date"
              className="py-2 w-auto text-xs"
            />
          </div>
        </div>

        <div className="text-xs text-ink-muted font-mono text-right sm:text-left shrink-0">
          Showing <span className="text-ink font-bold">{filteredCount}</span> / {totalCount}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/70">
        <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-wide">Sort by</span>
        <Listbox
          value={sortBy}
          onChange={(v) => onSortByChange(v as ScheduledSortBy)}
          ariaLabel="Sort by"
          className="w-auto min-w-[9rem]"
          options={[
            { value: "time", label: "Scheduled Time" },
            { value: "title", label: "Title" },
          ]}
        />

        <button
          type="button"
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
          className="px-3 py-1.5 rounded-xl border border-border bg-bg-inset text-xs font-medium text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors"
        >
          <IconChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>

        <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-wide ml-2">Per page</span>
        <Listbox
          value={String(perPage)}
          onChange={(v) => onPerPageChange(Number(v))}
          ariaLabel="Posts per page"
          className="w-auto min-w-[5.5rem]"
          options={PER_PAGE_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
        />
      </div>
    </div>
  );
}
