-- Password-reset tokens are stored only as SHA-256 hashes.
-- Apply this migration to Neon before enabling the password-reset endpoints.
create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auth_users(id) on delete cascade,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_user_created_idx
  on public.password_reset_tokens (user_id, created_at desc);

create index if not exists password_reset_tokens_expiry_idx
  on public.password_reset_tokens (expires_at);
