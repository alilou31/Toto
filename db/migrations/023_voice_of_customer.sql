-- Voice of Customer: first-party feedback and curated market insights.
-- Apply manually in Neon before enabling the feature in production.

create table if not exists public.product_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.auth_users(id) on delete set null,
  category text not null check (category in ('experience', 'discovery', 'games', 'trust_safety', 'pricing', 'other')),
  rating smallint check (rating between 1 and 5),
  message text not null check (char_length(message) between 10 and 2000),
  source text not null default 'website' check (source = 'website'),
  created_at timestamptz not null default now()
);

create index if not exists product_feedback_created_at_idx
  on public.product_feedback (created_at desc);
create index if not exists product_feedback_category_created_idx
  on public.product_feedback (category, created_at desc);

create table if not exists public.market_insights (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('reddit', 'other')),
  subreddit text,
  external_url text not null check (char_length(external_url) <= 2048),
  theme text not null check (char_length(theme) between 2 and 80),
  sentiment text not null check (sentiment in ('pain_point', 'request', 'positive', 'objection', 'opportunity')),
  summary text not null check (char_length(summary) between 10 and 1500),
  created_by text references public.auth_users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint market_insights_external_url_http check (external_url ~ '^https?://')
);

create index if not exists market_insights_created_at_idx
  on public.market_insights (created_at desc);
create index if not exists market_insights_theme_created_idx
  on public.market_insights (theme, created_at desc);

-- No public table grants are added. All access goes through server-side routes.
