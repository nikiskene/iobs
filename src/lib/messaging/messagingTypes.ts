// src/lib/messaging/messagingTypes.ts
import type { Profile } from '../types';

export type ConversationType =
  | 'system'
  | 'admin_dm'
  | 'member_dm'
  | 'group_chat';

export type MessageSenderType = 'user' | 'system' | 'admin' | 'ai';

export type Conversation = {
  id: string;
  title: string | null;
  description: string | null;
  type: ConversationType | null;
  created_by: string | null;
  metadata: Record<string, unknown>;
  last_message_id: string | null;
  last_message_at: string | null;
  is_archived: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  conversation_participants?: ConversationParticipant[];
  messages?: Message[];
};

export type ConversationParticipant = {
  id: string;
  conversation_id: string;
  user_id: string;
  name: string | null;
  role: string;
  last_read_at: string | null;
  last_read_message_id: string | null;
  archived: boolean;
  pinned: boolean;
  muted: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  profiles?: Pick<
    Profile,
    'id' | 'full_name' | 'photo_url' | 'email'
  >;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: MessageSenderType;
  body: string | null;
  attachments: unknown[];
  reactions: Record<string, unknown>;
  metadata: Record<string, unknown>;
  reply_to_message_id: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'photo_url' | 'email'>;
};

export type ConversationWithPreview = Conversation & {
  unread_count?: number;
};

export type SendMessageInput = {
  conversationId: string;
  body: string;
};