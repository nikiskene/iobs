// src/components/messaging/MessageDateDivider.tsx
export default function MessageDateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-white/10" />

      <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-600">
        {formatDateLabel(date)}
      </span>

      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString();
}