// src/components/chat/ChatMessage.tsx
import type { ChatMessage as ChatMessageType } from '../../lib/types';

type OptimisticChatMessage = ChatMessageType & {
  pending?: boolean;
};

export default function ChatMessage({
  message,
  isOwn,
  showAvatar,
}: {
  message: OptimisticChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
}) {
  const authorName = message.profiles?.full_name || 'Explorer';
  const authorPhoto = message.profiles?.photo_url;

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="h-8 w-8 shrink-0">
        {!isOwn && showAvatar && (
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
            {authorPhoto ? (
              <img
                src={authorPhoto}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              authorName[0]?.toUpperCase() || '?'
            )}
          </div>
        )}
      </div>

      <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
            isOwn
              ? 'bg-sky-500 text-white'
              : 'bg-sky-700 text-white'
          } ${message.pending ? 'opacity-60' : ''}`}
        >
          {message.content}
        </div>

        <div
          className={`mt-1 flex items-center gap-2 text-[10px] ${
            isOwn ? 'justify-end text-zinc-600' : 'text-zinc-500'
          }`}
        >
          {!isOwn && showAvatar && (
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-300">
              {authorName}
            </span>
          )}

          <span>
            {formatTime(message.created_at)}
            {message.pending ? ' · sending' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}