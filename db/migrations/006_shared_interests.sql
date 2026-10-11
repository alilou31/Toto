-- NIKAHYA — Migration 006 : profils et centres d'intérêt
-- Religion and ethnicity are optional sensitive data: public display requires explicit consent.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hobbies text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_games text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS ethnicity text,
  ADD COLUMN IF NOT EXISTS show_sensitive_identity boolean NOT NULL DEFAULT false;

-- Idempotent constraints: safe if this migration is re-run.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_hobbies_limit') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_hobbies_limit CHECK (cardinality(hobbies) <= 20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_games_limit') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_games_limit CHECK (cardinality(favorite_games) <= 20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_interests_limit') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_interests_limit CHECK (cardinality(interests) <= 30);
  END IF;
END $$;

-- Verify the expected columns after execution.
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN (
    'hobbies', 'favorite_games', 'interests', 'occupation',
    'religion', 'ethnicity', 'show_sensitive_identity'
  )
ORDER BY column_name;
