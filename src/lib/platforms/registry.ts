import { PlatformDefinition } from "./types";

// LinkedIn intentionally excluded (see docs/platform-api-research.md).
// Credential field shapes come straight from that research doc's per-platform
// auth sections.
export const PLATFORM_REGISTRY: PlatformDefinition[] = [
  {
    id: "telegram",
    name: "Telegram",
    icon: "✈️",
    metricLabel: "Channel Members",
    directUpload: true,
    directDelete: true,
    credentialFields: [
      { key: "botToken", label: "Bot Token", type: "password", placeholder: "123456:ABC-DEF..." },
      { key: "chatId", label: "Chat / Channel ID", type: "text", placeholder: "@your_channel or -100..." },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    icon: "💬",
    metricLabel: "Server Members",
    directUpload: true,
    directDelete: true,
    credentialFields: [
      { key: "botToken", label: "Bot Token", type: "password" },
      { key: "channelId", label: "Channel ID", type: "text" },
    ],
  },
  {
    id: "facebook",
    name: "Facebook Page",
    icon: "📘",
    metricLabel: "Page Fans",
    directUpload: true,
    directDelete: true,
    credentialFields: [
      { key: "pageId", label: "Page ID", type: "text" },
      { key: "pageAccessToken", label: "Page Access Token", type: "password" },
    ],
  },
  {
    id: "instagram",
    name: "Instagram Business",
    icon: "📷",
    metricLabel: "Followers",
    directUpload: true,
    directDelete: true,
    credentialFields: [
      { key: "igUserId", label: "IG User ID", type: "text" },
      { key: "accessToken", label: "Access Token", type: "password" },
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "🤖",
    metricLabel: "Subscribers",
    directUpload: true,
    directDelete: true,
    credentialFields: [
      { key: "clientId", label: "Client ID", type: "text" },
      { key: "clientSecret", label: "Client Secret", type: "password" },
      { key: "username", label: "Username", type: "text" },
      { key: "password", label: "Password", type: "password" },
      { key: "subreddit", label: "Subreddit", type: "text", placeholder: "test" },
      { key: "userAgent", label: "User-Agent", type: "text", placeholder: "platform:app_id:v1.0 (by /u/you)" },
    ],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    icon: "🦋",
    metricLabel: "Followers",
    directUpload: true,
    directDelete: true,
    credentialFields: [
      { key: "identifier", label: "Handle", type: "text", placeholder: "you.bsky.social" },
      { key: "appPassword", label: "App Password", type: "password" },
    ],
  },
  {
    id: "threads",
    name: "Threads",
    icon: "🧵",
    metricLabel: "Followers",
    directUpload: true,
    directDelete: true,
    credentialFields: [
      { key: "threadsUserId", label: "Threads User ID", type: "text" },
      { key: "accessToken", label: "Access Token", type: "password" },
    ],
  },
  {
    id: "mastodon",
    name: "Mastodon",
    icon: "🐘",
    metricLabel: "Account Followers",
    directUpload: true,
    directDelete: true,
    credentialFields: [
      { key: "instanceUrl", label: "Instance URL", type: "text", placeholder: "https://mastodon.social" },
      { key: "accessToken", label: "Access Token", type: "password" },
    ],
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: "𝕏",
    metricLabel: "Followers",
    directUpload: true,
    directDelete: true,
    // OAuth 1.0a user-context credentials from the X Developer Portal (App
    // must have Read+Write permission). No live OAuth redirect flow needed —
    // these 4 static values are enough to sign requests as your own account.
    credentialFields: [
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "apiKeySecret", label: "API Key Secret", type: "password" },
      { key: "accessToken", label: "Access Token", type: "password" },
      { key: "accessTokenSecret", label: "Access Token Secret", type: "password" },
    ],
  },
];

export function getPlatformDefinition(id: string): PlatformDefinition | undefined {
  return PLATFORM_REGISTRY.find((p) => p.id === id);
}
