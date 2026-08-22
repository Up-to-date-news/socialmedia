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
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  platforms: Partial<Record<PlatformId, PlatformResult>>;
  metrics: PostMetrics;
}

export interface Platform {
  id: PlatformId;
  name: string;
  icon: string;
  followers: number;
  posts: number;
  engagements: number;
  peakTime: string;
  status: "Connected" | "Disconnected";
  directUpload: boolean;
  directDelete: boolean;
  metricLabel: string;
}

export type ThemeMode = "light" | "dark";
export type ActiveTab = "dashboard" | "create" | "history" | "auth";
export type DateRange = "ALL" | "TODAY" | "WEEK" | "MONTH";
