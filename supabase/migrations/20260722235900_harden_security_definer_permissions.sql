-- supabase/migrations/20260722235900_harden_security_definer_permissions.sql
-- SECURITY DEFINER functions inherit broad EXECUTE grants unless explicitly revoked.

revoke execute on function public.can_access_conversation(uuid, uuid) from anon;
revoke execute on function public.create_welcome_conversation_for_new_profile() from anon;
revoke execute on function public.get_or_create_community_chat() from anon;
revoke execute on function public.get_or_create_member_dm(uuid) from anon;
revoke execute on function public.get_unread_message_count() from anon;
revoke execute on function public.identity_is_admin() from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_admin(uuid) from anon;
revoke execute on function public.mark_conversation_read(uuid) from anon;
revoke execute on function public.route_welcome_reply(uuid, text, text) from anon;
revoke execute on function public.send_worldos_announcement(text) from anon;
revoke execute on function public.update_conversation_last_message() from anon;

-- Trigger functions are invoked by Postgres, never directly through the API.
revoke execute on function public.create_welcome_conversation_for_new_profile() from authenticated;
revoke execute on function public.update_conversation_last_message() from authenticated;

-- Preserve signed-in access only for RPCs and RLS helper functions used by the app.
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
