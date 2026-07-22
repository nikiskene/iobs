// src/lib/messaging/conversationHelpers.ts

import type {
  Conversation,
  ConversationParticipant,
} from './messagingTypes';

function otherParticipant(
  conversation: Conversation,
  currentUserId: string
): ConversationParticipant | undefined {
  return conversation.conversation_participants?.find(
    (participant) => participant.user_id !== currentUserId
  );
}

export function getConversationTitle(
  conversation: Conversation,
  currentUserId: string
) {
  switch (conversation.type) {
    case 'member_dm': {
      const other = otherParticipant(conversation, currentUserId);

      return (
        other?.profiles?.full_name ||
        other?.name ||
        'Unknown member'
      );
    }

    case 'admin_dm':
      return 'WorldOS Team';

    case 'group_chat':
      return 'Community';

    case 'system':
      return 'System';

    default:
      return conversation.title || 'Conversation';
  }
}

export function getConversationAvatar(
  conversation: Conversation,
  currentUserId: string
) {
  if (conversation.type !== 'member_dm') {
    return null;
  }

  return (
    otherParticipant(conversation, currentUserId)?.profiles?.photo_url ??
    null
  );
}