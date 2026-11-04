-- Private media attachments for existing match conversations.
-- Apply once in Neon before enabling CHAT_MEDIA_BUCKET in Cloudflare.
alter table public.messages
  add column if not exists message_type text not null default 'text',
  add column if not exists attachment_key text,
  add column if not exists attachment_mime_type text,
  add column if not exists attachment_size bigint,
  add column if not exists attachment_name text;

alter table public.messages
  drop constraint if exists messages_message_type_check;
alter table public.messages
  add constraint messages_message_type_check
  check (message_type in ('text', 'image', 'video', 'audio'));

alter table public.messages
  drop constraint if exists messages_attachment_consistency_check;
alter table public.messages
  add constraint messages_attachment_consistency_check
  check (
    (message_type = 'text' and attachment_key is null and attachment_mime_type is null and attachment_size is null)
    or
    (message_type <> 'text' and attachment_key is not null and attachment_mime_type is not null and attachment_size > 0)
  );

create index if not exists messages_attachment_key_idx
  on public.messages (attachment_key)
  where attachment_key is not null;
