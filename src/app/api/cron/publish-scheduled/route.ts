import { NextResponse } from "next/server";
import { publishDuePosts } from "@/lib/posts";

// Vercel Cron target (see vercel.json). Vercel signs cron requests with
// `Authorization: Bearer ${CRON_SECRET}` when that env var is set — verify it
// so this endpoint can't be used to trigger publishing from the outside.
// The `GET /api/posts` route also opportunistically fires due posts on every
// Dashboard/History load, so this is the belt-and-suspenders path for when
// nobody has the app open.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const published = await publishDuePosts();
  return NextResponse.json({ published });
}
