import { Platform, PlatformId } from "@/lib/types";
import { PostForm } from "./PostForm";
import { LivePreview } from "./LivePreview";

interface PublishTabProps {
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
  previewPlatform: PlatformId;
  onPreviewPlatformChange: (id: PlatformId) => void;
}

export function PublishTab(props: PublishTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-7 space-y-6">
        <PostForm {...props} />
      </div>
      <div className="lg:col-span-5 space-y-4">
        <LivePreview
          platforms={props.platforms}
          previewPlatform={props.previewPlatform}
          onPreviewPlatformChange={props.onPreviewPlatformChange}
          title={props.title}
          content={props.content}
          image={props.image}
        />
      </div>
    </div>
  );
}
