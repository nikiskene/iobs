// src/components/messaging/MessageThread.tsx
import { useEffect, useRef } from 'react';
import { useConversation } from '../../hooks/messaging/useConversation';
import ConversationComposer from './ConversationComposer';
import EmptyConversationState from './EmptyConversationState';
import MessageBubble from './MessageBubble';
import MessageDateDivider from './MessageDateDivider';
import { useInbox } from './InboxProvider';

export default function MessageThread() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { conversations, selectedConversationId, reload } = useInbox();

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const { messages, loading, sending, error, sendMessage } =
    useConversation(selectedConversationId);

  useEffect(() => {
    if (!selectedConversationId) return;
    reload();
  }, [selectedConversationId, reload]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!selectedConversationId || !selectedConversation) {
    return <EmptyConversationState />;
  }

  async function handleSendMessage(body: string) {
    await sendMessage(body);
    await reload();
  }

  return (
    <section className="flex min-w-0 flex-col bg-[#070707]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-600">
          {getConversationTypeLabel(selectedConversation.type)}
        </p>

        <h2 className="mt-1 text-base font-medium text-white">
          {selectedConversation.title || 'Conversation'}
        </h2>

        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-500">No messages yet.</p>
        ) : (
          messages.map((message, index) => {
            const previousMessage = messages[index - 1];
            const showDivider =
              !previousMessage ||
              !sameDay(previousMessage.created_at, message.created_at);

            return (
              <div key={message.id}>
                {showDivider && <MessageDateDivider date={message.created_at} />}
                <MessageBubble message={message} />
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <ConversationComposer onSend={handleSendMessage} sending={sending} />
    </section>
  );
}

function sameDay(first: string, second: string) {
  return new Date(first).toDateString() === new Date(second).toDateString();
}

function getConversationTypeLabel(type: string | null) {
  if (type === 'system') return 'WorldOS';
  if (type === 'admin_dm') return 'WorldOS Team';
  if (type === 'group_chat') return 'Community';
  if (type === 'member_dm') return 'Direct Message';

  return 'Conversation';
}