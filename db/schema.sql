-- OmniSocial schema. Single-admin app: no `users` table, just an
-- ADMIN_EMAIL/ADMIN_PASSWORD_HASH pair in environment variables (see
-- src/lib/auth/session.ts and docs/backend-plan.md).

create table if not exists posts (
  post_id       text primary key,
  title         text not null,
  content       text not null,
  image_url     text,
  created_at    timestamptz not null default now(),
  status        text not null check (status in ('SUCCESS','PARTIAL','FAILED','SCHEDULED')),
  scheduled_at  timestamptz,
  platforms     jsonb not null default '{}'::jsonb,
  metrics       jsonb not null default '{"likes":0,"comments":0,"shares":0}'::jsonb
);

-- Idempotent upgrade path for databases created before scheduling existed.
alter table posts add column if not exists scheduled_at timestamptz;
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'posts_status_check') then
    alter table posts drop constraint posts_status_check;
  end if;
  alter table posts add constraint posts_status_check check (status in ('SUCCESS','PARTIAL','FAILED','SCHEDULED'));
end $$;

create table if not exists platform_credentials (
  platform_id        text primary key,
  encrypted_payload  bytea not null,
  iv                 bytea not null,
  auth_tag           bytea not null,
  connected          boolean not null default true,
  updated_at         timestamptz not null default now()
);

create index if not exists posts_created_at_idx on posts (created_at desc);
create index if not exists posts_scheduled_at_idx on posts (scheduled_at) where status = 'SCHEDULED';
