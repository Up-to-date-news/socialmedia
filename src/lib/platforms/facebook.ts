import { PlatformAdapter, mockDelete, mockPublish, mockStats } from "./types";
import { fetchJson } from "./http";

interface FacebookCreds {
  pageId?: string;
  pageAccessToken?: string;
}

const API = "https://graph.facebook.com/v21.0";

export const facebookAdapter: PlatformAdapter<FacebookCreds> = {
  id: "facebook",

  isConfigured(creds) {
    return Boolean(creds.pageId && creds.pageAccessToken);
  },

  async publish(input, creds) {
    if (!facebookAdapter.isConfigured(creds)) return mockPublish("facebook");
    try {
      const message = `${input.title}\n\n${input.content}`;
      if (input.imageUrl) {
        const data = await fetchJson<{ post_id?: string; id: string }>(`${API}/${creds.pageId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: input.imageUrl, caption: message, access_token: creds.pageAccessToken }),
        });
        return { status: "SUCCESS", platform_post_id: data.post_id ?? data.id };
      }
      const data = await fetchJson<{ id: string }>(`${API}/${creds.pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, access_token: creds.pageAccessToken }),
      });
      return { status: "SUCCESS", platform_post_id: data.id };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async delete(platformPostId, creds) {
    if (!facebookAdapter.isConfigured(creds)) return mockDelete();
    try {
      await fetchJson(`${API}/${platformPostId}?access_token=${encodeURIComponent(creds.pageAccessToken!)}`, {
        method: "DELETE",
      });
      return { status: "SUCCESS" };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async fetchStats(platformPostId, creds) {
    if (!facebookAdapter.isConfigured(creds)) return mockStats();
    try {
      const data = await fetchJson<{
        likes?: { summary: { total_count: number } };
        comments?: { summary: { total_count: number } };
        shares?: { count: number };
      }>(
        `${API}/${platformPostId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${encodeURIComponent(
          creds.pageAccessToken!
        )}`
      );
      return {
        likes: data.likes?.summary.total_count ?? 0,
        comments: data.comments?.summary.total_count ?? 0,
        shares: data.shares?.count ?? 0,
      };
    } catch {
      return null;
    }
  },
};
