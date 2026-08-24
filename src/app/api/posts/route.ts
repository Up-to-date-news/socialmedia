import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireSession } from "@/lib/auth/session";
import { pool } from "@/lib/db";
import { PlatformId } from "@/lib/types";
import { POST_COLUMNS, computeOverallStatus, publishDuePosts, publishToPlatforms, rowToPost } from "@/lib/posts";

export async function GET(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  // Opportunistically fire any SCHEDULED posts whose time has passed. This
  // covers normal usage (Dashboard/History load) between Vercel Cron ticks.
  await publishDuePosts();

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const dateRange = searchParams.get("dateRange");

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (platform && platform !== "ALL") {
    values.push(platform);
    conditions.push(`platforms -> $${values.length} ->> 'status' = 'SUCCESS'`);
  }
  if (status && status !== "ALL") {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (search) {
    values.push(`%${search.toLowerCase()}%`);
    conditions.push(`(lower(title) like $${values.length} or lower(content) like $${values.length})`);
  }
  if (dateRange && dateRange !== "ALL") {
    const days = dateRange === "TODAY" ? 1 : dateRange === "WEEK" ? 7 : 30;
    values.push(`${days} days`);
    conditions.push(`created_at >= now() - $${values.length}::interval`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const { rows } = await pool.query(
    `select ${POST_COLUMNS} from posts ${where} order by created_at desc`,
    values
  );

  return NextResponse.json({ posts: rows.map(rowToPost) });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const title = body?.title;
  const content = body?.content;
  const imageUrl = body?.imageUrl as string | undefined;
  const platformIds = body?.platformIds as PlatformId[] | undefined;
  const scheduledAt = body?.scheduledAt as string | undefined;

  if (typeof title !== "string" || !title.trim() || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }
  if (!Array.isArray(platformIds) || platformIds.length === 0) {
    return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });
  }

  const postId = `post-${randomUUID()}`;
  const metrics = { likes: 0, comments: 0, shares: 0 };

  if (scheduledAt) {
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 });
    }
    const pendingPlatforms = Object.fromEntries(platformIds.map((id) => [id, { status: "PENDING" as const }]));
    const { rows } = await pool.query(
      `insert into posts (post_id, title, content, image_url, status, scheduled_at, platforms, metrics)
       values ($1, $2, $3, $4, 'SCHEDULED', $5, $6, $7)
       returning ${POST_COLUMNS}`,
      [postId, title, content, imageUrl ?? null, when.toISOString(), JSON.stringify(pendingPlatforms), JSON.stringify(metrics)]
    );
    return NextResponse.json({ post: rowToPost(rows[0]) });
  }

  const platforms = await publishToPlatforms({ title, content, imageUrl }, platformIds);
  const status = computeOverallStatus(platforms);

  const { rows } = await pool.query(
    `insert into posts (post_id, title, content, image_url, status, platforms, metrics)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning ${POST_COLUMNS}`,
    [postId, title, content, imageUrl ?? null, status, JSON.stringify(platforms), JSON.stringify(metrics)]
  );

  return NextResponse.json({ post: rowToPost(rows[0]) });
}
