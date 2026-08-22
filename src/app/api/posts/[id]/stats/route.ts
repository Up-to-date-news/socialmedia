import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { pool } from "@/lib/db";
import { getCredentials } from "@/lib/credentials";
import { getAdapter } from "@/lib/platforms";
import { PlatformId } from "@/lib/types";
import { POST_COLUMNS, rowToPost } from "@/lib/posts";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const { rows } = await pool.query(`select ${POST_COLUMNS} from posts where post_id = $1`, [id]);
  if (rows.length === 0) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const post = rowToPost(rows[0]);
  let likes = 0;
  let comments = 0;
  let shares = 0;

  for (const [platformId, result] of Object.entries(post.platforms)) {
    if (!result || result.status !== "SUCCESS" || !result.platform_post_id) continue;
    const adapter = getAdapter(platformId as PlatformId);
    const creds = (await getCredentials(platformId as PlatformId)) ?? {};
    const stats = await adapter.fetchStats(result.platform_post_id, creds);
    if (stats) {
      likes += stats.likes;
      comments += stats.comments;
      shares += stats.shares;
    }
  }

  const metrics = { likes, comments, shares };
  await pool.query("update posts set metrics = $1 where post_id = $2", [JSON.stringify(metrics), id]);

  return NextResponse.json({ post: { ...post, metrics } });
}
