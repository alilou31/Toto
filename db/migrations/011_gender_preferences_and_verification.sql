-- NIKAHYA international discovery preferences and profile verification.
-- Apply after 010_password_reset_tokens.sql.
alter table public.profiles
  add column if not exists gender text check (gender in ('man','woman','other','prefer_not_to_say')),
  add column if not exists preferred_gender text not null default 'opposite' check (preferred_gender in ('opposite','women','men','all')),
  add column if not exists verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected')),
  add column if not exists verification_reviewed_at timestamptz;
create index if not exists profiles_gender_discovery_idx on public.profiles (visibility, gender, preferred_gender, verification_status, updated_at desc);
create table if not exists public.profile_verification_requests (
 id uuid primary key default gen_random_uuid(),
 user_id text not null references public.profiles(id) on delete cascade,
 evidence_bytes bytea not null,
 evidence_mime text not null check (evidence_mime in ('image/jpeg','image/png','image/webp','video/mp4','video/webm')),
 consent_at timestamptz not null default now(),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 submitted_at timestamptz not null default now(), reviewed_by text, reviewed_at timestamptz,
 review_note text check (review_note is null or char_length(review_note) <= 500)
);
create index if not exists profile_verification_pending_idx on public.profile_verification_requests (submitted_at asc) where status = 'pending';
create index if not exists profile_verification_user_idx on public.profile_verification_requests (user_id, submitted_at desc);
