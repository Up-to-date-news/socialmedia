import { Platform, Post } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { IconX } from "@/components/icons";

interface StatsModalProps {
  post: Post;
  platforms: Platform[];
  onClose: () => void;
}

export function StatsModal({ post, platforms, onClose }: StatsModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-elevated border border-border rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-popover">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-ink text-sm truncate max-w-[200px] sm:max-w-xs">{post.title}</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-bg-inset rounded-xl border border-border">
            <span className="text-[10px] text-ink-faint block">Total Likes</span>
            <span className="font-bold text-success text-lg">{post.metrics.likes}</span>
          </div>
          <div className="p-3 bg-bg-inset rounded-xl border border-border">
            <span className="text-[10px] text-ink-faint block">Comments</span>
            <span className="font-bold text-accent text-lg">{post.metrics.comments}</span>
          </div>
          <div className="p-3 bg-bg-inset rounded-xl border border-border">
            <span className="text-[10px] text-ink-faint block">Shares</span>
            <span className="font-bold text-ink text-lg">{post.metrics.shares}</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-muted mb-2">Platform Endpoint Status</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
            {platforms.map((p) => {
              const status = post.platforms[p.id];
              if (!status) return null;
              return (
                <div key={p.id} className="flex justify-between items-center p-2 rounded bg-bg-inset border border-border">
                  <span className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span className="text-ink font-medium text-xs">{p.name}</span>
                  </span>
                  <span className={`font-mono text-[10px] ${status.status === "SUCCESS" ? "text-success" : "text-danger"}`}>
                    {status.status === "SUCCESS" ? `ID: ${status.platform_post_id}` : status.error ?? "Failed"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Button variant="secondary" onClick={onClose} className="w-full">
          Close Breakdown
        </Button>
      </div>
    </div>
  );
}
