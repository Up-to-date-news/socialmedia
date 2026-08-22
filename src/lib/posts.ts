import { Post, PlatformId, PlatformResult } from "@/lib/types";
import { getAdapter } from "@/lib/platforms";
import { getCredentials } from "@/lib/credentials";

interface PostRow {
  post_id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: Date | string;
  status: Post["status"];
  platforms: Record<string, PlatformResult>;
  metrics: Post["metrics"];
}

export const POST_COLUMNS = "post_id, title, content, image_url, created_at, status, platforms, metrics";

export function rowToPost(row: PostRow): Post {
  return {
    post_id: row.post_id,
    title: row.title,
    content: row.content,
    image: row.image_url ?? undefined,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    status: row.status,
    platforms: row.platforms,
    metrics: row.metrics,
  };
}

export async function publishToPlatforms(
  input: { title: string; content: string; imageUrl?: string },
  platformIds: PlatformId[]
): Promise<Record<string, PlatformResult>> {
  const results: Record<string, PlatformResult> = {};
  for (const id of platformIds) {
    const adapter = getAdapter(id);
    const creds = (await getCredentials(id)) ?? {};
    results[id] = await adapter.publish(input, creds);
  }
  return results;
}

export function computeOverallStatus(results: Record<string, PlatformResult>): Post["status"] {
  const values = Object.values(results);
  if (values.length === 0) return "FAILED";
  if (values.every((v) => v.status === "SUCCESS")) return "SUCCESS";
  if (values.some((v) => v.status === "SUCCESS")) return "PARTIAL";
  return "FAILED";
}
