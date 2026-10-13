-- NIKAHYA: required registration consent audit and double-opt-in newsletter.
-- Apply after migration 011.
ALTER TABLE public.auth_users
  ADD COLUMN IF NOT EXISTS age_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_acknowledged_at timestamptz;

ALTER TABLE public.oauth_identities
  ADD COLUMN IF NOT EXISTS privacy_acknowledged_at timestamptz;

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_normalized text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending_confirmation'
    CHECK (status IN ('pending_confirmation', 'confirmed', 'unsubscribed')),
  consent_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  confirmation_token_hash text,
  confirmation_expires_at timestamptz,
  source text NOT NULL DEFAULT 'landing_page'
    CHECK (source IN ('landing_page', 'registration')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_pending_expiry_idx
  ON public.newsletter_subscriptions (confirmation_expires_at)
  WHERE status = 'pending_confirmation';

CREATE INDEX IF NOT EXISTS newsletter_status_created_idx
  ON public.newsletter_subscriptions (status, created_at DESC);
