import { DateRange, Platform } from "@/lib/types";
import { Input, Select } from "@/components/ui/Field";
import { IconSearch } from "@/components/icons";

interface FilterBarProps {
  platforms: Platform[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (v: DateRange) => void;
  filteredCount: number;
  totalCount: number;
}

const DATE_RANGES: DateRange[] = ["ALL", "TODAY", "WEEK", "MONTH"];

export function FilterBar({
  platforms,
  searchQuery,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-bg-elevated border border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-4 py-2 w-full sm:w-48"
          />
          <span className="absolute left-2.5 top-2.5 text-ink-faint">
            <IconSearch />
          </span>
        </div>

        <Select value={platformFilter} onChange={(e) => onPlatformFilterChange(e.target.value)} className="py-2 w-auto">
          <option value="ALL">All Platforms</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <Select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="py-2 w-auto">
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Published Successfully</option>
          <option value="PARTIAL">Partially Published</option>
          <option value="FAILED">Failed</option>
        </Select>

        <div className="flex bg-bg-inset border border-border p-1 rounded-xl gap-1 justify-between">
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                dateRange === range ? "bg-bg-elevated text-ink shadow-soft" : "text-ink-faint hover:text-ink"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-ink-muted font-mono text-right sm:text-left">
        Showing <span className="text-ink font-bold">{filteredCount}</span> / {totalCount} Posts
      </div>
    </div>
  );
}
