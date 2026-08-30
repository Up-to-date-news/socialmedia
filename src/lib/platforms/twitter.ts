import { createHmac, randomBytes } from "node:crypto";
import { PlatformAdapter, mockDelete, mockPublish, mockStats } from "./types";
import { fetchJson } from "./http";

interface TwitterCreds {
  apiKey?: string;
  apiKeySecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

type FullCreds = Required<TwitterCreds>;

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * RFC 5849 OAuth 1.0a signing for X (Twitter) API v2, which still requires
 * user-context OAuth 1.0a rather than OAuth 2.0 for posting as a specific
 * account. `signedParams` must be the request's query-string params (GET) or
 * x-www-form-urlencoded body params (POST form) — per spec, JSON and
 * multipart bodies are never included in the signature, so pass {} for those.
 */
function oauth1Header(
  method: string,
  url: string,
  creds: FullCreds,
  signedParams: Record<string, string> = {}
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };
  const allParams = { ...oauthParams, ...signedParams };
  const paramString = Object.keys(allParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join("&");
  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(creds.apiKeySecret)}&${percentEncode(creds.accessTokenSecret)}`;
  const signature = createHmac("sha1", signingKey).update(baseString).digest("base64");

  const headerParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  return (
    "OAuth " +
    Object.keys(headerParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(headerParams[k])}"`)
      .join(", ")
  );
}

const API_V2 = "https://api.twitter.com/2";
const UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";

async function uploadMedia(imageUrl: string, creds: FullCreds): Promise<string> {
  const imageRes = await fetch(imageUrl);
  const blob = await imageRes.blob();

  const form = new FormData();
  form.append("media", blob, "image");
  form.append("media_category", "tweet_image");

  // multipart body params are excluded from the OAuth1 signature per spec —
  // only the oauth_* params need signing here.
  const auth = oauth1Header("POST", UPLOAD_URL, creds);
  const data = await fetchJson<{ media_id_string: string }>(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: auth },
    body: form,
  });
  return data.media_id_string;
}

export const twitterAdapter: PlatformAdapter<TwitterCreds> = {
  id: "twitter",

  isConfigured(creds) {
    return Boolean(creds.apiKey && creds.apiKeySecret && creds.accessToken && creds.accessTokenSecret);
  },

  async publish(input, creds) {
    if (!twitterAdapter.isConfigured(creds)) return mockPublish("twitter");
    const full = creds as FullCreds;
    try {
      let mediaId: string | undefined;
      if (input.imageUrl) {
        mediaId = await uploadMedia(input.imageUrl, full);
      }
      const text = `${input.title}\n\n${input.content}`.slice(0, 280);
      const url = `${API_V2}/tweets`;
      const auth = oauth1Header("POST", url, full); // JSON body -> not signed
      const data = await fetchJson<{ data: { id: string } }>(url, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
        }),
      });
      return { status: "SUCCESS", platform_post_id: data.data.id };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async delete(platformPostId, creds) {
    if (!twitterAdapter.isConfigured(creds)) return mockDelete();
    const full = creds as FullCreds;
    try {
      const url = `${API_V2}/tweets/${platformPostId}`;
      const auth = oauth1Header("DELETE", url, full);
      await fetchJson(url, { method: "DELETE", headers: { Authorization: auth } });
      return { status: "SUCCESS" };
    } catch (err) {
      return { status: "FAILED", error: (err as Error).message };
    }
  },

  async fetchStats(platformPostId, creds) {
    if (!twitterAdapter.isConfigured(creds)) return mockStats();
    const full = creds as FullCreds;
    try {
      const params = { "tweet.fields": "public_metrics" };
      const url = `${API_V2}/tweets/${platformPostId}`;
      const auth = oauth1Header("GET", url, full, params);
      const qs = new URLSearchParams(params).toString();
      const data = await fetchJson<{
        data: { public_metrics: { like_count: number; reply_count: number; retweet_count: number } };
      }>(`${url}?${qs}`, { headers: { Authorization: auth } });
      const m = data.data.public_metrics;
      return { likes: m.like_count, comments: m.reply_count, shares: m.retweet_count };
    } catch {
      // X's Free API tier is write-only for many accounts — read access may
      // 403 here even with correct credentials. Nothing we can do about that.
      return null;
    }
  },
};
