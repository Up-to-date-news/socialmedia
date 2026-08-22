import { PlatformAdapter, mockDelete, mockPublish, mockStats } from "./types";
import { fetchJson } from "./http";

interface MastodonCreds {
  instanceUrl?: string;
  accessToken?: string;
}

export const mastodonAdapter: PlatformAdapter<MastodonCreds> = {
  id: "mastodon",

  isConfigured(creds) {
    return Boolean(creds.instanceUrl && creds.accessToken);
  },

  async publish(input, creds) {
    if (!mastodonAdapter.isConfigured(creds)) return mockPublish("mastodon");
    const base = creds.instanceUrl!.replace(/\/$/, "");
    try {
      let mediaIds: string[] | undefined;
      if (input.imageUrl) {
        const imageRes = await fetch(input.imageUrl);
        const blob = await imageRes.blob();
        const form = new FormData();
        form.append("file", blob, "attachment");
        const media = await fetchJson<{ id: string }>(`${base}/api/v1/media`, {
          method: "POST",
          headers: { Authorization: `Bearer ${creds.accessToken}` },
          body: form,
        });
        mediaIds = [media.id];
      }
      const status = await fetchJson<{ id: string }>(`${base}/api/v1/statuses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: `${input.title}\n\n${input.content}`,
          media_ids: mediaIds,
        }),
      });
      return { status: "SUCCESS", platform_post_id: status.id };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async delete(platformPostId, creds) {
    if (!mastodonAdapter.isConfigured(creds)) return mockDelete();
    const base = creds.instanceUrl!.replace(/\/$/, "");
    try {
      await fetchJson(`${base}/api/v1/statuses/${platformPostId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${creds.accessToken}` },
      });
      return { status: "SUCCESS" };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async fetchStats(platformPostId, creds) {
    if (!mastodonAdapter.isConfigured(creds)) return mockStats();
    const base = creds.instanceUrl!.replace(/\/$/, "");
    try {
      const data = await fetchJson<{ favourites_count: number; reblogs_count: number; replies_count: number }>(
        `${base}/api/v1/statuses/${platformPostId}`,
        { headers: { Authorization: `Bearer ${creds.accessToken}` } }
      );
      return { likes: data.favourites_count, comments: data.replies_count, shares: data.reblogs_count };
    } catch {
      return null;
    }
  },
};
