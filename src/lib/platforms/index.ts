import { PlatformId } from "@/lib/types";
import { PlatformAdapter } from "./types";
import { telegramAdapter } from "./telegram";
import { discordAdapter } from "./discord";
import { facebookAdapter } from "./facebook";
import { instagramAdapter } from "./instagram";
import { redditAdapter } from "./reddit";
import { blueskyAdapter } from "./bluesky";
import { threadsAdapter } from "./threads";
import { mastodonAdapter } from "./mastodon";
import { twitterAdapter } from "./twitter";

export const PLATFORM_ADAPTERS: Record<PlatformId, PlatformAdapter<any>> = {
  telegram: telegramAdapter,
  discord: discordAdapter,
  facebook: facebookAdapter,
  instagram: instagramAdapter,
  reddit: redditAdapter,
  bluesky: blueskyAdapter,
  threads: threadsAdapter,
  mastodon: mastodonAdapter,
  twitter: twitterAdapter,
};

export function getAdapter(id: PlatformId): PlatformAdapter<any> {
  const adapter = PLATFORM_ADAPTERS[id];
  if (!adapter) throw new Error(`No adapter registered for platform: ${id}`);
  return adapter;
}

export * from "./types";
export * from "./registry";
