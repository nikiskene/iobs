// src/pages/dashboard/InboxPage.tsx
import { useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  MessageSquarePlus,
  Shield,
  Users,
} from 'lucide-react';

import ConversationList from '../../components/messaging/ConversationList';
import { InboxProvider, useInbox } from '../../components/messaging/InboxProvider';
import MessageThread from '../../components/messaging/MessageThread';
import NewMessageModal from '../../components/messaging/NewMessageModal';

export default function InboxPage() {
  return (
    <InboxProvider>
      <DesktopInbox />
      <MobileInbox />
    </InboxProvider>
  );
}

function DesktopInbox() {
  return (
    <div className="hidden h-[calc(100vh-9rem)] grid-cols-[340px_1fr] overflow-hidden rounded-2xl border border-white/10 bg-black md:grid">
      <ConversationList variant="desktop" />
      <MessageThread />
    </div>
  );
}

function MobileInbox() {
  const { selectedConversationId, setSelectedConversationId } = useInbox();
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  if (selectedConversationId) {
    return (
      <div className="h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-white/10 bg-black md:hidden">
        <div className="flex items-center gap-3 border-b border-white/10 px-3 py-3">
          <button
            type="button"
            onClick={() => setSelectedConversationId(null)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <span className="text-sm font-semibold text-white">Messages</span>
        </div>

        <MessageThread />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-sky-300/80">
              Communication
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">Messages</h1>
          </div>

          <button
            type="button"
            onClick={() => setNewMessageOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 text-white"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
        </div>

        <MobileFilters />

        <ConversationList variant="mobile" />
      </div>

      <NewMessageModal
        open={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
      />
    </>
  );
}

function MobileFilters() {
  const { activeFilter, setInboxFilter } = useInbox();

  return (
    <div className="grid grid-cols-3 gap-2 border-y border-white/10 px-4 py-3">
      <FilterIcon
        active={activeFilter === 'team'}
        icon={Shield}
        label="WorldOS"
        onClick={() => setInboxFilter('team')}
      />

      <FilterIcon
        active={activeFilter === 'community'}
        icon={Users}
        label="Community"
        onClick={() => setInboxFilter('community')}
      />

      <FilterIcon
        active={activeFilter === 'direct'}
        icon={MessageCircle}
        label="Direct"
        onClick={() => setInboxFilter('direct')}
      />
    </div>
  );
}

function FilterIcon({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border py-3 text-xs transition ${
        active
          ? 'border-sky-400/50 bg-sky-500/10 text-sky-300'
          : 'border-white/10 bg-white/[0.03] text-zinc-400'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}