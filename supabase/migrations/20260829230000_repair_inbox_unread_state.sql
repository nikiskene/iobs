-- Align unread counting with the inbox message query. Older active messages
-- may have a null is_deleted value; archived participant threads stay hidden.

begin;

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

commit;
