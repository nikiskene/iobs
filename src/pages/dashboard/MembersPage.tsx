// src/pages/dashboard/MembersPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Map, MapPin, MessageCircle, Users } from 'lucide-react';

import MembersMap from '../../components/members/MembersMap';
import { useAuth } from '../../hooks/useAuth';
import { useMemberLocations } from '../../hooks/useMemberLocations';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/types';
import { getOrCreateMemberDm } from '../../lib/messaging/messagingApi';

type ViewMode = 'map' | 'list';

export default function MembersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { members: mapMembers } = useMemberLocations();

  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('map');
  const [startingDmId, setStartingDmId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .eq('is_public', true)
      .order('full_name')
      .then(({ data }) => {
        setMembers((data as Profile[]) || []);
        setLoading(false);
      });
  }, []);

  async function handleMessage(memberId: string) {
    try {
      setStartingDmId(memberId);
      const conversationId = await getOrCreateMemberDm(memberId);
      navigate(`/dashboard/inbox?conversation=${conversationId}`);
    } finally {
      setStartingDmId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Explorers</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Find people inside the WorldOS community.
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
        <ViewButton active={view === 'map'} onClick={() => setView('map')} icon={Map}>
          Map
        </ViewButton>
        <ViewButton active={view === 'list'} onClick={() => setView('list')} icon={Users}>
          List
        </ViewButton>
      </div>

      <div className="mt-6">
        {view === 'map' ? (
          <MembersMap members={mapMembers} />
        ) : loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : members.length === 0 ? (
          <p className="text-zinc-500">No explorers yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isCurrentUser={member.id === user?.id}
                isStartingDm={startingDmId === member.id}
                onMessage={() => handleMessage(member.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Map;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${
        active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function MemberCard({
  member,
  isCurrentUser,
  isStartingDm,
  onMessage,
}: {
  member: Profile;
  isCurrentUser: boolean;
  isStartingDm: boolean;
  onMessage: () => void;
}) {
  const location = member.location_label || member.city || member.location;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-lg font-semibold text-zinc-400">
          {member.photo_url ? (
            <img src={member.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            (member.full_name?.[0] || '?').toUpperCase()
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold">{member.full_name || 'Explorer'}</h3>

          {location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          )}
        </div>
      </div>

      {member.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-zinc-400">{member.bio}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        {!isCurrentUser && (
          <button
            type="button"
            onClick={onMessage}
            disabled={isStartingDm}
            className="inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-400 disabled:opacity-50"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {isStartingDm ? 'Opening...' : 'Message'}
          </button>
        )}

        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-sky-400"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}