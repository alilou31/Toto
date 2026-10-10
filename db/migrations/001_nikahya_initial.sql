-- NIKAHYA initial PostgreSQL schema for Neon.
-- Apply in Neon SQL Editor on a development database first.
-- Authentication is not included in this migration: profile IDs must later be
-- tied to the chosen auth provider, and all writes must be authorized server-side.

create table if not exists public.profiles (
  id text primary key,
  public_name text not null check (char_length(public_name) between 1 and 40),
  city text,
  bio text not null default '' check (char_length(bio) <= 1000),
  relationship_intention text,
  birth_date date,
  visibility text not null default 'hidden' check (visibility in ('visible', 'paused', 'hidden')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_adult_only check (birth_date is null or birth_date <= (current_date - interval '18 years')::date)
);

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  display_order smallint not null default 0 check (display_order between 0 and 9),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  sender_id text not null references public.profiles(id) on delete cascade,
  recipient_id text not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'ignored', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sender_id, recipient_id),
  check (sender_id <> recipient_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a text not null references public.profiles(id) on delete cascade,
  user_b text not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id text not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.blocks (
  blocker_id text not null references public.profiles(id) on delete cascade,
  blocked_id text not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id text not null references public.profiles(id) on delete cascade,
  reported_user_id text not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('fake_profile', 'harassment', 'scam', 'inappropriate_content', 'underage_concern', 'other')),
  details text check (char_length(details) <= 3000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_user_id)
);

create index if not exists profiles_discovery_idx on public.profiles (visibility, onboarding_completed);
create index if not exists profiles_city_idx on public.profiles (city);
create index if not exists interests_recipient_status_idx on public.interests (recipient_id, status, created_at desc);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at desc);
create index if not exists reports_status_created_idx on public.reports (status, created_at desc);
