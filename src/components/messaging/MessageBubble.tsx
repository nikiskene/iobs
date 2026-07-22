// src/components/messaging/MessageBubble.tsx
import { useAuth } from '../../hooks/useAuth';
import type { Message } from '../../lib/messaging/messagingTypes';

export default function MessageBubble({ message }: { message: Message }) {
  const { user } = useAuth();
  const isOwnMessage = message.sender_id === user?.id;
  const senderName = getSenderName(message, isOwnMessage);

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-3 ${
          isOwnMessage
            ? 'bg-sky-500 text-white'
            : 'bg-white/[0.06] text-zinc-200'
        }`}
      >
        {!isOwnMessage && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            {senderName}
          </p>
        )}

        <p className="whitespace-pre-line text-sm leading-6">
          {message.body}
        </p>

        <p
          className={`mt-2 text-[11px] ${
            isOwnMessage ? 'text-sky-100/70' : 'text-zinc-600'
          }`}
        >
          {formatMessageTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

function getSenderName(message: Message, isOwnMessage: boolean) {
  if (isOwnMessage) return 'You';
  if (message.sender_type === 'system') return 'WorldOS';
  if (message.sender_type === 'admin') return 'WorldOS Team';
  if (message.sender_type === 'ai') return 'WorldOS AI';

  return message.profiles?.full_name || message.profiles?.email || 'Explorer';
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}