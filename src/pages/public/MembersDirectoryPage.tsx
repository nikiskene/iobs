import { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { DirectoryMember } from '../../lib/memberTypes';

export default function MembersDirectoryPage() {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('member_directory').select('*').order('full_name').then(({ data, error: loadError }) => {
      setMembers((data as DirectoryMember[]) || []);
      setError(loadError?.message || '');
      setLoading(false);
    });
  }, []);

  return <main className="min-h-screen bg-[#0A0A0A] px-5 pb-24 pt-32 text-white">
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400"><Users className="h-4 w-4" />Members</div>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-6xl">People making beautiful success real.</h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">Meet the people participating in the Institute and explore their work.</p>

      {loading ? <p className="py-20 text-zinc-500">Loading members…</p> : error ? <p className="mt-10 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-red-300">{error}</p> : members.length === 0 ? <p className="py-20 text-zinc-500">No public member profiles yet.</p> : <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{members.map((member) => <Link key={member.id} to={`/members/${member.profile_name}`} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-amber-300/20 hover:bg-white/[0.045]">
        <div className="flex items-center gap-4"><Avatar member={member} /><div className="min-w-0"><h2 className="truncate font-serif text-xl text-zinc-100">{member.full_name || 'Member'}</h2>{member.team_role && <p className="mt-0.5 text-xs uppercase tracking-wider text-amber-400">{member.team_role}</p>}</div></div>
        {member.bio && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-zinc-400">{member.bio}</p>}
        <div className="mt-5 flex items-center justify-between text-xs text-zinc-500"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{member.location_label || member.city || member.location || 'Member'}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:text-amber-300" /></div>
      </Link>)}</div>}
    </div>
  </main>;
}

function Avatar({ member }: { member: DirectoryMember }) {
  return <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-lg text-zinc-400">{member.photo_url ? <img src={member.photo_url} alt="" className="h-full w-full object-cover" /> : (member.full_name?.[0] || '?').toUpperCase()}</div>;
}
