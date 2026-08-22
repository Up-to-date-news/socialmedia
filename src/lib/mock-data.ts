import { Platform, Post } from "./types";

// LinkedIn intentionally excluded (see docs/platform-api-research.md).
// directDelete reflects the corrected API research, not the original mockup:
// Instagram and Threads DO support delete-via-API as of current docs.
export const INITIAL_PLATFORMS: Platform[] = [
  {
    id: "telegram",
    name: "Telegram",
    icon: "✈️",
    followers: 18400,
    posts: 342,
    engagements: 124500,
    peakTime: "19:00 UTC",
    status: "Connected",
    directUpload: true,
    directDelete: true,
    metricLabel: "Channel Members",
  },
  {
    id: "discord",
    name: "Discord",
    icon: "💬",
    followers: 8200,
    posts: 1204,
    engagements: 15400,
    peakTime: "21:00 UTC",
    status: "Connected",
    directUpload: true,
    directDelete: true,
    metricLabel: "Server Members",
  },
  {
    id: "facebook",
    name: "Facebook Page",
    icon: "📘",
    followers: 32100,
    posts: 188,
    engagements: 22800,
    peakTime: "13:00 UTC",
    status: "Connected",
    directUpload: true,
    directDelete: true,
    metricLabel: "Page Fans",
  },
  {
    id: "instagram",
    name: "Instagram Business",
    icon: "📷",
    followers: 45600,
    posts: 210,
    engagements: 89200,
    peakTime: "18:00 UTC",
    status: "Connected",
    directUpload: true,
    directDelete: true,
    metricLabel: "Followers",
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "🤖",
    followers: 15800,
    posts: 74,
    engagements: 38200,
    peakTime: "16:00 UTC",
    status: "Connected",
    directUpload: true,
    directDelete: true,
    metricLabel: "Subscribers",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    icon: "🦋",
    followers: 6400,
    posts: 142,
    engagements: 12100,
    peakTime: "20:00 UTC",
    status: "Connected",
    directUpload: true,
    directDelete: true,
    metricLabel: "Followers",
  },
  {
    id: "threads",
    name: "Threads",
    icon: "🧵",
    followers: 11200,
    posts: 118,
    engagements: 19400,
    peakTime: "19:30 UTC",
    status: "Connected",
    directUpload: true,
    directDelete: true,
    metricLabel: "Followers",
  },
  {
    id: "mastodon",
    name: "Mastodon",
    icon: "🐘",
    followers: 4800,
    posts: 105,
    engagements: 8900,
    peakTime: "17:00 UTC",
    status: "Connected",
    directUpload: true,
    directDelete: true,
    metricLabel: "Account Followers",
  },
];

const allSuccess = (idPrefix: string) =>
  INITIAL_PLATFORMS.reduce((acc, p) => {
    acc[p.id] = {
      status: "SUCCESS" as const,
      platform_post_id: `${idPrefix}_${p.id}`,
    };
    return acc;
  }, {} as Post["platforms"]);

export const INITIAL_POSTS: Post[] = [
  {
    post_id: "post-101",
    title: "Launching Major V2.5 Platform Update",
    content:
      "We are thrilled to announce version 2.5 of our core platform! Features include multi-account routing, faster AI processing, and real-time collaborative editing.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-08-21T14:30:00Z",
    status: "SUCCESS",
    platforms: allSuccess("tg101"),
    metrics: { likes: 3420, comments: 284, shares: 192 },
  },
  {
    post_id: "post-102",
    title: "Weekly Tech & Web3 Market Insights",
    content:
      "Bitcoin breaks key resistance targets as decentralization protocols see record transaction volume. Here is our comprehensive weekly analysis.",
    image:
      "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-08-19T09:15:00Z",
    status: "SUCCESS",
    platforms: allSuccess("tg102"),
    metrics: { likes: 1890, comments: 142, shares: 98 },
  },
  {
    post_id: "post-103",
    title: "AI Design Systems & UI Best Practices",
    content:
      "How dark mode and subtle elevation create visual depth without cluttering the interface. Read our latest UI design principles guide.",
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-08-15T18:45:00Z",
    status: "PARTIAL",
    platforms: {
      ...allSuccess("tg103"),
      instagram: { status: "FAILED", error: "Aspect ratio mismatch" },
    },
    metrics: { likes: 1240, comments: 89, shares: 45 },
  },
];
