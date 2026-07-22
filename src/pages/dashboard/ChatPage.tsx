// src/pages/dashboard/ChatPage.tsx
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { ChatMessage } from '../../lib/types';
import ChatComposer from '../../components/chat/ChatComposer';
import ChatMessageGroup from '../../components/chat/ChatMessageGroup';

type OptimisticChatMessage = ChatMessage & {
  pending?: boolean;
};

export default function ChatPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<OptimisticChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*, profiles(id, full_name, photo_url)')
        .order('created_at', { ascending: true })
        .limit(200);

      if (data) setMessages(data as ChatMessage[]);
      scrollToBottom();
    };

    fetchMessages();

    const channel = supabase
      .channel('global-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const inserted = payload.new as ChatMessage;

          const { data } = await supabase
            .from('chat_messages')
            .select('*, profiles(id, full_name, photo_url)')
            .eq('id', inserted.id)
            .single();

          const hydrated = (data as ChatMessage) || inserted;

          setMessages((prev) => {
            const withoutPending = prev.filter(
              (message) =>
                !(
                  message.pending &&
                  message.user_id === hydrated.user_id &&
                  message.content === hydrated.content
                )
            );

            if (withoutPending.some((message) => message.id === hydrated.id)) {
              return withoutPending;
            }

            return [...withoutPending, hydrated];
          });

          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();

    const messageText = input.trim();
    if (!messageText || sending) return;

    if (!user?.id) {
      setError('You must be logged in to send messages.');
      return;
    }

    setSending(true);
    setError('');
    setInput('');

    const optimisticId = `optimistic-${Date.now()}`;

    const optimisticMessage: OptimisticChatMessage = {
      id: optimisticId,
      user_id: user.id,
      content: messageText,
      created_at: new Date().toISOString(),
      pending: true,
      profiles: {
        id: user.id,
        full_name: profile?.full_name || 'Explorer',
        photo_url: profile?.photo_url || null,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        content: messageText,
      });

    if (insertError) {
      setMessages((prev) =>
        prev.filter((message) => message.id !== optimisticId)
      );
      setError(insertError.message);
    }

    setSending(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">WorldOS Chat</h1>
      <p className="mt-1 text-sm text-zinc-400">
        A shared space for explorers to connect.
      </p>

      <div className="mt-6 flex h-[calc(100vh-14rem)] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {messages.length === 0 && (
            <p className="py-8 text-center text-zinc-500">
              No messages yet. Start the conversation.
            </p>
          )}

          <ChatMessageGroup messages={messages} currentUserId={user?.id} />

          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <ChatComposer
          input={input}
          sending={sending}
          onInputChange={setInput}
          onSubmit={handleSend}
        />
      </div>
    </div>
  );
}