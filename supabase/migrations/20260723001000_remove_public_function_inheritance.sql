-- supabase/migrations/20260723001000_remove_public_function_inheritance.sql
-- anon inherits EXECUTE granted to PUBLIC, so the broad role must be revoked too.

revoke execute on function public.can_access_conversation(uuid, uuid) from public;
revoke execute on function public.create_welcome_conversation_for_new_profile() from public;
revoke execute on function public.get_or_create_community_chat() from public;
revoke execute on function public.get_or_create_member_dm(uuid) from public;
revoke execute on function public.get_unread_message_count() from public;
revoke execute on function public.identity_is_admin() from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin(uuid) from public;
revoke execute on function public.mark_conversation_read(uuid) from public;
revoke execute on function public.route_welcome_reply(uuid, text, text) from public;
revoke execute on function public.send_worldos_announcement(text) from public;
revoke execute on function public.update_conversation_last_message() from public;

grant execute on function public.can_access_conversation(uuid, uuid) to authenticated;
grant execute on function public.get_or_create_community_chat() to authenticated;
grant execute on function public.get_or_create_member_dm(uuid) to authenticated;
grant execute on function public.get_unread_message_count() to authenticated;
grant execute on function public.identity_is_admin() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.route_welcome_reply(uuid, text, text) to authenticated;
grant execute on function public.send_worldos_announcement(text) to authenticated;
