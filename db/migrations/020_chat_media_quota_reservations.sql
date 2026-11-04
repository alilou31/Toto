-- Atomic quota reservations for concurrent chat-media uploads.
-- A single guard row serializes reservations across all app instances.
create table if not exists public.chat_media_quota_guard (
  id smallint primary key check (id = 1)
);
insert into public.chat_media_quota_guard (id) values (1) on conflict (id) do nothing;

create table if not exists public.chat_media_quota_reservations (
  id uuid primary key,
  sender_id uuid not null,
  conversation_id uuid not null,
  bytes bigint not null check (bytes > 0),
  expires_at timestamptz not null default (now() + interval '15 minutes')
);
create index if not exists chat_media_quota_reservations_expiry_idx
  on public.chat_media_quota_reservations (expires_at);

create or replace function public.reserve_chat_media_quota(
  p_id uuid, p_sender_id uuid, p_conversation_id uuid, p_bytes bigint
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_global bigint;
  v_user bigint;
  v_conversation bigint;
begin
  if p_bytes <= 0 or p_bytes > 26214400 then
    return false;
  end if;

  perform 1 from public.chat_media_quota_guard where id = 1 for update;

  delete from public.chat_media_quota_reservations where expires_at <= now();

  select coalesce(sum(attachment_size), 0) + coalesce((
    select sum(bytes) from public.chat_media_quota_reservations where expires_at > now()
  ), 0)
  into v_global
  from public.messages where attachment_key is not null;

  select coalesce(sum(attachment_size), 0) + coalesce((
    select sum(bytes) from public.chat_media_quota_reservations
    where sender_id = p_sender_id and expires_at > now()
  ), 0)
  into v_user
  from public.messages where attachment_key is not null and sender_id = p_sender_id;

  select coalesce(sum(attachment_size), 0) + coalesce((
    select sum(bytes) from public.chat_media_quota_reservations
    where conversation_id = p_conversation_id and expires_at > now()
  ), 0)
  into v_conversation
  from public.messages where attachment_key is not null and conversation_id = p_conversation_id;

  if v_global + p_bytes > 8589934592
    or v_user + p_bytes > 104857600
    or v_conversation + p_bytes > 262144000 then
    return false;
  end if;

  insert into public.chat_media_quota_reservations (id, sender_id, conversation_id, bytes)
  values (p_id, p_sender_id, p_conversation_id, p_bytes);
  return true;
end;
$$;

revoke all on function public.reserve_chat_media_quota(uuid, uuid, uuid, bigint) from public;
