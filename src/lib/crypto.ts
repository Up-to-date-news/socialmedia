import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function getMasterKey(): Buffer {
  const hex = process.env.MASTER_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("MASTER_KEY must be set to 64 hex characters (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

export interface EncryptedPayload {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

export function encryptJson(value: unknown): EncryptedPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getMasterKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { ciphertext, iv, authTag: cipher.getAuthTag() };
}

export function decryptJson<T = unknown>(payload: EncryptedPayload): T {
  const decipher = createDecipheriv("aes-256-gcm", getMasterKey(), payload.iv);
  decipher.setAuthTag(payload.authTag);
  const plaintext = Buffer.concat([decipher.update(payload.ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}
