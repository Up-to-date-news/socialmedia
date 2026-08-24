import { Post, PlatformId, PlatformResult } from "@/lib/types";
import { getAdapter } from "@/lib/platforms";
import { getCredentials } from "@/lib/credentials";
import { pool } from "@/lib/db";

interface PostRow {
  post_id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: Date | string;
  status: Post["status"];
  scheduled_at: Date | string | null;
  platforms: Record<string, PlatformResult>;
  metrics: Post["metrics"];
}

export const POST_COLUMNS = "post_id, title, content, image_url, created_at, status, scheduled_at, platforms, metrics";

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function rowToPost(row: PostRow): Post {
  return {
    post_id: row.post_id,
    title: row.title,
    content: row.content,
    image: row.image_url ?? undefined,
    created_at: toIso(row.created_at),
    status: row.status,
    scheduled_at: row.scheduled_at ? toIso(row.scheduled_at) : undefined,
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

export function computeOverallStatus(results: Record<string, PlatformResult>): "SUCCESS" | "PARTIAL" | "FAILED" {
  const values = Object.values(results);
  if (values.length === 0) return "FAILED";
  if (values.every((v) => v.status === "SUCCESS")) return "SUCCESS";
  if (values.some((v) => v.status === "SUCCESS")) return "PARTIAL";
  return "FAILED";
}

async function fireScheduledPost(row: PostRow): Promise<void> {
  const post = rowToPost(row);
  const platformIds = Object.keys(post.platforms) as PlatformId[];
  const results = await publishToPlatforms({ title: post.title, content: post.content, imageUrl: post.image }, platformIds);
  const status = computeOverallStatus(results);
  await pool.query(`update posts set status = $2, platforms = $3, scheduled_at = null where post_id = $1`, [
    post.post_id,
    status,
    JSON.stringify(results),
  ]);
}

/** Publishes every SCHEDULED post whose time has arrived. Returns how many fired. */
export async function publishDuePosts(): Promise<number> {
  const { rows } = await pool.query<PostRow>(
    `select ${POST_COLUMNS} from posts where status = 'SCHEDULED' and scheduled_at <= now()`
  );
  for (const row of rows) {
    await fireScheduledPost(row);
  }
  return rows.length;
}

/** Publishes one SCHEDULED post immediately, regardless of its scheduled time. */
export async function publishScheduledPostNow(postId: string): Promise<Post | null> {
  const { rows } = await pool.query<PostRow>(
    `select ${POST_COLUMNS} from posts where post_id = $1 and status = 'SCHEDULED'`,
    [postId]
  );
  if (rows.length === 0) return null;
  await fireScheduledPost(rows[0]);
  const { rows: updated } = await pool.query<PostRow>(`select ${POST_COLUMNS} from posts where post_id = $1`, [postId]);
  return rowToPost(updated[0]);
}
