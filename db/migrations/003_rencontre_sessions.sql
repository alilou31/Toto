-- NIKAHYA Mode Rencontre: persisted game invitations attached to an existing match.
-- Apply after db/migrations/001_nikahya_initial.sql and 002_authentication.sql.

create table if not exists public.rencontre_sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  created_by text not null references public.profiles(id) on delete cascade,
  game_key text not null check (game_key in ('snake', 'logic', 'cooperative', 'english')),
  status text not null default 'invited' check (status in ('invited', 'active', 'completed', 'cancelled')),
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists rencontre_sessions_match_created_idx
  on public.rencontre_sessions (match_id, created_at desc);

create index if not exists rencontre_sessions_status_created_idx
  on public.rencontre_sessions (status, created_at desc);
