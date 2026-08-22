"use client";

import { FormEvent, useState } from "react";
import { Platform } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";
import { IconX } from "@/components/icons";

interface ConfigureCredentialsModalProps {
  platform: Platform;
  onClose: () => void;
  onSave: (values: Record<string, string>) => Promise<void>;
}

export function ConfigureCredentialsModal({ platform, onClose, onSave }: ConfigureCredentialsModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(values);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-elevated border border-border rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-popover">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-ink text-sm flex items-center gap-2">
            <span>{platform.icon}</span>
            <span>Configure {platform.name}</span>
          </h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-ink-faint leading-relaxed">
          Values are encrypted (AES-256-GCM) before storage and are never sent back to the browser.
          Placeholder/dummy values are fine for now — real API calls only fire once real credentials
          are entered here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {platform.credentialFields.map((field) => (
            <div key={field.key}>
              <Label>{field.label}</Label>
              <Input
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                required
              />
            </div>
          ))}

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
