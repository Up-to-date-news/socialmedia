import { PlatformAdapter, mockDelete, mockPublish, mockStats } from "./types";
import { fetchJson } from "./http";

interface InstagramCreds {
  igUserId?: string;
  accessToken?: string;
}

const API = "https://graph.facebook.com/v21.0";

export const instagramAdapter: PlatformAdapter<InstagramCreds> = {
  id: "instagram",

  isConfigured(creds) {
    return Boolean(creds.igUserId && creds.accessToken);
  },

  async publish(input, creds) {
    if (!instagramAdapter.isConfigured(creds)) return mockPublish("instagram");
    if (!input.imageUrl) {
      return { status: "FAILED", error: "Instagram requires an image (no text-only posts via the API)" };
    }
    try {
      const container = await fetchJson<{ id: string }>(`${API}/${creds.igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: input.imageUrl,
          caption: `${input.title}\n\n${input.content}`,
          access_token: creds.accessToken,
        }),
      });
      const published = await fetchJson<{ id: string }>(`${API}/${creds.igUserId}/media_publish`, {
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
    if (!instagramAdapter.isConfigured(creds)) return mockDelete();
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
    if (!instagramAdapter.isConfigured(creds)) return mockStats();
    try {
      const data = await fetchJson<{ like_count?: number; comments_count?: number }>(
        `${API}/${platformPostId}?fields=like_count,comments_count&access_token=${encodeURIComponent(
          creds.accessToken!
        )}`
      );
      return { likes: data.like_count ?? 0, comments: data.comments_count ?? 0, shares: 0 };
    } catch {
      return null;
    }
  },
};
