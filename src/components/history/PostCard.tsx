import Image from "next/image";
import { Platform, Post } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlatformIcon } from "@/components/platform-icons";
import { IconClock } from "@/components/icons";

interface PostCardProps {
  post: Post;
  platforms: Platform[];
  onShowStats: () => void;
  onDelete: () => void;
  onPublishNow: () => void;
}

export function PostCard({ post, platforms, onShowStats, onDelete, onPublishNow }: PostCardProps) {
  const isScheduled = post.status === "SCHEDULED";

  return (
    <Card className="p-4 space-y-3">
      <div className="flex gap-3">
        {post.image && (
          <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0">
            <Image src={post.image} alt="Thumb" fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="truncate flex-1">
          <h4 className="font-bold text-ink text-xs truncate">{post.title}</h4>
          <p className="text-ink-muted text-[11px] truncate mt-0.5">{post.content}</p>
          {isScheduled && post.scheduled_at ? (
            <span className="text-[10px] text-accent font-mono flex items-center gap-1">
              <IconClock className="w-3 h-3" />
              {new Date(post.scheduled_at).toLocaleString()}
            </span>
          ) : (
            <span className="text-[10px] text-ink-faint font-mono">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/70">
        <div className="flex flex-wrap gap-1">
          {platforms.map((p) =>
            post.platforms[p.id] ? <PlatformIcon key={p.id} id={p.id} className="w-3.5 h-3.5 text-ink-muted" /> : null
          )}
        </div>

        <div className="flex items-center gap-2">
          {isScheduled ? (
            <>
              <Button size="sm" variant="secondary" onClick={onPublishNow}>
                Publish Now
              </Button>
              <Button size="sm" variant="danger" onClick={onDelete}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={onShowStats}>
                Stats
              </Button>
              <Button size="sm" variant="danger" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
