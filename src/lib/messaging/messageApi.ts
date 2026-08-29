// src/lib/messaging/messageApi.ts
import { supabase } from '../supabase';
import type { Message, SendMessageInput } from './messagingTypes';

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .or('is_deleted.eq.false,is_deleted.is.null')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []) as Message[];
}

export async function sendMessage({ conversationId, body }: SendMessageInput) {
  const cleanBody = body.trim();

  if (!cleanBody) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_type: 'user',
      body: cleanBody,
    })
    .select('*')
    .single();

  if (error) throw error;

  return data as Message;
}
