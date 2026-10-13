-- NIKAHYA profile visits and online presence.
-- Apply in the Neon SQL Editor after migration 008.
-- Online is derived from last_seen_at in the last two minutes; no exact
-- last-seen timestamp is exposed to other members.

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

create table if not exists public.profile_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null references public.profiles(id) on delete cascade,
  profile_id text not null references public.profiles(id) on delete cascade,
  visited_at timestamptz not null default now(),
  unique (visitor_id, profile_id),
  check (visitor_id <> profile_id)
);

create index if not exists profile_visits_profile_visited_idx
  on public.profile_visits (profile_id, visited_at desc);

create index if not exists profiles_last_seen_idx
  on public.profiles (last_seen_at desc);
