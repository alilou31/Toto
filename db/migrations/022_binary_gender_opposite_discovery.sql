-- Enforce the two supported discovery genders without assigning a gender to existing members.
-- Existing values outside the new product choices are cleared so each member must choose explicitly.
alter table public.profiles
  drop constraint if exists profiles_gender_check;

update public.profiles
set gender = null
where gender is not null and gender not in ('man', 'woman');

alter table public.profiles
  add constraint profiles_gender_binary_check
  check (gender in ('man', 'woman')) not valid;

create index if not exists profiles_opposite_gender_discovery_idx
  on public.profiles (visibility, gender, updated_at desc)
  where onboarding_completed = true;
