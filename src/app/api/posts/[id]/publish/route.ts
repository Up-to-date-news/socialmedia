import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { publishScheduledPostNow } from "@/lib/posts";

// Lets the admin fire a SCHEDULED post immediately instead of waiting for
// its scheduled_at time (used by the "Publish Now" action in Post History).
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const post = await publishScheduledPostNow(id);
  if (!post) return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 });
  return NextResponse.json({ post });
}
