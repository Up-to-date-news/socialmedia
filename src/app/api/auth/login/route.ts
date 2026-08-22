import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) {
    return NextResponse.json({ error: "Admin account is not configured" }, { status: 500 });
  }

  const emailMatches = email === adminEmail;
  const passwordMatches = emailMatches && (await bcrypt.compare(password, adminHash));

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSessionCookie({ email });
  return NextResponse.json({ email });
}
