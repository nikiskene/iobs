// src/components/messaging/ConversationComposer.tsx
import { FormEvent, KeyboardEvent, useState } from 'react';
import { Send } from 'lucide-react';

type ConversationComposerProps = {
  sending: boolean;
  onSend: (body: string) => Promise<void>;
};

export default function ConversationComposer({
  sending,
  onSend,
}: ConversationComposerProps) {
  const [body, setBody] = useState('');

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const cleanBody = body.trim();
    if (!cleanBody || sending) return;

    await onSend(cleanBody);
    setBody('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    handleSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-black/40 p-4"
    >
      <div className="flex items-end gap-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-sky-400/60"
        />

        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}