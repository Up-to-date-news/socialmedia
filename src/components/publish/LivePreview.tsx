import { Platform, PlatformId } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

interface LivePreviewProps {
  platforms: Platform[];
  previewPlatform: PlatformId;
  onPreviewPlatformChange: (id: PlatformId) => void;
  title: string;
  content: string;
  image: string;
}

export function LivePreview({
  platforms,
  previewPlatform,
  onPreviewPlatformChange,
  title,
  content,
  image,
}: LivePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Live Channel Preview</h3>
        <span className="text-[11px] text-ink-faint font-mono">Mock Mode</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => onPreviewPlatformChange(p.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors ${
              previewPlatform === p.id
                ? "bg-bg-inset text-ink border border-border-strong"
                : "text-ink-faint hover:bg-bg-inset/60"
            }`}
          >
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-5 min-h-[350px] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center text-accent-ink font-bold text-xs">
              OS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-ink text-sm">OmniSocial Hub</span>
                <span className="text-xs text-success">✓</span>
              </div>
              <span className="text-[11px] text-ink-faint block">Just now · Live Preview</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-ink text-sm sm:text-base leading-snug">
              {title || "Your Post Title Will Appear Here"}
            </h4>
            <p className="text-sm text-ink-muted whitespace-pre-wrap leading-relaxed">
              {content ||
                "Your post description and media updates will render here dynamically across selected social platforms."}
            </p>

            {image && (
              <div className="rounded-xl overflow-hidden border border-border relative w-full h-56">
                <Image src={image} alt="Preview" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border/80 mt-6 flex items-center justify-between text-ink-faint text-xs">
          <span>Like</span>
          <span>Comment</span>
          <span>Share</span>
          <span>Save</span>
        </div>
      </Card>
    </div>
  );
}
