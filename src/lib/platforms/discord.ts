import { PlatformAdapter, mockDelete, mockPublish, mockStats } from "./types";
import { fetchJson } from "./http";

interface DiscordCreds {
  botToken?: string;
  channelId?: string;
}

const API = "https://discord.com/api/v10";

export const discordAdapter: PlatformAdapter<DiscordCreds> = {
  id: "discord",

  isConfigured(creds) {
    return Boolean(creds.botToken && creds.channelId);
  },

  async publish(input, creds) {
    if (!discordAdapter.isConfigured(creds)) return mockPublish("discord");
    try {
      const data = await fetchJson<{ id: string }>(`${API}/channels/${creds.channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${creds.botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input.title,
          embeds: [
            {
              description: input.content,
              image: input.imageUrl ? { url: input.imageUrl } : undefined,
            },
          ],
        }),
      });
      return { status: "SUCCESS", platform_post_id: data.id };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async delete(platformPostId, creds) {
    if (!discordAdapter.isConfigured(creds)) return mockDelete();
    try {
      await fetchJson(`${API}/channels/${creds.channelId}/messages/${platformPostId}`, {
        method: "DELETE",
        headers: { Authorization: `Bot ${creds.botToken}` },
      });
      return { status: "SUCCESS" };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async fetchStats(platformPostId, creds) {
    if (!discordAdapter.isConfigured(creds)) return mockStats();
    try {
      const message = await fetchJson<{ reactions?: { count: number }[] }>(
        `${API}/channels/${creds.channelId}/messages/${platformPostId}`,
        { headers: { Authorization: `Bot ${creds.botToken}` } }
      );
      const likes = (message.reactions ?? []).reduce((sum, r) => sum + r.count, 0);
      return { likes, comments: 0, shares: 0 };
    } catch {
      return null;
    }
  },
};
