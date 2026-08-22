import { PlatformAdapter, mockDelete, mockPublish, mockStats } from "./types";
import { fetchJson } from "./http";

interface ThreadsCreds {
  threadsUserId?: string;
  accessToken?: string;
}

const API = "https://graph.threads.net/v1.0";

export const threadsAdapter: PlatformAdapter<ThreadsCreds> = {
  id: "threads",

  isConfigured(creds) {
    return Boolean(creds.threadsUserId && creds.accessToken);
  },

  async publish(input, creds) {
    if (!threadsAdapter.isConfigured(creds)) return mockPublish("threads");
    try {
      const text = `${input.title}\n\n${input.content}`;
      const container = await fetchJson<{ id: string }>(`${API}/${creds.threadsUserId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: input.imageUrl ? "IMAGE" : "TEXT",
          text,
          image_url: input.imageUrl,
          access_token: creds.accessToken,
        }),
      });
      const published = await fetchJson<{ id: string }>(`${API}/${creds.threadsUserId}/threads_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: container.id, access_token: creds.accessToken }),
      });
      return { status: "SUCCESS", platform_post_id: published.id };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async delete(platformPostId, creds) {
    if (!threadsAdapter.isConfigured(creds)) return mockDelete();
    try {
      await fetchJson(`${API}/${platformPostId}?access_token=${encodeURIComponent(creds.accessToken!)}`, {
        method: "DELETE",
      });
      return { status: "SUCCESS" };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async fetchStats(platformPostId, creds) {
    if (!threadsAdapter.isConfigured(creds)) return mockStats();
    try {
      const data = await fetchJson<{ data: { name: string; values: { value: number }[] }[] }>(
        `${API}/${platformPostId}/insights?metric=likes,replies,reposts&access_token=${encodeURIComponent(
          creds.accessToken!
        )}`
      );
      const metric = (name: string) => data.data.find((m) => m.name === name)?.values?.[0]?.value ?? 0;
      return { likes: metric("likes"), comments: metric("replies"), shares: metric("reposts") };
    } catch {
      return null;
    }
  },
};
