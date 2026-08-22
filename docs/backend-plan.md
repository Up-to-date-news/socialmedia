# OmniSocial — Backend Plan (not yet implemented)

This is the architecture plan for the backend that the current frontend (`src/`)
will connect to. Nothing in this document is built yet — the frontend runs
entirely on client-side mock state today. This is the reference to implement
against once we start on the backend.

## Stack (locked earlier in planning)

- **Framework**: Next.js API routes (App Router route handlers), same repo as the frontend
- **Hosting**: Vercel (Hobby/free tier)
- **Database**: Vercel Postgres
- **File storage**: Vercel Blob (post images — needs a public URL for Instagram/Threads/Reddit link-posts per `docs/platform-api-research.md`)
- **Auth**: Single-admin JWT (no multi-user system — see `docs/platform-api-research.md` background)
- **Secrets encryption**: AES-256-GCM, master key in a Vercel encrypted environment variable

## Data model

Single-admin app — no `users` table. Two tables cover everything:

```sql
create table posts (
  post_id       text primary key,
  title         text not null,
  content       text not null,
  image_url     text,
  created_at    timestamptz not null default now(),
  status        text not null check (status in ('SUCCESS','PARTIAL','FAILED')),
  platforms     jsonb not null,   -- { telegram: { status, platform_post_id, error }, ... }
  metrics       jsonb not null default '{"likes":0,"comments":0,"shares":0}'
);

create table platform_credentials (
  platform_id       text primary key,  -- 'telegram' | 'discord' | ... (8 values, no linkedin)
  encrypted_payload  bytea not null,    -- AES-256-GCM ciphertext of the credential JSON
  iv                bytea not null,
  auth_tag          bytea not null,
  connected         boolean not null default false,
  updated_at        timestamptz not null default now()
);
```

`platforms` and `metrics` stay JSONB rather than normalized tables — they mirror
the shape already in `docs/platform-api-research.md` and `src/lib/types.ts`
(`Post`, `PlatformResult`), so the API can return DB rows almost as-is.

## Auth

Single hardcoded admin identity, not a `users` table row-per-user system:

- `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` (bcrypt) as Vercel environment variables
- `POST /api/auth/login` — checks email/password against the env vars, issues a JWT (short-lived access token + httpOnly cookie)
- `POST /api/auth/logout` — clears the cookie
- Middleware on every other `/api/*` route checks the JWT cookie; no route is reachable without it

This matches the "Active Session" card already in the API Vault tab
(`src/components/auth/ApiVaultTab.tsx`) — that UI just needs to call these two
endpoints instead of the current local `authenticated` boolean.

## Secrets encryption

Every platform credential (bot token, OAuth token, app password, etc.) goes
through the same pipeline before it touches the database:

```
plaintext credential JSON
  → AES-256-GCM encrypt with MASTER_KEY (Vercel env var, 32 random bytes)
  → store { encrypted_payload, iv, auth_tag } in platform_credentials
```

`MASTER_KEY` never appears in code — only read from `process.env.MASTER_KEY` at
runtime. Decryption only happens inside the platform adapter right before an
API call is made; a decrypted secret is never sent back to the browser. The
API Vault UI only ever receives `{ platform_id, connected, updated_at }` — no
route returns `encrypted_payload` to the client.

## Platform adapter interface

One shared interface, one file per platform, so adding/changing a platform
doesn't touch the publish/delete orchestration logic:

```ts
interface PlatformAdapter {
  id: PlatformId;
  publish(input: { title: string; content: string; imageUrl?: string }, creds: unknown):
    Promise<{ status: "SUCCESS" | "FAILED"; platform_post_id?: string; error?: string }>;
  delete(platformPostId: string, creds: unknown): Promise<{ status: "SUCCESS" | "FAILED"; error?: string }>;
  fetchStats(platformPostId: string, creds: unknown): Promise<{ likes: number; comments: number; shares: number } | null>;
}
```

`src/lib/platforms/telegram.ts`, `discord.ts`, `facebook.ts`, `instagram.ts`,
`reddit.ts`, `bluesky.ts`, `threads.ts`, `mastodon.ts` each implement this
against the endpoints documented in `docs/platform-api-research.md`. Until
real credentials exist for a given platform, its adapter can return a mock
result — that's exactly what the frontend does today, so swapping the mock
`handlePublishNow` fan-out loop in `src/components/AppShell.tsx` for a real
`POST /api/posts` call is a drop-in replacement once even one adapter is real.

## API routes

| Route | Purpose |
|---|---|
| `POST /api/auth/login`, `/logout` | Session |
| `GET /api/platforms` | List platforms + `connected` status (replaces `INITIAL_PLATFORMS` mock) |
| `PUT /api/platforms/:id/credentials` | Save + encrypt a platform's credentials |
| `DELETE /api/platforms/:id/credentials` | Revoke/remove a platform's credentials |
| `GET /api/posts` | List posts (server-side filter by platform/status/date/search, replacing the client `useMemo` filter) |
| `POST /api/posts` | Fan out to each selected platform adapter's `publish()`, write the result row |
| `DELETE /api/posts/:id` | Fan out to each connected platform adapter's `delete()` |
| `GET /api/posts/:id/stats` | Refresh `metrics` via each adapter's `fetchStats()` |
| `POST /api/upload` | Accept an image, store to Vercel Blob, return its public URL |

## Suggested build order

1. Auth (login/logout + JWT middleware) — unblocks everything else being protected
2. `platform_credentials` table + encryption helper + Vault UI wiring (no real platforms yet, just the encrypt/store/status-only round trip)
3. Vercel Blob upload endpoint — needed before any platform publish, since Instagram/Threads/Reddit require a public image URL
4. Telegram + Discord + Bluesky + Mastodon adapters first (per `docs/platform-api-research.md`, no app review needed — fastest to get real end-to-end publishing working)
5. `posts` table + `POST /api/posts` orchestration, swap into `AppShell.tsx`
6. Reddit adapter (needs subreddit/account decisions from the research doc's checklist)
7. Meta-owned adapters (Facebook, Instagram, Threads) last — gated on Business Verification / App Review timeline, independent of everything else being done
