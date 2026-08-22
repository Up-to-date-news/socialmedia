import Image from "next/image";
import { Platform, Post } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface PostTableProps {
  posts: Post[];
  platforms: Platform[];
  onShowStats: (post: Post) => void;
  onDelete: (post: Post) => void;
  onResetFilters: () => void;
}

export function PostTable({ posts, platforms, onShowStats, onDelete, onResetFilters }: PostTableProps) {
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

                <td className="py-3.5 px-4 text-ink-faint font-mono text-[11px] whitespace-nowrap">
                  {new Date(post.created_at).toLocaleDateString()}
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
                          className={`px-1.5 py-0.5 rounded text-[10px] border ${
                            pState.status === "SUCCESS"
                              ? "bg-success-soft border-success/30 text-success"
                              : "bg-danger-soft border-danger/30 text-danger"
                          }`}
                        >
                          {p.icon}
                        </span>
                      );
                    })}
                  </div>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-ink-muted font-mono text-[11px]">
                    <span>♥ {post.metrics.likes}</span>
                    <span>💬 {post.metrics.comments}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => onShowStats(post)}>
                      Stats
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(post)}>
                      Delete
                    </Button>
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
