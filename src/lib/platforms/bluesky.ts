import { PlatformAdapter, mockDelete, mockPublish, mockStats } from "./types";
import { fetchJson } from "./http";

interface BlueskyCreds {
  identifier?: string;
  appPassword?: string;
}

const PDS = "https://bsky.social";
const PUBLIC_APPVIEW = "https://public.api.bsky.app";

async function createSession(creds: BlueskyCreds) {
  return fetchJson<{ accessJwt: string; did: string }>(`${PDS}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: creds.identifier, password: creds.appPassword }),
  });
}

/** `at://did/collection/rkey` -> { did, collection, rkey } */
function parseAtUri(uri: string) {
  const match = /^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(uri);
  if (!match) throw new Error(`Not a recognizable at:// URI: ${uri}`);
  return { did: match[1], collection: match[2], rkey: match[3] };
}

export const blueskyAdapter: PlatformAdapter<BlueskyCreds> = {
  id: "bluesky",

  isConfigured(creds) {
    return Boolean(creds.identifier && creds.appPassword);
  },

  async publish(input, creds) {
    if (!blueskyAdapter.isConfigured(creds)) return mockPublish("bluesky");
    try {
      const session = await createSession(creds);
      const record: Record<string, unknown> = {
        $type: "app.bsky.feed.post",
        text: `${input.title}\n\n${input.content}`.slice(0, 300),
        createdAt: new Date().toISOString(),
      };

      if (input.imageUrl) {
        const imageRes = await fetch(input.imageUrl);
        const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
        const bytes = new Uint8Array(await imageRes.arrayBuffer());
        const blob = await fetchJson<{ blob: unknown }>(`${PDS}/xrpc/com.atproto.repo.uploadBlob`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.accessJwt}`, "Content-Type": contentType },
          body: bytes,
        });
        record.embed = { $type: "app.bsky.embed.images", images: [{ image: blob.blob, alt: input.title }] };
      }

      const created = await fetchJson<{ uri: string }>(`${PDS}/xrpc/com.atproto.repo.createRecord`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessJwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ repo: session.did, collection: "app.bsky.feed.post", record }),
      });
      return { status: "SUCCESS", platform_post_id: created.uri };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async delete(platformPostId, creds) {
    if (!blueskyAdapter.isConfigured(creds)) return mockDelete();
    try {
      const session = await createSession(creds);
      const { collection, rkey } = parseAtUri(platformPostId);
      await fetchJson(`${PDS}/xrpc/com.atproto.repo.deleteRecord`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessJwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ repo: session.did, collection, rkey }),
      });
      return { status: "SUCCESS" };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async fetchStats(platformPostId, creds) {
    if (!blueskyAdapter.isConfigured(creds)) return mockStats();
    try {
      const data = await fetchJson<{
        thread: { post: { likeCount?: number; repostCount?: number; replyCount?: number } };
      }>(`${PUBLIC_APPVIEW}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(platformPostId)}`);
      const post = data.thread.post;
      return { likes: post.likeCount ?? 0, comments: post.replyCount ?? 0, shares: post.repostCount ?? 0 };
    } catch {
      return null;
    }
  },
};
