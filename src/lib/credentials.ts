import { pool } from "@/lib/db";
import { encryptJson, decryptJson } from "@/lib/crypto";
import { PlatformId } from "@/lib/types";

export async function getCredentials(platformId: PlatformId): Promise<Record<string, string> | null> {
  const { rows } = await pool.query(
    "select encrypted_payload, iv, auth_tag from platform_credentials where platform_id = $1",
    [platformId]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return decryptJson({ ciphertext: row.encrypted_payload, iv: row.iv, authTag: row.auth_tag });
}

export async function setCredentials(platformId: PlatformId, creds: Record<string, string>) {
  const { ciphertext, iv, authTag } = encryptJson(creds);
  await pool.query(
    `insert into platform_credentials (platform_id, encrypted_payload, iv, auth_tag, connected, updated_at)
     values ($1, $2, $3, $4, true, now())
     on conflict (platform_id) do update set
       encrypted_payload = excluded.encrypted_payload,
       iv = excluded.iv,
       auth_tag = excluded.auth_tag,
       connected = true,
       updated_at = now()`,
    [platformId, ciphertext, iv, authTag]
  );
}

export async function deleteCredentials(platformId: PlatformId) {
  await pool.query("delete from platform_credentials where platform_id = $1", [platformId]);
}

export async function getConnectedStatus(): Promise<Record<string, { connected: boolean; updated_at: string }>> {
  const { rows } = await pool.query("select platform_id, connected, updated_at from platform_credentials");
  return Object.fromEntries(rows.map((r) => [r.platform_id, { connected: r.connected, updated_at: r.updated_at }]));
}
