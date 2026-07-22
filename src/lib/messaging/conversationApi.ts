// src/lib/messaging/conversationApi.ts

import { supabase } from '../supabase';
import type { Conversation } from './messagingTypes';

export async function fetchConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      title,
      description,
      type,
      created_by,
      metadata,
      last_message_id,
      last_message_at,
      is_archived,
      is_pinned,
      created_at,
      updated_at,
      conversation_participants(
        *,
        profiles:profiles!conversation_participants_profile_id_fkey(
          id,
          full_name,
          photo_url,
          email
        )
      ),
      messages!messages_conversation_id_fkey(
        id,
        body,
        sender_id,
        created_at
      )
    `)
    .not('type', 'is', null)
    .order('last_message_at', {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
    console.error('Code:', error.code);
    throw error;
  }

  return (data || []) as Conversation[];
}

export async function markConversationRead(conversationId: string) {
  const { error } = await supabase.rpc('mark_conversation_read', {
    conversation_uuid: conversationId,
  });

  if (error) throw error;
}

export async function getUnreadMessageCount() {
  const { data, error } = await supabase.rpc('get_unread_message_count');

  if (error) throw error;

  return data || 0;
}