-- NIKAHYA activity availability and local/travel leaderboards.
-- Apply in Neon after migration 013.
create table if not exists public.member_availability (
  user_id text primary key references public.profiles(id) on delete cascade,
  available_for text not null default 'restaurant' check (available_for in ('restaurant','game','weekend','travel')),
  is_available boolean not null default false,
  city text,
  country text,
  available_from date,
  available_until date,
  note text check (char_length(note) <= 240),
  updated_at timestamptz not null default now(),
  constraint availability_dates_valid check (available_until is null or available_from is null or available_until >= available_from)
);
create index if not exists member_availability_scope_idx on public.member_availability (available_for, is_available, country, city);
