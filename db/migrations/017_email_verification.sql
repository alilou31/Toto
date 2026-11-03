-- NAKAHYA: pending email/password registrations; verify before creating a user.
-- Apply to Neon AFTER migration 016 and BEFORE enabling EMAIL_VERIFICATION_ENABLED.
-- Existing auth_users, OAuth members and sessions are not modified.
-- No login session or public member profile exists for an unconfirmed registration.

create table if not exists public.pending_email_registrations (
  email_normalized text primary key,
  email text not null,
  password_hash text not null,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  age_confirmed_at timestamptz not null,
  terms_accepted_at timestamptz not null,
  privacy_acknowledged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pending_email_registrations_expiry_idx
  on public.pending_email_registrations (expires_at);

-- Operational retention: remove expired rows regularly (registration requests
-- also delete expired records). SQL to run in Neon SQL Editor periodically:
-- delete from public.pending_email_registrations where expires_at < now();
