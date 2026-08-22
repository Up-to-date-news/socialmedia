import Image from "next/image";
import { Platform, Post } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PostCardProps {
  post: Post;
  platforms: Platform[];
  onShowStats: () => void;
  onDelete: () => void;
}

export function PostCard({ post, platforms, onShowStats, onDelete }: PostCardProps) {
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
          <span className="text-[10px] text-ink-faint font-mono">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/70">
        <div className="flex flex-wrap gap-1">
          {platforms.map((p) => (post.platforms[p.id] ? <span key={p.id} className="text-xs">{p.icon}</span> : null))}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onShowStats}>
            Stats
          </Button>
          <Button size="sm" variant="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
