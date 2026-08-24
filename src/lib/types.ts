export type PlatformId =
  | "telegram"
  | "discord"
  | "facebook"
  | "instagram"
  | "reddit"
  | "bluesky"
  | "threads"
  | "mastodon";

export type PlatformResultStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface PlatformResult {
  status: PlatformResultStatus;
  platform_post_id?: string;
  error?: string;
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
}

// Mirrors the OmniSocial_Project_Blueprint.md publish-result schema.
export interface Post {
  post_id: string;
  title: string;
  content: string;
  image?: string;
  created_at: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED" | "SCHEDULED";
  scheduled_at?: string;
  platforms: Partial<Record<PlatformId, PlatformResult>>;
  metrics: PostMetrics;
}

export interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password";
  placeholder?: string;
}

// Shape returned by GET /api/platforms — real connection status and
// counts derived from the database, not mock numbers.
export interface Platform {
  id: PlatformId;
  name: string;
  icon: string;
  metricLabel: string;
  directUpload: boolean;
  directDelete: boolean;
  credentialFields: CredentialField[];
  connected: boolean;
  updatedAt: string | null;
  postsCount: number;
  engagements: number;
}

export type ThemeMode = "light" | "dark";
export type ActiveTab = "dashboard" | "create" | "scheduled" | "history" | "auth";
export type DateRange = "ALL" | "TODAY" | "WEEK" | "MONTH";
