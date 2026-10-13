-- NIKAHYA social authentication identities.
-- Apply in the Neon SQL Editor after the existing authentication migration (002).
-- Social sign-up consent timestamps are recorded for each newly created provider identity.

create table if not exists public.oauth_identities (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.auth_users(id) on delete cascade,
  provider text not null check (provider in ('google', 'facebook')),
  provider_user_id text not null,
  email text not null,
  age_confirmed_at timestamptz,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_user_id),
  unique (user_id, provider)
);

create index if not exists oauth_identities_user_id_idx
  on public.oauth_identities (user_id);

-- Never auto-link an OAuth identity to an existing account by e-mail alone.
-- Explicit account linking should require a separate authenticated re-check.
