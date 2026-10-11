-- Optional compatibility fields to help members connect around shared interests.
-- Religion and ethnicity are optional sensitive data: public display requires explicit consent.
alter table public.profiles
  add column if not exists hobbies text[] not null default '{}',
  add column if not exists favorite_games text[] not null default '{}',
  add column if not exists interests text[] not null default '{}',
  add column if not exists occupation text,
  add column if not exists religion text,
  add column if not exists ethnicity text,
  add column if not exists show_sensitive_identity boolean not null default false;

alter table public.profiles
  add constraint profiles_hobbies_limit check (cardinality(hobbies) <= 20),
  add constraint profiles_games_limit check (cardinality(favorite_games) <= 20),
  add constraint profiles_interests_limit check (cardinality(interests) <= 30);
