-- Optional anonymous daily counts. Apply before manually enabling metrics.
-- No user identifier, IP address, URL, cookie or individual event is stored.
create table if not exists public.affiliate_click_metrics (
  day date not null,
  idea_id text not null check (idea_id in ('cafe', 'dinner', 'culture', 'activity', 'walk', 'getaway')),
  clicks bigint not null default 1 check (clicks > 0),
  primary key (day, idea_id)
);
