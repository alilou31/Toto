-- NIKAHYA game results. Apply after 002_authentication.sql in Neon.
create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.auth_users(id) on delete cascade,
  game_id text not null check (game_id in ('mots-croises','enigme','calcul','personnalite','duel','tournoi')),
  score integer not null check (score between 0 and 1000),
  correct_answers integer not null check (correct_answers >= 0),
  total_questions integer not null check (total_questions between 1 and 50),
  duration_seconds integer not null check (duration_seconds between 0 and 86400),
  completed_at timestamptz not null default now()
);
create index if not exists game_results_user_completed_idx on public.game_results (user_id, completed_at desc);
create index if not exists game_results_game_score_idx on public.game_results (game_id, score desc, completed_at desc);
