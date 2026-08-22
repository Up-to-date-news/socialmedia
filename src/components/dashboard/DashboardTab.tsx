import { Platform } from "@/lib/types";
import { StatCard } from "./StatCard";
import { PlatformCard } from "./PlatformCard";

interface AggregatedStats {
  totalReach: number;
  totalPostsCount: number;
  totalEngagements: number;
  peakTime: string;
}

interface DashboardTabProps {
  platforms: Platform[];
  stats: AggregatedStats;
  onPostHere: (platformId: string) => void;
}

export function DashboardTab({ platforms, stats, onPostHere }: DashboardTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Network Reach"
          value={stats.totalReach.toLocaleString()}
          tag="+12.4%"
          tone="success"
          hint={`Across ${platforms.length} channels`}
        />
        <StatCard
          label="Total Posts"
          value={stats.totalPostsCount.toLocaleString()}
          tag="Live Sync"
          tone="accent"
          hint="Published via Hub"
        />
        <StatCard
          label="Total Engagements"
          value={stats.totalEngagements.toLocaleString()}
          tag="Reactions"
          tone="neutral"
          hint="Interactions sum"
        />
        <StatCard
          label="Peak Time"
          value={stats.peakTime}
          tag="AI Computed"
          tone="warning"
          hint="Optimal post window"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Connected Platforms ({platforms.length} Active APIs)
          </h3>
          <span className="text-[11px] text-ink-faint hidden sm:inline">Real-time sync enabled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onPostHere={() => onPostHere(platform.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
