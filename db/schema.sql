-- OmniSocial schema. Single-admin app: no `users` table, just an
-- ADMIN_EMAIL/ADMIN_PASSWORD_HASH pair in environment variables (see
-- src/lib/auth/session.ts and docs/backend-plan.md).

create table if not exists posts (
  post_id     text primary key,
  title       text not null,
  content     text not null,
  image_url   text,
  created_at  timestamptz not null default now(),
  status      text not null check (status in ('SUCCESS','PARTIAL','FAILED')),
  platforms   jsonb not null default '{}'::jsonb,
  metrics     jsonb not null default '{"likes":0,"comments":0,"shares":0}'::jsonb
);

create table if not exists platform_credentials (
  platform_id        text primary key,
  encrypted_payload  bytea not null,
  iv                 bytea not null,
  auth_tag           bytea not null,
  connected          boolean not null default true,
  updated_at         timestamptz not null default now()
);

create index if not exists posts_created_at_idx on posts (created_at desc);
