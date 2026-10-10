-- NIKAHYA authentication foundation.
-- Apply in Neon SQL Editor after 001_nikahya_initial.sql.
-- Email verification and password-reset delivery are intentionally deferred to phase 2.

create table if not exists public.auth_users (
  id text primary key,
  email text not null,
  email_normalized text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  disabled_at timestamptz
);

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.auth_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists auth_sessions_user_expiry_idx
  on public.auth_sessions (user_id, expires_at);

create index if not exists auth_sessions_expiry_idx
  on public.auth_sessions (expires_at);

-- Store only a hash of the random session token; never store the cookie token itself.
