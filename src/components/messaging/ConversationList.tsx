// src/components/messaging/ConversationList.tsx
import { useState } from 'react';
import { MessageCircle, MessageSquarePlus, Shield, Users } from 'lucide-react';

import { useInbox } from './InboxProvider';
import ConversationListItem from './ConversationListItem';
import NewMessageModal from './NewMessageModal';

type ConversationListProps = {
  variant?: 'desktop' | 'mobile';
};

export default function ConversationList({
  variant = 'desktop',
}: ConversationListProps) {
  const {
    filteredConversations,
    selectedConversationId,
    setSelectedConversationId,
    activeFilter,
    setInboxFilter,
    loading,
    error,
  } = useInbox();

  const [newMessageOpen, setNewMessageOpen] = useState(false);

  if (loading) {
    return (
      <aside className="bg-white/[0.02] p-4 md:border-r md:border-white/10">
        <p className="text-sm text-zinc-500">Loading messages...</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="bg-white/[0.02] p-4 md:border-r md:border-white/10">
        <p className="text-sm text-red-400">{error}</p>
      </aside>
    );
  }

  return (
    <>
      <aside className="flex flex-col overflow-hidden bg-white/[0.02] md:border-r md:border-white/10">
        {variant === 'desktop' && (
          <>
            <div className="border-b border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                Communication
              </p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-white">Messages</h1>

                <button
                  type="button"
                  onClick={() => setNewMessageOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-400"
                  aria-label="New message"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-b border-white/10 p-4">
              <div className="space-y-2">
                <FilterButton
                  label="WorldOS Team"
                  description="Announcements & support"
                  icon={Shield}
                  active={activeFilter === 'team'}
                  onClick={() => setInboxFilter('team')}
                />

                <FilterButton
                  label="Community"
                  description="Public discussion"
                  icon={Users}
                  active={activeFilter === 'community'}
                  onClick={() => setInboxFilter('community')}
                />

                <FilterButton
                  label="Direct Messages"
                  description="Private conversations"
                  icon={MessageCircle}
                  active={activeFilter === 'direct'}
                  onClick={() => setInboxFilter('direct')}
                />
              </div>
            </div>
          </>
        )}

        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={() => setInboxFilter('all')}
            className={`text-[11px] uppercase tracking-[0.25em] transition ${
              activeFilter === 'all'
                ? 'text-sky-300'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Recent Conversations
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500">
              No conversations in this section yet.
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === selectedConversationId}
                onClick={() => setSelectedConversationId(conversation.id)}
              />
            ))
          )}
        </div>
      </aside>

      <NewMessageModal
        open={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
      />
    </>
  );
}

type FilterButtonProps = {
  label: string;
  description: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
};

function FilterButton({
  label,
  description,
  icon: Icon,
  active,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
        active
          ? 'border-sky-500/30 bg-sky-500/10'
          : 'border-white/5 hover:bg-white/5'
      }`}
    >
      <Icon
        className={`h-5 w-5 ${active ? 'text-sky-400' : 'text-zinc-400'}`}
      />

      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-zinc-500">{description}</div>
      </div>
    </button>
  );
}