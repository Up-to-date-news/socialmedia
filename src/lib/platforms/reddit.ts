import { PlatformAdapter, mockDelete, mockPublish, mockStats } from "./types";
import { fetchJson } from "./http";

interface RedditCreds {
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  subreddit?: string;
  userAgent?: string;
}

async function getAccessToken(creds: RedditCreds): Promise<string> {
  const basic = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const data = await fetchJson<{ access_token: string }>("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": creds.userAgent!,
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: creds.username!,
      password: creds.password!,
    }).toString(),
  });
  return data.access_token;
}

export const redditAdapter: PlatformAdapter<RedditCreds> = {
  id: "reddit",

  isConfigured(creds) {
    return Boolean(
      creds.clientId && creds.clientSecret && creds.username && creds.password && creds.subreddit && creds.userAgent
    );
  },

  async publish(input, creds) {
    if (!redditAdapter.isConfigured(creds)) return mockPublish("reddit");
    try {
      const token = await getAccessToken(creds);
      const body = new URLSearchParams({
        sr: creds.subreddit!,
        title: input.title,
        kind: input.imageUrl ? "link" : "self",
        api_type: "json",
        ...(input.imageUrl ? { url: input.imageUrl } : { text: input.content }),
      });
      const data = await fetchJson<{ json: { data?: { name?: string }; errors: unknown[][] } }>(
        "https://oauth.reddit.com/api/submit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": creds.userAgent!,
          },
          body: body.toString(),
        }
      );
      if (data.json.errors?.length) {
        return { status: "FAILED", error: JSON.stringify(data.json.errors) };
      }
      return { status: "SUCCESS", platform_post_id: data.json.data?.name };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async delete(platformPostId, creds) {
    if (!redditAdapter.isConfigured(creds)) return mockDelete();
    try {
      const token = await getAccessToken(creds);
      await fetchJson("https://oauth.reddit.com/api/del", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": creds.userAgent!,
        },
        body: new URLSearchParams({ id: platformPostId }).toString(),
      });
      return { status: "SUCCESS" };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async fetchStats(platformPostId, creds) {
    if (!redditAdapter.isConfigured(creds)) return mockStats();
    try {
      const token = await getAccessToken(creds);
      const data = await fetchJson<{ data: { children: { data: { ups: number; num_comments: number } }[] } }>(
        `https://oauth.reddit.com/api/info?id=${platformPostId}`,
        { headers: { Authorization: `Bearer ${token}`, "User-Agent": creds.userAgent! } }
      );
      const post = data.data.children[0]?.data;
      if (!post) return null;
      return { likes: post.ups, comments: post.num_comments, shares: 0 };
    } catch {
      return null;
    }
  },
};
