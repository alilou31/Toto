-- Synchronized two-player game sessions.
-- Apply this migration in Neon after 004_games.sql.
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique check (invite_code ~ '^[A-Z0-9]{8}$'),
  game_id text not null check (game_id in ('mots-croises','enigme','calcul','personnalite','duel','tournoi')),
  host_user_id text not null references public.auth_users(id) on delete cascade,
  guest_user_id text references public.auth_users(id) on delete set null,
  status text not null default 'waiting' check (status in ('waiting','active','completed','cancelled')),
  current_question integer not null default 0 check (current_question between 0 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (guest_user_id is null or guest_user_id <> host_user_id)
);
create index if not exists game_sessions_host_created_idx on public.game_sessions(host_user_id, created_at desc);
create index if not exists game_sessions_guest_created_idx on public.game_sessions(guest_user_id, created_at desc);
create index if not exists game_sessions_status_created_idx on public.game_sessions(status, created_at desc);

create table if not exists public.game_session_answers (
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  user_id text not null references public.auth_users(id) on delete cascade,
  question_index integer not null check (question_index between 0 and 3),
  answer_index integer not null check (answer_index between 0 and 3),
  answered_at timestamptz not null default now(),
  primary key (session_id, user_id, question_index)
);
create index if not exists game_session_answers_session_question_idx on public.game_session_answers(session_id, question_index);
