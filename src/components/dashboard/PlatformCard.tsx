import { Platform } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/platform-icons";

interface PlatformCardProps {
  platform: Platform;
  onPostHere: () => void;
}

export function PlatformCard({ platform, onPostHere }: PlatformCardProps) {
  return (
    <Card className="p-4 sm:p-5 hover:border-border-strong transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-bg-inset border border-border text-ink">
              <PlatformIcon id={platform.id} className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <div>
              <h4 className="font-bold text-ink text-xs sm:text-sm leading-snug">{platform.name}</h4>
              <Badge tone={platform.connected ? "success" : "neutral"} className="mt-0.5">
                {platform.connected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </div>

          <button
            onClick={onPostHere}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-inset hover:bg-border text-ink-muted hover:text-ink transition-colors font-medium"
          >
            Post Here
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2 py-2 border-y border-border/70 text-xs">
          <div>
            <span className="text-[10px] text-ink-faint block">Posts Published</span>
            <span className="font-bold text-ink">{platform.postsCount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-ink-faint block">Engagements</span>
            <span className="font-bold text-ink">{platform.engagements.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 text-[10px] font-mono">
        <span className="px-2 py-0.5 rounded bg-bg-inset text-ink-muted">
          Upload: {platform.directUpload ? "Native" : "URL"}
        </span>
        <span
          className={`px-2 py-0.5 rounded ${
            platform.directDelete ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
          }`}
        >
          Delete API: {platform.directDelete ? "Supported" : "Restricted"}
        </span>
      </div>
    </Card>
  );
}
