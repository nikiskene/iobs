// src/components/messaging/MemberPickerModal.tsx
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useMembers } from '../../hooks/useMembers';
import type { Profile } from '../../lib/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (member: Profile) => void | Promise<void>;
};

export default function MemberPickerModal({
  open,
  onClose,
  onSelect,
}: Props) {
  const { members, loading } = useMembers({
    excludeCurrentUser: true,
  });

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;

    return members.filter((member) => {
      const name = member.full_name?.toLowerCase() || '';
      const location = member.location?.toLowerCase() || '';
      const bio = member.bio?.toLowerCase() || '';

      return name.includes(q) || location.includes(q) || bio.includes(q);
    });
  }, [members, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b0b0b]">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">New Message</h2>

          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search members..."
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
          />
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-sm text-zinc-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500">No members found.</div>
          ) : (
            filtered.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelect(member)}
                className="flex w-full items-center gap-3 border-b border-white/5 px-5 py-3 text-left transition hover:bg-white/5"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-700">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-white">
                      {(member.full_name?.[0] || '?').toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">
                    {member.full_name || 'Explorer'}
                  </div>

                  {member.location && (
                    <div className="truncate text-xs text-zinc-500">
                      {member.location}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}