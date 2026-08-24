"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";
import { IconX, IconClock } from "@/components/icons";

interface ScheduleModalProps {
  onClose: () => void;
  onConfirm: (isoDateTime: string) => Promise<void>;
}

// datetime-local inputs want "YYYY-MM-DDTHH:mm" in local time, not UTC.
function toLocalInputValue(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export function ScheduleModal({ onClose, onConfirm }: ScheduleModalProps) {
  const [minValue] = useState(() => toLocalInputValue(new Date(Date.now() + 60000)));
  const [value, setValue] = useState(() => toLocalInputValue(new Date(Date.now() + 30 * 60000)));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const when = new Date(value);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      setError("Pick a date and time in the future.");
      return;
    }
    setSaving(true);
    try {
      await onConfirm(when.toISOString());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-elevated border border-border rounded-2xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-popover">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-ink text-sm flex items-center gap-2">
            <IconClock className="text-accent" />
            <span>Schedule Post</span>
          </h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-ink-faint leading-relaxed">
          Publishes automatically to every selected platform at this time. You can publish it early or cancel it
          from Post History any time before then.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Date &amp; Time</Label>
            <Input type="datetime-local" value={value} min={minValue} onChange={(e) => setValue(e.target.value)} required />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Scheduling…" : "Confirm Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
