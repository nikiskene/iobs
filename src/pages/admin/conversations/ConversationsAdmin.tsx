// src/pages/admin/conversations/ConversationsAdmin.tsx
import { useEffect, useState } from 'react';
import {
  Megaphone,
  MessageCircle,
  RefreshCw,
  Send,
  Shield,
  Users,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

type AdminConversation = {
  id: string;
  title: string;
  slug: string;
  type: 'system' | 'admin_dm' | 'member_dm' | 'group_chat' | null;
  conversation_type: string;
  status: string;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
  conversation_participants?: { id: string }[];
  messages?: { id: string; body: string | null; created_at: string }[];
};

export default function ConversationsAdmin() {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function fetchConversations() {
    setLoading(true);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        slug,
        type,
        conversation_type,
        status,
        is_active,
        last_message_at,
        created_at,
        metadata,
        conversation_participants(id),
        messages!messages_conversation_id_fkey(
          id,
          body,
          created_at
        )
      `)
      .not('type', 'is', null)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (!error) {
      setConversations((data as AdminConversation[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchConversations();
  }, []);

  async function sendAnnouncement() {
    const clean = announcement.trim();
    if (!clean || sending) return;

    setSending(true);
    setError('');

    const { error } = await supabase.rpc('send_worldos_announcement', {
      body: clean,
    });

    if (error) {
      setError(error.message);
      setSending(false);
      return;
    }

    setAnnouncement('');
    await fetchConversations();
    setSending(false);
  }

  const community = conversations.filter((item) => item.type === 'group_chat');
  const worldos = conversations.filter(
    (item) => item.type === 'admin_dm' || item.type === 'system'
  );
  const direct = conversations.filter((item) => item.type === 'member_dm');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messaging</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Send announcements and monitor platform conversations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConversations}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="rounded-2xl border border-sky-400/20 bg-sky-500/[0.06] p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
            <Megaphone className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-white">New Announcement</h2>
            <p className="text-xs text-zinc-400">
              Sends a WorldOS Team message to all active members.
            </p>
          </div>
        </div>

        <textarea
          value={announcement}
          onChange={(event) => setAnnouncement(event.target.value)}
          rows={5}
          placeholder="Write an announcement..."
          className="mt-5 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-sky-400/60"
        />

        {error && (
          <p className="mt-3 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={sendAnnouncement}
            disabled={sending || !announcement.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Announcement'}
          </button>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading conversations...</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <ConversationGroup
            title="WorldOS Team"
            description="Announcements and support."
            icon={Shield}
            conversations={worldos}
          />

          <ConversationGroup
            title="Community"
            description="Shared public conversation."
            icon={Users}
            conversations={community}
          />

          <ConversationGroup
            title="Direct Messages"
            description="Member-to-member conversations."
            icon={MessageCircle}
            conversations={direct}
          />
        </div>
      )}
    </div>
  );
}

function ConversationGroup({
  title,
  description,
  icon: Icon,
  conversations,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  conversations: AdminConversation[];
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sky-300">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="text-xs text-zinc-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">No conversations yet.</p>
        ) : (
          conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ConversationCard({
  conversation,
}: {
  conversation: AdminConversation;
}) {
  const latestMessage = conversation.messages?.[0];

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-white">
            {conversation.title}
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            {conversation.conversation_participants?.length || 0} participants
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-zinc-400">
          {conversation.status}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-zinc-500">
        {latestMessage?.body || 'No messages yet.'}
      </p>

      {conversation.last_message_at && (
        <p className="mt-2 text-[11px] text-zinc-600">
          {new Date(conversation.last_message_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}