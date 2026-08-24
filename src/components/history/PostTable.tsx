import Image from "next/image";
import { Platform, Post } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/platform-icons";
import { IconClock } from "@/components/icons";

interface PostTableProps {
  posts: Post[];
  platforms: Platform[];
  onShowStats: (post: Post) => void;
  onDelete: (post: Post) => void;
  onPublishNow: (post: Post) => void;
  onResetFilters: () => void;
}

export function PostTable({ posts, platforms, onShowStats, onDelete, onPublishNow, onResetFilters }: PostTableProps) {
  if (posts.length === 0) {
    return (
      <div className="hidden sm:block rounded-2xl bg-bg-elevated border border-border overflow-hidden shadow-card">
        <div className="p-12 text-center text-ink-faint space-y-3">
          <p className="text-sm">No posts found matching the active filter criteria.</p>
          <button onClick={onResetFilters} className="text-xs text-accent hover:underline">
            Reset All Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden sm:block rounded-2xl bg-bg-elevated border border-border overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-ink-muted">
          <thead className="bg-bg-inset/60 text-ink-faint border-b border-border uppercase text-[10px] font-mono tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Post &amp; Content</th>
              <th className="py-3.5 px-4">Published Date</th>
              <th className="py-3.5 px-4">Target Platforms</th>
              <th className="py-3.5 px-4">Engagements</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {posts.map((post) => (
              <tr key={post.post_id} className="hover:bg-bg-inset/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3 max-w-xs md:max-w-md">
                    {post.image ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                        <Image src={post.image} alt="Thumb" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-bg-inset flex items-center justify-center shrink-0 text-ink-faint text-xs">
                        —
                      </div>
                    )}
                    <div className="truncate">
                      <h4 className="font-bold text-ink text-sm truncate">{post.title}</h4>
                      <p className="text-ink-faint text-[11px] truncate mt-0.5">{post.content}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                  {post.status === "SCHEDULED" && post.scheduled_at ? (
                    <span className="flex items-center gap-1.5 text-accent">
                      <IconClock className="w-3.5 h-3.5" />
                      {new Date(post.scheduled_at).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-ink-faint">{new Date(post.created_at).toLocaleDateString()}</span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {platforms.map((p) => {
                      const pState = post.platforms[p.id];
                      if (!pState) return null;
                      return (
                        <span
                          key={p.id}
                          title={`${p.name}: ${pState.status}`}
                          className={`p-1 rounded border flex items-center justify-center ${
                            pState.status === "SUCCESS"
                              ? "bg-success-soft border-success/30 text-success"
                              : pState.status === "PENDING"
                                ? "bg-bg-inset border-border text-ink-faint"
                                : "bg-danger-soft border-danger/30 text-danger"
                          }`}
                        >
                          <PlatformIcon id={p.id} className="w-3 h-3" />
                        </span>
                      );
                    })}
                  </div>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {post.status === "SCHEDULED" ? (
                    <Badge tone="accent">Awaiting Publish</Badge>
                  ) : (
                    <div className="flex items-center gap-2 text-ink-muted font-mono text-[11px]">
                      <span>♥ {post.metrics.likes}</span>
                      <span>💬 {post.metrics.comments}</span>
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {post.status === "SCHEDULED" ? (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => onPublishNow(post)}>
                          Publish Now
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(post)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => onShowStats(post)}>
                          Stats
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(post)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
