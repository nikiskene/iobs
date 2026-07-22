// src/components/messaging/EmptyConversationState.tsx
import { MessageCircle } from 'lucide-react';

export default function EmptyConversationState() {
  return (
    <section className="flex min-w-0 flex-1 items-center justify-center bg-[#070707] p-8">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-500">
          <MessageCircle className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-lg font-medium text-white">
          Select a conversation
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Choose a conversation from your inbox to read and reply.
        </p>
      </div>
    </section>
  );
}