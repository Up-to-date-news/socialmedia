import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getPlatformDefinition } from "@/lib/platforms/registry";
import { setCredentials, deleteCredentials } from "@/lib/credentials";
import { PlatformId } from "@/lib/types";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const definition = getPlatformDefinition(id);
  if (!definition) return NextResponse.json({ error: "Unknown platform" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const missing = definition.credentialFields.filter((f) => !(body as Record<string, unknown>)[f.key]);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing fields: ${missing.map((f) => f.label).join(", ")}` }, { status: 400 });
  }

  const creds: Record<string, string> = {};
  for (const field of definition.credentialFields) {
    creds[field.key] = String((body as Record<string, unknown>)[field.key]);
  }

  await setCredentials(id as PlatformId, creds);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  await deleteCredentials(id as PlatformId);
  return NextResponse.json({ ok: true });
}
