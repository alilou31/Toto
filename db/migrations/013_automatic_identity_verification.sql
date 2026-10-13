-- NIKAHYA: provider-backed automatic identity verification (Stripe Identity).
-- Apply after migrations 011 and 012.
CREATE TABLE IF NOT EXISTS public.profile_identity_verification_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'stripe_identity' CHECK (provider = 'stripe_identity'),
  provider_session_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'requires_input'
    CHECK (status IN ('requires_input', 'processing', 'verified', 'rejected', 'canceled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  failure_reason text
);

CREATE INDEX IF NOT EXISTS profile_identity_sessions_user_idx
  ON public.profile_identity_verification_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS profile_identity_sessions_status_idx
  ON public.profile_identity_verification_sessions (status, created_at DESC);
