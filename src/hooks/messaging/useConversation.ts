// src/hooks/messaging/useConversation.ts
import { useCallback, useEffect, useState } from 'react';
import {
  fetchMessages,
  markConversationRead,
  sendMessage,
} from '../../lib/messaging/messagingApi';
import type { Message } from '../../lib/messaging/messagingTypes';

export function useConversation(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await fetchMessages(conversationId);
      setMessages(data);
      await markConversationRead(conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  async function handleSendMessage(body: string) {
    if (!conversationId) return;

    try {
      setSending(true);
      setError(null);

      await sendMessage({ conversationId, body });
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    setMessages([]);
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage: handleSendMessage,
    reload: loadMessages,
  };
}