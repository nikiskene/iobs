// src/components/chat/ChatDateDivider.tsx
export default function ChatDateDivider({ timestamp }: { timestamp: string }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-px flex-1 bg-white/5" />
      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-500">
        {formatDay(timestamp)}
      </span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  );
}

function formatDay(timestamp: string) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}