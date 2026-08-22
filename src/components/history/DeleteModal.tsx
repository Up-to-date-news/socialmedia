import { Platform, Post } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface DeleteModalProps {
  post: Post;
  platforms: Platform[];
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ post, platforms, onCancel, onConfirm }: DeleteModalProps) {
  const nativeDelete = platforms.filter((p) => p.directDelete && post.platforms[p.id]?.status === "SUCCESS");
  const restricted = platforms.filter((p) => !p.directDelete && post.platforms[p.id]?.status === "SUCCESS");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-elevated border border-border rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-popover">
        <div className="flex items-center gap-3 text-danger">
          <h3 className="text-sm sm:text-base font-bold text-ink">
            Delete &ldquo;{post.title}&rdquo; across {Object.keys(post.platforms).length} channels?
          </h3>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          This action will trigger sequential <code className="text-danger">DELETE</code> requests to connected APIs.
        </p>

        <div className="p-3 rounded-xl bg-bg-inset border border-border text-[11px] space-y-1.5 text-ink-muted">
          <div className="font-semibold text-ink">Platform Execution Plan:</div>
          {nativeDelete.length > 0 && (
            <div className="text-success">✓ Native Delete: {nativeDelete.map((p) => p.name).join(", ")}</div>
          )}
          {restricted.length > 0 && (
            <div className="text-warning">⚠ Restricted APIs: {restricted.map((p) => p.name).join(", ")}</div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1 bg-danger text-white hover:bg-danger/90">
            Execute Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
