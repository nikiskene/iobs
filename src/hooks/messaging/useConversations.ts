// src/hooks/messaging/useConversations.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchConversations } from '../../lib/messaging/messagingApi';
import type { Conversation } from '../../lib/messaging/messagingTypes';

export function useConversations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationFromUrl = searchParams.get('conversation');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(conversationFromUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialized = useRef(false);

  const selectConversation = useCallback(
    (conversationId: string | null) => {
      setSelectedConversationId(conversationId);

      const params = new URLSearchParams(searchParams);

      if (conversationId) {
        params.set('conversation', conversationId);
      } else {
        params.delete('conversation');
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const loadConversations = useCallback(async () => {
    try {
      setError(null);

      const data = await fetchConversations();
      setConversations(data);

      if (!initialized.current) {
        initialized.current = true;

        if (conversationFromUrl) {
          setSelectedConversationId(conversationFromUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox.');
    } finally {
      setLoading(false);
    }
  }, [conversationFromUrl]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    selectedConversationId,
    setSelectedConversationId: selectConversation,
    loading,
    error,
    reload: loadConversations,
  };
}