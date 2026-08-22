import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { pool } from "@/lib/db";
import { getCredentials } from "@/lib/credentials";
import { getAdapter, getPlatformDefinition } from "@/lib/platforms";
import { PlatformId } from "@/lib/types";
import { POST_COLUMNS, rowToPost } from "@/lib/posts";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const { rows } = await pool.query(`select ${POST_COLUMNS} from posts where post_id = $1`, [id]);
  if (rows.length === 0) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const post = rowToPost(rows[0]);
  const deletedFrom: string[] = [];
  const restrictedPlatforms: string[] = [];

  for (const [platformId, result] of Object.entries(post.platforms)) {
    if (!result || result.status !== "SUCCESS" || !result.platform_post_id) continue;
    const definition = getPlatformDefinition(platformId);
    if (!definition) continue;
    if (!definition.directDelete) {
      restrictedPlatforms.push(definition.name);
      continue;
    }
    const adapter = getAdapter(platformId as PlatformId);
    const creds = (await getCredentials(platformId as PlatformId)) ?? {};
    const outcome = await adapter.delete(result.platform_post_id, creds);
    if (outcome.status === "SUCCESS") deletedFrom.push(definition.name);
  }

  await pool.query("delete from posts where post_id = $1", [id]);

  return NextResponse.json({ ok: true, deletedFrom, restrictedPlatforms });
}
