import { DateRange, Platform } from "@/lib/types";
import { Input } from "@/components/ui/Field";
import { Listbox } from "@/components/ui/Listbox";
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
  customFrom: string;
  customTo: string;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
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
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
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

        <Listbox
          value={statusFilter}
          onChange={onStatusFilterChange}
          ariaLabel="Filter by status"
          className="w-auto min-w-[10.5rem]"
          options={[
            { value: "ALL", label: "All Statuses" },
            { value: "SUCCESS", label: "Published Successfully" },
            { value: "PARTIAL", label: "Partially Published" },
            { value: "FAILED", label: "Failed" },
            { value: "SCHEDULED", label: "Scheduled" },
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

      <div className="text-xs text-ink-muted font-mono text-right sm:text-left">
        Showing <span className="text-ink font-bold">{filteredCount}</span> / {totalCount} Posts
      </div>
    </div>
  );
}
