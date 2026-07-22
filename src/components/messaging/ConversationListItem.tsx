// src/components/messaging/ConversationListItem.tsx

import { MessageCircle, Shield, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  getConversationAvatar,
  getConversationTitle,
} from '../../lib/messaging/conversationHelpers';
import type { Conversation } from '../../lib/messaging/messagingTypes';

type ConversationListItemProps = {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
};

export default function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: ConversationListItemProps) {
  const { user } = useAuth();

  const latestMessage = conversation.messages?.[0];

  const title = getConversationTitle(
    conversation,
    user?.id ?? ''
  );

  const preview =
    latestMessage?.body ||
    conversation.description ||
    'No messages yet.';

  const avatar = getConversationAvatar(
    conversation,
    user?.id ?? ''
  );

  const Icon = getConversationIcon(conversation.type);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border-b border-white/5 px-4 py-4 text-left transition ${
        isActive ? 'bg-white/10' : 'hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/5 text-zinc-300">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-sm font-medium text-white">
              {title}
            </h2>

            {conversation.last_message_at && (
              <span className="shrink-0 text-[11px] text-zinc-600">
                {formatConversationTime(
                  conversation.last_message_at
                )}
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
            {preview}
          </p>
        </div>
      </div>
    </button>
  );
}

function getConversationIcon(type: Conversation['type']) {
  if (type === 'admin_dm' || type === 'system') return Shield;
  if (type === 'group_chat') return Users;

  return MessageCircle;
}

function formatConversationTime(value: string) {
  const date = new Date(value);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString();
}