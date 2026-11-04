-- Ephemeral audio/video lifecycle and view limits for chat attachments.
alter table public.messages
  add column if not exists attachment_max_views smallint,
  add column if not exists attachment_view_count integer not null default 0,
  add column if not exists attachment_expires_at timestamptz,
  add column if not exists attachment_deleted_at timestamptz;

alter table public.messages
  drop constraint if exists messages_attachment_consistency_check;
alter table public.messages
  add constraint messages_attachment_consistency_check
  check (
    (message_type = 'text' and attachment_key is null and attachment_mime_type is null and attachment_size is null)
    or
    (message_type = 'image' and attachment_mime_type is not null and attachment_size > 0)
    or
    (message_type in ('video', 'audio')
      and attachment_mime_type is not null and attachment_size > 0
      and attachment_max_views in (1, 2)
      and attachment_view_count >= 0
      and ((attachment_key is not null and attachment_deleted_at is null)
        or (attachment_key is null and attachment_deleted_at is not null)))
  );

create index if not exists messages_ephemeral_media_expiry_idx
  on public.messages (attachment_expires_at)
  where message_type in ('video', 'audio') and attachment_key is not null;

update public.messages
set attachment_max_views = 1,
    attachment_view_count = 0,
    attachment_expires_at = coalesce(attachment_expires_at, created_at + interval '7 days')
where message_type in ('video', 'audio') and attachment_key is not null;
