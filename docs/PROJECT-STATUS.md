# OmniSocial — Project Status & Handoff

Single-user, publish-once/post-everywhere social media dashboard. Written for
handing this project to a fresh session (a new Claude Code session, a new
contributor, or just future-you) — read this first, then the linked docs for
depth.

## Repo

- GitHub: `Up-to-date-news/socialmedia`
- Working branch: `claude/plan-analysis-ui-design-dsp3ns`
- Everything below is already pushed to that branch.

## Locked Decisions (don't re-litigate these without a reason)

| Decision | Choice |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Hosting | Vercel (Hobby/free tier) |
| Database | Postgres (Vercel Postgres in prod, any local Postgres in dev) |
| File storage | Vercel Blob in prod; local disk (`public/uploads/`) fallback in dev |
| Auth | Single-admin only (no multi-user) — JWT + bcrypt, httpOnly cookie |
| Credential security | AES-256-GCM, encrypted at rest, master key in `MASTER_KEY` env var |
| Platforms | 8 total — Telegram, Discord, Facebook, Instagram, Reddit, Bluesky, Threads, Mastodon. **LinkedIn deliberately excluded.** |
| Design language | Claude.ai-inspired: warm cream/charcoal neutrals + terracotta accent (`#D97757`-ish), not the original mockup's dark/emerald theme. Fully responsive (mobile drawer nav / desktop sidebar). |

## What's Built (done, verified working)

**Frontend** (`src/components/`, `src/app/`)
- 4 tabs: Dashboard, Publishing Studio, Post History, API Vault — all responsive
- Login screen, credential-configure modal per platform, stats/delete modals
- Claude-style design tokens in `src/app/globals.css`, reusable UI primitives in `src/components/ui/`

**Backend** (`src/app/api/`, `src/lib/`)
- Auth: `POST /api/auth/login`, `/logout`, `GET /api/auth/session`
- Platforms: `GET /api/platforms`, `PUT`/`DELETE /api/platforms/:id/credentials`
- Posts: `GET`/`POST /api/posts`, `DELETE /api/posts/:id`, `GET /api/posts/:id/stats`
- Upload: `POST /api/upload`
- 8 real platform adapters (`src/lib/platforms/*.ts`) — each makes the actual
  documented HTTP call for that platform, and **automatically falls back to a
  deterministic mock response when that platform has no credentials
  configured yet.** Configuring a real credential later (via the API Vault UI)
  takes the exact same code down the real path — no code changes needed.

**Verified**: full curl walkthrough (login → save dummy credentials, shown
encrypted at rest in the DB → publish a post mixing a configured-dummy
platform against an unconfigured one → stats refresh → delete → 401 when
unauthenticated) and a full Playwright browser walkthrough, both passing
against a real local Postgres instance.

## What's Pending / Not Done

- **No real platform credentials configured anywhere yet.** Every platform is
  in mock mode until you add real ones via API Vault → Configure.
- **Meta App Review / Business Verification** (Facebook, Instagram, Threads) —
  not started. Per `docs/platform-api-research.md` this can take 2–4+ weeks;
  Telegram/Discord/Bluesky/Mastodon/Reddit need no such review.
- **Not deployed to Vercel yet** — Postgres/Blob stores need provisioning,
  env vars need setting. Steps in `docs/backend-setup.md`.
- **Scheduling** — the "Schedule" button is a placeholder toast, not a real feature.
- **Multi-user accounts** — intentionally out of scope (single-admin by design).

## Other Docs In This Repo (read these for depth)

- `docs/platform-api-research.md` — per-platform API research (auth method,
  approval process, endpoints, rate limits) + a decisions-needed checklist. Tamil.
- `docs/backend-plan.md` — the architecture plan (written before the backend existed).
- `docs/backend-setup.md` — how to run locally and deploy to Vercel, **including
  a `$`-escaping gotcha in `.env` files that silently breaks login** (Next.js
  expands `$VAR` in env files; a bcrypt hash is full of literal `$`).

## Local Setup — Quick Start

```powershell
git clone https://github.com/Up-to-date-news/socialmedia.git
cd socialmedia
git checkout claude/plan-analysis-ui-design-dsp3ns
npm install
```

Create `.env.local` (never commit this — see `.env.example` for the full
template and generation commands for each value):

```env
DATABASE_URL=postgres://<user>:<pass>@localhost:5432/omnisocial
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD_HASH=\$2b\$10\$...   # escape every $ as \$
JWT_SECRET=...
MASTER_KEY=...                      # 64 hex chars
```

Then:

```powershell
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`, log in with the email/password you hashed above.

(If you already generated `ADMIN_PASSWORD_HASH` / `JWT_SECRET` / `MASTER_KEY`
values earlier in a prior chat session, reuse those instead of regenerating —
they were shared directly in that conversation, not committed anywhere.)

## If You're a Fresh Session Picking This Up

Read, in order: this file → `docs/backend-setup.md` (get it running) →
`docs/platform-api-research.md` (when adding real platform credentials) →
`docs/backend-plan.md` (architecture rationale, if changing backend design).
The code itself is the source of truth for exact behavior; these docs explain
*why*, not just *what*.
