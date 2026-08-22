import { PlatformAdapter, mockDelete, mockPublish } from "./types";
import { fetchJson } from "./http";

interface TelegramCreds {
  botToken?: string;
  chatId?: string;
}

export const telegramAdapter: PlatformAdapter<TelegramCreds> = {
  id: "telegram",

  isConfigured(creds) {
    return Boolean(creds.botToken && creds.chatId);
  },

  async publish(input, creds) {
    if (!telegramAdapter.isConfigured(creds)) return mockPublish("telegram");
    const base = `https://api.telegram.org/bot${creds.botToken}`;
    const caption = `${input.title}\n\n${input.content}`;
    try {
      if (input.imageUrl) {
        const data = await fetchJson<{ result: { message_id: number } }>(`${base}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: creds.chatId, photo: input.imageUrl, caption }),
        });
        return { status: "SUCCESS", platform_post_id: String(data.result.message_id) };
      }
      const data = await fetchJson<{ result: { message_id: number } }>(`${base}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: creds.chatId, text: caption }),
      });
      return { status: "SUCCESS", platform_post_id: String(data.result.message_id) };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async delete(platformPostId, creds) {
    if (!telegramAdapter.isConfigured(creds)) return mockDelete();
    try {
      await fetchJson(`https://api.telegram.org/bot${creds.botToken}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: creds.chatId, message_id: Number(platformPostId) }),
      });
      return { status: "SUCCESS" };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async fetchStats() {
    // Bot API exposes no likes/views concept for ordinary chats (see
    // docs/platform-api-research.md) — genuinely nothing to fetch here.
    return null;
  },
};
