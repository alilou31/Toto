-- Extend existing manually managed premium entitlements to distinguish Premium and Élite.
-- Existing active rows remain Premium; billing remains disabled until a verified provider is connected.
alter table public.premium_entitlements
  add column if not exists plan_code text not null default 'premium'
  check (plan_code in ('premium', 'elite'));

create index if not exists premium_entitlements_active_plan_idx
  on public.premium_entitlements (plan_code, active_until);
