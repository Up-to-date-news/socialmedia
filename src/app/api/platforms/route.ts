import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { PLATFORM_REGISTRY } from "@/lib/platforms/registry";
import { getConnectedStatus } from "@/lib/credentials";
import { pool } from "@/lib/db";
import { PlatformResult, PostMetrics } from "@/lib/types";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const [connectedStatus, postsResult] = await Promise.all([
    getConnectedStatus(),
    pool.query<{ platforms: Record<string, PlatformResult>; metrics: PostMetrics }>(
      "select platforms, metrics from posts"
    ),
  ]);

  const platforms = PLATFORM_REGISTRY.map((def) => {
    let postsCount = 0;
    let engagements = 0;
    for (const row of postsResult.rows) {
      if (row.platforms?.[def.id]?.status === "SUCCESS") {
        postsCount += 1;
        engagements += (row.metrics?.likes ?? 0) + (row.metrics?.comments ?? 0) + (row.metrics?.shares ?? 0);
      }
    }
    const status = connectedStatus[def.id];
    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      metricLabel: def.metricLabel,
      directUpload: def.directUpload,
      directDelete: def.directDelete,
      credentialFields: def.credentialFields,
      connected: status?.connected ?? false,
      updatedAt: status?.updated_at ?? null,
      postsCount,
      engagements,
    };
  });

  return NextResponse.json({ platforms });
}
