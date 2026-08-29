// src/lib/messaging/conversationApi.ts

import { supabase } from '../supabase';
import type { Conversation, ConversationParticipant, Message } from './messagingTypes';

export async function fetchConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, description, type, created_by, metadata, last_message_id, last_message_at, is_archived, is_pinned, created_at, updated_at')
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

  const conversations = (data || []) as Conversation[];
  if (conversations.length === 0) return conversations;

  const conversationIds = conversations.map((conversation) => conversation.id);
  const [participantsResult, messagesResult] = await Promise.all([
    supabase.from('conversation_participants').select('*').in('conversation_id', conversationIds),
    supabase.from('messages').select('id, conversation_id, body, sender_id, created_at').in('conversation_id', conversationIds).or('is_deleted.eq.false,is_deleted.is.null').order('created_at', { ascending: false }),
  ]);

  const participants = (participantsResult.data || []) as ConversationParticipant[];
  const profileIds = [...new Set(participants.map((participant) => participant.user_id).filter(Boolean))];
  const profilesResult = profileIds.length
    ? await supabase.from('profiles').select('id, full_name, photo_url, email').in('id', profileIds)
    : { data: [] };
  const profileMap = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
  const latestMessageMap = new Map<string, Partial<Message>>();
  for (const message of messagesResult.data || []) {
    if (!latestMessageMap.has(message.conversation_id)) latestMessageMap.set(message.conversation_id, message);
  }

  return conversations.map((conversation) => ({
    ...conversation,
    conversation_participants: participants
      .filter((participant) => participant.conversation_id === conversation.id)
      .map((participant) => ({ ...participant, profiles: profileMap.get(participant.user_id) })),
    messages: latestMessageMap.has(conversation.id) ? [latestMessageMap.get(conversation.id) as Message] : [],
  }));
}

export async function markConversationRead(conversationId: string) {
  const { error } = await supabase.rpc('mark_conversation_read', {
    conversation_uuid: conversationId,
  });

  if (error) throw error;

  window.dispatchEvent(new Event('inbox-read-state-changed'));
}

export async function getUnreadMessageCount() {
  const { data, error } = await supabase.rpc('get_unread_message_count');

  if (error) throw error;

  return data || 0;
}
