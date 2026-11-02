-- Apply after 014. Billing remains disabled until a verified payment provider is connected.
create table if not exists public.premium_entitlements (
 user_id text primary key references public.profiles(id) on delete cascade,
 active_until timestamptz not null,
 source text not null default 'manual' check (source in ('manual','billing')),
 updated_at timestamptz not null default now()
);
create table if not exists public.outing_invitations (
 id uuid primary key default gen_random_uuid(),
 sender_id text not null references public.profiles(id) on delete cascade,
 recipient_id text not null references public.profiles(id) on delete cascade,
 kind text not null check (kind in ('restaurant','cinema','promenade','voyage','cafe')),
 proposed_at timestamptz not null,
 city text not null check (char_length(city) between 2 and 100),
 note text check (char_length(note)<=240),
 status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint distinct_participants check (sender_id<>recipient_id)
);
create index if not exists outing_invitations_recipient_idx on public.outing_invitations(recipient_id,status,created_at desc);
create index if not exists outing_invitations_sender_idx on public.outing_invitations(sender_id,created_at desc);
