"use client";

import { ChangeEvent, useState } from "react";
import { Platform, PlatformId } from "@/lib/types";
import { Label, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PlatformSelector } from "./PlatformSelector";
import { ScheduleModal } from "./ScheduleModal";
import { IconUpload, IconX } from "@/components/icons";
import Image from "next/image";

interface PostFormProps {
  platforms: Platform[];
  title: string;
  onTitleChange: (v: string) => void;
  content: string;
  onContentChange: (v: string) => void;
  image: string;
  onImageChange: (v: string) => void;
  onFileSelected: (file: File | null) => void;
  selectedPlatforms: PlatformId[];
  onTogglePlatform: (id: PlatformId) => void;
  onToggleAllPlatforms: () => void;
  isPublishing: boolean;
  onPublish: () => void;
  onSchedule: (isoDateTime: string) => Promise<void>;
}

export function PostForm({
  platforms,
  title,
  onTitleChange,
  content,
  onContentChange,
  image,
  onImageChange,
  onFileSelected,
  selectedPlatforms,
  onTogglePlatform,
  onToggleAllPlatforms,
  isPublishing,
  onPublish,
  onSchedule,
}: PostFormProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelected(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-bg-elevated border border-border space-y-5">
      <h3 className="text-sm sm:text-base font-bold text-ink flex items-center justify-between">
        <span>Content Creator</span>
        <span className="text-xs text-ink-faint font-normal">Targeting {selectedPlatforms.length} Channels</span>
      </h3>

      <div>
        <Label>Post Title / Headline</Label>
        <Input
          type="text"
          placeholder="e.g. Major Feature Release Announcement..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div>
        <Label>Post Body / Description</Label>
        <Textarea
          rows={4}
          placeholder="Type your main message, hashtags, and URLs here..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
        />
        <div className="flex justify-between items-center text-[11px] text-ink-faint mt-1">
          <span>Markdown supported</span>
          <span>{content.length} characters</span>
        </div>
      </div>

      <div>
        <Label>Media Attachment (.png, .jpeg, .webp)</Label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-bg-inset hover:bg-border text-ink text-xs font-semibold flex items-center gap-2 transition-colors">
            <IconUpload />
            <span>Upload Local File</span>
            <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="hidden" />
          </label>
          <span className="text-xs text-ink-faint truncate max-w-[150px]">
            {image ? "Image Selected" : "No file chosen"}
          </span>
        </div>

        {image && (
          <div className="mt-3 relative w-28 h-20 rounded-xl overflow-hidden border border-border group">
            <Image src={image} alt="Attachment" fill className="object-cover" unoptimized />
            <button
              onClick={() => {
                onImageChange("");
                onFileSelected(null);
              }}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IconX className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <PlatformSelector
        platforms={platforms}
        selected={selectedPlatforms}
        onToggle={onTogglePlatform}
        onToggleAll={onToggleAllPlatforms}
      />

      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <Button onClick={onPublish} disabled={isPublishing} className="flex-1">
          {isPublishing ? "Publishing…" : "Publish Now"}
        </Button>
        <Button variant="secondary" onClick={() => setScheduleOpen(true)}>
          Schedule
        </Button>
      </div>

      {scheduleOpen && (
        <ScheduleModal
          onClose={() => setScheduleOpen(false)}
          onConfirm={async (iso) => {
            await onSchedule(iso);
            setScheduleOpen(false);
          }}
        />
      )}
    </div>
  );
}
