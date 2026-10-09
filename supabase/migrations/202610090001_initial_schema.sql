-- NIKAHYA initial schema. Review and test in a non-production Supabase project first.
create extension if not exists pgcrypto;

create type public.profile_visibility as enum ('visible','paused','hidden');
create type public.interest_status as enum ('pending','accepted','ignored','withdrawn');
create type public.report_status as enum ('open','reviewing','resolved','dismissed');
create type public.subscription_status as enum ('inactive','trialing','active','past_due','canceled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  public_name text not null check (char_length(public_name) between 1 and 40),
  city text,
  region_code text,
  bio text not null default '' check (char_length(bio) <= 1000),
  interests text[] not null default '{}',
  languages text[] not null default '{}',
  relationship_intention text,
  life_goals text[] not null default '{}',
  visibility public.profile_visibility not null default 'hidden',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_private_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  birth_date date,
  exact_location jsonb,
  sensitive_preferences jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  constraint adult_birth_date check (birth_date is null or birth_date <= (current_date - interval '18 years')::date)
);

create table public.profile_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  min_age int not null default 18 check (min_age >= 18 and min_age <= 120),
  max_age int not null default 99 check (max_age >= min_age and max_age <= 120),
  max_distance_km int check (max_distance_km between 1 and 1000),
  languages text[] not null default '{}',
  relationship_intentions text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  display_order smallint not null default 0 check (display_order between 0 and 9),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status public.interest_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(sender_id, recipient_id),
  check (sender_id <> recipient_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique(user_a, user_b)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(conversation_id,user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id,blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('fake_profile','harassment','scam','inappropriate_content','underage_concern','other')),
  details text check (char_length(details) <= 3000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_user_id)
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','canceled')),
  provider_reference text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text unique,
  plan_code text not null,
  status public.subscription_status not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'stripe',
  provider_payment_id text unique,
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'EUR',
  status text not null check (status in ('pending','succeeded','failed','refunded')),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid references public.profiles(id) on delete set null,
  report_id uuid references public.reports(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('moderator','admin','super_admin')),
  created_at timestamptz not null default now()
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  policy_version text not null,
  granted boolean not null,
  recorded_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

create index profiles_discovery_idx on public.profiles (visibility, onboarding_completed);
create index profiles_city_idx on public.profiles (region_code, city);
create index interests_recipient_status_idx on public.interests (recipient_id, status, created_at desc);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at desc);
create index reports_status_created_idx on public.reports (status, created_at desc);
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;

-- RLS is enabled on every user-facing table. Private/admin tables intentionally have no client write policies.
alter table public.profiles enable row level security;
alter table public.profile_private_details enable row level security;
alter table public.profile_preferences enable row level security;
alter table public.profile_photos enable row level security;
alter table public.interests enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.verification_requests enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.admin_roles enable row level security;
alter table public.consent_records enable row level security;

create policy "Profiles: owner can read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Profiles: visible adult profiles can be discovered" on public.profiles for select to authenticated using (
  visibility = 'visible' and onboarding_completed
  and not exists (select 1 from public.blocks b where (b.blocker_id = (select auth.uid()) and b.blocked_id = id) or (b.blocker_id = id and b.blocked_id = (select auth.uid())))
);
create policy "Profiles: owner can create" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "Profiles: owner can update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Private details: owner only" on public.profile_private_details for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Preferences: owner only" on public.profile_preferences for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Photos: owner can manage" on public.profile_photos for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Interests: participants can read" on public.interests for select to authenticated using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy "Interests: sender creates own" on public.interests for insert to authenticated with check (sender_id = (select auth.uid()) and not exists (select 1 from public.blocks b where (b.blocker_id = sender_id and b.blocked_id = recipient_id) or (b.blocker_id = recipient_id and b.blocked_id = sender_id)));
-- Interest status changes must be handled by a trusted server function to prevent forged acceptance/matches.

create policy "Matches: participants read" on public.matches for select to authenticated using (user_a = (select auth.uid()) or user_b = (select auth.uid()));
create policy "Conversations: members read" on public.conversations for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = (select auth.uid())));
create policy "Conversation members: own membership only" on public.conversation_members for select to authenticated using (user_id = (select auth.uid()));
create policy "Messages: conversation members read" on public.messages for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid())));
create policy "Messages: send as self in joined conversation" on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid())));

create policy "Blocks: owner manages own" on public.blocks for all to authenticated using (blocker_id = (select auth.uid())) with check (blocker_id = (select auth.uid()));
create policy "Reports: reporter can create and read own" on public.reports for select to authenticated using (reporter_id = (select auth.uid()));
create policy "Reports: reporter can submit" on public.reports for insert to authenticated with check (reporter_id = (select auth.uid()) and reported_user_id <> (select auth.uid()));
create policy "Verification: owner reads requests" on public.verification_requests for select to authenticated using (user_id = (select auth.uid()));
create policy "Subscriptions: owner reads own" on public.subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy "Payments: owner reads own" on public.payments for select to authenticated using (user_id = (select auth.uid()));
create policy "Notifications: owner manages own" on public.notifications for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Admin roles: user reads own role" on public.admin_roles for select to authenticated using (user_id = (select auth.uid()));
create policy "Consent: owner reads own" on public.consent_records for select to authenticated using (user_id = (select auth.uid()));
create policy "Consent: owner records own" on public.consent_records for insert to authenticated with check (user_id = (select auth.uid()));

-- Intentionally no client-side policies for payments writes, moderation writes, admin role writes,
-- match creation, or verification decisions. Implement those via trusted server-side functions after review.
