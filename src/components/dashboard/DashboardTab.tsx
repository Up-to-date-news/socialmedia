import { Platform } from "@/lib/types";
import { StatCard } from "./StatCard";
import { PlatformCard } from "./PlatformCard";

interface AggregatedStats {
  totalPosts: number;
  totalEngagements: number;
  connectedCount: number;
  lastPublished: string;
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
          label="Total Posts"
          value={stats.totalPosts.toLocaleString()}
          tag="Live"
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
          label="Connected Platforms"
          value={`${stats.connectedCount} / ${platforms.length}`}
          tag={stats.connectedCount > 0 ? "Live" : "Setup needed"}
          tone={stats.connectedCount > 0 ? "success" : "warning"}
          hint="Configured in API Vault"
        />
        <StatCard
          label="Last Published"
          value={stats.lastPublished}
          tag="Recent"
          tone="warning"
          hint="Most recent post"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Platforms ({platforms.length} Supported APIs)
          </h3>
          <span className="text-[11px] text-ink-faint hidden sm:inline">
            {stats.connectedCount} configured
          </span>
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
