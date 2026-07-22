// src/components/chat/ChatMessageGroup.tsx
import type { ChatMessage as ChatMessageType } from '../../lib/types';
import ChatDateDivider from './ChatDateDivider';
import ChatMessage from './ChatMessage';

type OptimisticChatMessage = ChatMessageType & {
  pending?: boolean;
};

export default function ChatMessageGroup({
  messages,
  currentUserId,
}: {
  messages: OptimisticChatMessage[];
  currentUserId?: string;
}) {
  return (
    <>
      {messages.map((message, index) => {
        const previous = messages[index - 1];

        const startsNewDay =
          !previous ||
          new Date(previous.created_at).toDateString() !==
            new Date(message.created_at).toDateString();

        const previousSameAuthor =
          previous &&
          previous.author_id === message.author_id &&
          !startsNewDay;

        return (
          <div key={message.id}>
            {startsNewDay && <ChatDateDivider timestamp={message.created_at} />}

            <ChatMessage
              message={message}
              isOwn={message.author_id === currentUserId}
              showAvatar={!previousSameAuthor}
            />
          </div>
        );
      })}
    </>
  );
}