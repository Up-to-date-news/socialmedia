# Running & Deploying OmniSocial

This documents how to actually run the backend built per `docs/backend-plan.md`
— locally, and in production on Vercel.

## Local development

1. **Postgres**: point `DATABASE_URL` at any reachable Postgres 14+ instance.
   Locally that's typically `postgres://user:pass@localhost:5432/omnisocial`.
2. Copy `.env.example` to `.env.local` and fill in every value (see the
   generation commands inside the file for `ADMIN_PASSWORD_HASH`, `JWT_SECRET`,
   `MASTER_KEY`).
   - **Escape `$` in `.env.local`.** Next.js expands `$VAR`/`${VAR}` inside env
     files. A bcrypt hash is full of literal `$` (`$2b$10$...`) — write it as
     `\$2b\$10\$...` or every login will silently fail with "Invalid email or
     password" even though the hash is correct.
3. `npm install`
4. `npm run db:migrate` — applies `db/schema.sql` (idempotent, safe to re-run).
5. `npm run dev`, then sign in at `http://localhost:3000` with `ADMIN_EMAIL` /
   the plaintext password you hashed into `ADMIN_PASSWORD_HASH`.
6. Image uploads write to `public/uploads/` in this mode (see `BLOB_READ_WRITE_TOKEN`
   below for why that's dev-only).

## Configuring a platform (dummy or real — same steps either way)

Open **API Vault → Configure** next to a platform and fill in its fields.
Nothing about the workflow changes between a placeholder value and a real one:

- With a **dummy/placeholder** credential (e.g. `dummy-bot-token-123`), publish
  attempts a real API call, which fails naturally (bad auth) and the post is
  recorded with that platform's real error message — useful for exercising the
  full pipeline (encryption, DB writes, status aggregation, UI) before you have
  real developer accounts approved.
- With a **real** credential, the exact same code path succeeds. No code
  change, no redeploy — just re-open Configure and paste the real value in.

Each platform's required fields and the concrete endpoints they hit are in
`src/lib/platforms/<platform>.ts`, matching the auth sections of
`docs/platform-api-research.md`.

## Deploying to Vercel

1. Push this repo to GitHub, import it into Vercel.
2. Add a **Vercel Postgres** store to the project → it injects `DATABASE_URL`
   automatically (or copy its connection string manually if the env var name
   differs — the app only ever reads `DATABASE_URL`).
3. Add a **Vercel Blob** store → it injects `BLOB_READ_WRITE_TOKEN`
   automatically. This flips `/api/upload` from the local-disk fallback to
   real Blob storage — required in production, since Vercel's filesystem is
   read-only outside `/tmp`.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `MASTER_KEY` as
   encrypted Environment Variables in the Vercel project settings (same
   generation commands as `.env.example`; the `$`-escaping issue above applies
   here too if you paste directly into a `.env` file — Vercel's dashboard env
   var UI itself does not do `$` expansion, only files loaded by Next.js do).
5. Run the migration once against the production database — easiest is
   temporarily setting `DATABASE_URL` locally to the production connection
   string and running `npm run db:migrate`, then unsetting it.
6. Deploy. First login uses the admin credentials from step 4.

## What's real vs. what's still a placeholder

- **Real**: auth (JWT + bcrypt), AES-256-GCM credential encryption, all 8
  platform adapters' HTTP calls (fire for real the moment real credentials are
  configured), Postgres-backed posts/platforms, image upload.
- **Mock fallback**: any platform without configured credentials returns a
  deterministic simulated result (`src/lib/platforms/types.ts` — `mockPublish`
  / `mockDelete` / `mockStats`) so the UI and pipeline stay fully testable
  before every platform's real developer account is set up.
- **Not built**: scheduling ("Schedule" button is still a placeholder toast),
  multi-user accounts (intentionally out of scope — single-admin app).
