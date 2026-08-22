import { PlatformId } from "@/lib/types";

export interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password";
  placeholder?: string;
}

export interface PlatformDefinition {
  id: PlatformId;
  name: string;
  icon: string;
  metricLabel: string;
  directUpload: boolean;
  directDelete: boolean;
  credentialFields: CredentialField[];
}

export interface PublishInput {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface AdapterResult {
  status: "SUCCESS" | "FAILED";
  platform_post_id?: string;
  error?: string;
}

export interface StatsResult {
  likes: number;
  comments: number;
  shares: number;
}

export interface PlatformAdapter<Creds = Record<string, string>> {
  id: PlatformId;
  /** True when the stored credentials are complete enough to attempt a real API call. */
  isConfigured(creds: Partial<Creds>): boolean;
  publish(input: PublishInput, creds: Creds): Promise<AdapterResult>;
  delete(platformPostId: string, creds: Creds): Promise<AdapterResult>;
  fetchStats(platformPostId: string, creds: Creds): Promise<StatsResult | null>;
}

/**
 * Deterministic stand-in used by every adapter until real credentials are
 * configured for that platform. Keeps the publish/delete/stats pipeline (DB
 * writes, UI, orchestration) fully exercisable with dummy data — swapping in
 * a real credential later takes the exact same code down the real fetch()
 * path with zero code changes.
 */
export function mockPublish(id: PlatformId): AdapterResult {
  return {
    status: "SUCCESS",
    platform_post_id: `${id}_mock_${Math.floor(Math.random() * 90000 + 10000)}`,
  };
}

export function mockDelete(): AdapterResult {
  return { status: "SUCCESS" };
}

export function mockStats(): StatsResult {
  return {
    likes: Math.floor(Math.random() * 200),
    comments: Math.floor(Math.random() * 40),
    shares: Math.floor(Math.random() * 20),
  };
}
