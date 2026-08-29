-- Keep auth signup atomic by supplying the required conversation slug when a
-- new profile receives its personal welcome conversation.

begin;

create or replace function public.create_welcome_conversation_for_new_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  welcome_conversation_id uuid;
begin
  select c.id
  into welcome_conversation_id
  from public.conversations c
  where c.type = 'system'
    and c.metadata->>'system_key' = 'welcome'
    and c.metadata->>'user_id' = new.id::text
  limit 1;

  if welcome_conversation_id is not null then
    return new;
  end if;

  insert into public.conversations (
    slug,
    type,
    conversation_type,
    title,
    description,
    created_by,
    metadata,
    is_active,
    status
  ) values (
    'welcome-' || replace(new.id::text, '-', ''),
    'system',
    'system',
    'Welcome to WorldOS',
    'Personal onboarding inbox conversation',
    null,
    jsonb_build_object('system_key', 'welcome', 'user_id', new.id),
    true,
    'active'
  )
  returning id into welcome_conversation_id;

  insert into public.conversation_participants (
    conversation_id,
    user_id,
    role,
    metadata
  ) values (
    welcome_conversation_id,
    new.id,
    'member',
    jsonb_build_object('reply_routed', false)
  );

  insert into public.messages (
    conversation_id,
    sender_id,
    sender_type,
    body,
    metadata
  ) values (
    welcome_conversation_id,
    null,
    'system',
    E'Welcome to WorldOS.\n\nThis is your personal inbox.\n\nIf you reply to this message, we’ll ask whether you want to contact the WorldOS team or introduce yourself to the community.',
    jsonb_build_object('kind', 'welcome_message', 'requires_reply_routing', true)
  );

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );

  return new;
end;
$$;

commit;
