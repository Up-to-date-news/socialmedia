import { Platform, PlatformId } from "@/lib/types";

interface PlatformSelectorProps {
  platforms: Platform[];
  selected: PlatformId[];
  onToggle: (id: PlatformId) => void;
  onToggleAll: () => void;
}

export function PlatformSelector({ platforms, selected, onToggle, onToggleAll }: PlatformSelectorProps) {
  const allSelected = selected.length === platforms.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
          Target Platforms ({selected.length}/{platforms.length})
        </label>
        <button type="button" onClick={onToggleAll} className="text-xs text-accent hover:underline font-medium">
          {allSelected ? "Deselect All" : `Select All ${platforms.length}`}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {platforms.map((p) => {
          const isSelected = selected.includes(p.id);
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => onToggle(p.id)}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors ${
                isSelected
                  ? "bg-bg-inset border-accent/50 text-ink"
                  : "bg-transparent border-border text-ink-faint hover:border-border-strong"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] shrink-0 ${
                  isSelected ? "bg-accent border-accent text-accent-ink font-bold" : "border-border-strong"
                }`}
              >
                {isSelected ? "✓" : ""}
              </div>
              <span className="text-sm">{p.icon}</span>
              <span className="text-xs font-medium truncate">{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
