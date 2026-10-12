-- Cooperative activities are invitations between members who already have a mutual match.
create table if not exists public.rencontre_sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete cascade,
  invited_user_id uuid not null references public.users(id) on delete cascade,
  game_key text not null check (game_key in ('logic','english','snake','cooperative')),
  status text not null default 'invited' check (status in ('invited','active','completed','cancelled')),
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint rencontre_sessions_distinct_users check (created_by <> invited_user_id)
);
create index if not exists rencontre_sessions_created_by_idx on public.rencontre_sessions (created_by, created_at desc);
create index if not exists rencontre_sessions_invited_user_idx on public.rencontre_sessions (invited_user_id, created_at desc);
