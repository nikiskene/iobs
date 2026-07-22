// src/components/messaging/InboxProvider.tsx
import { createContext, useContext, useMemo, useState } from 'react';
import { useConversations } from '../../hooks/messaging/useConversations';
import type { ConversationType } from '../../lib/messaging/messagingTypes';

type InboxFilter = 'all' | 'team' | 'community' | 'direct';

type InboxContextValue = ReturnType<typeof useConversations> & {
  activeFilter: InboxFilter;
  setInboxFilter: (filter: InboxFilter) => void;
  filteredConversations: ReturnType<typeof useConversations>['conversations'];
};

const InboxContext = createContext<InboxContextValue | null>(null);

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const conversationsState = useConversations();
  const [activeFilter, setActiveFilter] = useState<InboxFilter>('all');

  const filteredConversations = useMemo(
    () =>
      conversationsState.conversations.filter((conversation) =>
        matchesFilter(conversation.type, activeFilter)
      ),
    [conversationsState.conversations, activeFilter]
  );

  function setInboxFilter(filter: InboxFilter) {
    setActiveFilter(filter);

    const firstConversation = conversationsState.conversations.find(
      (conversation) => matchesFilter(conversation.type, filter)
    );

    conversationsState.setSelectedConversationId(firstConversation?.id || null);
  }

  const value: InboxContextValue = {
    ...conversationsState,
    activeFilter,
    setInboxFilter,
    filteredConversations,
  };

  return (
    <InboxContext.Provider value={value}>{children}</InboxContext.Provider>
  );
}

export function useInbox() {
  const context = useContext(InboxContext);

  if (!context) {
    throw new Error('useInbox must be used inside InboxProvider.');
  }

  return context;
}

function matchesFilter(type: ConversationType | null, filter: InboxFilter) {
  if (filter === 'all') return true;
  if (filter === 'team') return type === 'admin_dm' || type === 'system';
  if (filter === 'community') return type === 'group_chat';
  if (filter === 'direct') return type === 'member_dm';

  return true;
}