-- Keep the legacy profile_id relation and the messaging user_id relation in
-- sync so PostgREST profile embeds and messaging access resolve the same user.

begin;

update public.conversation_participants
set profile_id = user_id
where profile_id is null
  and user_id is not null;

update public.conversation_participants
set user_id = profile_id
where user_id is null
  and profile_id is not null;

create or replace function public.sync_conversation_participant_identity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.user_id := coalesce(new.user_id, new.profile_id);
  new.profile_id := coalesce(new.profile_id, new.user_id);

  if new.user_id is distinct from new.profile_id then
    raise exception 'Conversation participant identity columns must match.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.sync_conversation_participant_identity()
  from public, anon, authenticated;

drop trigger if exists sync_conversation_participant_identity
  on public.conversation_participants;
create trigger sync_conversation_participant_identity
before insert or update of user_id, profile_id
on public.conversation_participants
for each row execute function public.sync_conversation_participant_identity();

create or replace function public.get_unread_message_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.messages m
  join public.conversation_participants cp
    on cp.conversation_id = m.conversation_id
  where cp.user_id = (select auth.uid())
    and not coalesce(cp.archived, false)
    and not coalesce(m.is_deleted, false)
    and m.sender_id is distinct from (select auth.uid())
    and (cp.last_read_at is null or m.created_at > cp.last_read_at);
$$;

revoke all on function public.get_unread_message_count() from public, anon;
grant execute on function public.get_unread_message_count() to authenticated;

comment on function public.sync_conversation_participant_identity() is
  'Keeps legacy public-conversation profile_id and inbox user_id aligned.';

commit;
