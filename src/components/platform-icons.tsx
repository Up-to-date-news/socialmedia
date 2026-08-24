// Custom monochrome line icons for each platform, matching icons.tsx's
// hand-drawn style. Deliberately generic (paper plane, camera, network nodes,
// etc.) rather than brand logos — avoids trademarked marks while staying
// visually distinct per platform.
import { ComponentType, SVGProps } from "react";
import { PlatformId } from "@/lib/types";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function TelegramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M21 12 3 3l6 9-6 9 18-9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DiscordGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <rect x="2.5" y="8" width="19" height="9" rx="4.5" />
      <path d="M7 10.5v4M5 12.5h4" />
      <circle cx="16" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M6 21V4a1 1 0 0 1 1-1h11a.5.5 0 0 1 .4.8L14.5 8l3.9 4.2a.5.5 0 0 1-.4.8H7" />
    </svg>
  );
}

function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M8 5 9.2 3h5.6L16 5" />
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <circle cx="12" cy="12.5" r="4" />
      <circle cx="17.3" cy="8.7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RedditGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M12 7V4M9.5 4h5" />
      <rect x="4" y="7" width="16" height="12" rx="5" />
      <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <path d="M9 16.3c.9.7 1.9 1 3 1s2.1-.3 3-1" />
    </svg>
  );
}

function BlueskyGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M12 12S9 5 5 6c-1 4 1 7 4 7.5-3 .3-4.5 2.5-3.5 5 3 .8 5.5-1 6.5-3.5" />
      <path d="M12 12s3-7 7-6c1 4-1 7-4 7.5 3 .3 4.5 2.5 3.5 5-3 .8-5.5-1-6.5-3.5" />
    </svg>
  );
}

function ThreadsGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M7 4c-2.5 0-4 2-4 4.5S4.5 13 7 13" />
      <path d="M7 4c3 0 5 2 5 5v6c0 2.5 2 4.5 4.5 4.5S21 17.5 21 15" />
    </svg>
  );
}

function MastodonGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <circle cx="6" cy="7" r="2.1" />
      <circle cx="18" cy="7" r="2.1" />
      <circle cx="12" cy="17" r="2.1" />
      <path d="M7.7 8.4 10.4 15M16.3 8.4 13.6 15M8.1 7h7.8" />
    </svg>
  );
}

const GLYPHS: Record<PlatformId, ComponentType<SVGProps<SVGSVGElement>>> = {
  telegram: TelegramGlyph,
  discord: DiscordGlyph,
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  reddit: RedditGlyph,
  bluesky: BlueskyGlyph,
  threads: ThreadsGlyph,
  mastodon: MastodonGlyph,
};

interface PlatformIconProps extends SVGProps<SVGSVGElement> {
  id: PlatformId;
}

export function PlatformIcon({ id, width = 18, height = 18, ...rest }: PlatformIconProps) {
  const Glyph = GLYPHS[id];
  return <Glyph width={width} height={height} {...rest} />;
}
