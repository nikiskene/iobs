// src/components/chat/ChatComposer.tsx
import { Send } from 'lucide-react';

export default function ChatComposer({
  input,
  sending,
  onInputChange,
  onSubmit,
}: {
  input: string;
  sending: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />

      <button
        type="submit"
        disabled={sending || !input.trim()}
        className="rounded-md bg-sky-500 px-4 py-2.5 text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}