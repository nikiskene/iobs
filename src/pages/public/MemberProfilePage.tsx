import { useEffect, useState } from 'react';
import { ArrowLeft, Linkedin, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { DirectoryMember } from '../../lib/memberTypes';

export default function MemberProfilePage() {
  const { profileName = '' } = useParams();
  const [member, setMember] = useState<DirectoryMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('member_directory').select('*').eq('profile_name', profileName.toLowerCase()).maybeSingle().then(({ data }) => {
      setMember(data as DirectoryMember | null); setLoading(false);
    });
  }, [profileName]);

  if (loading) return <main className="min-h-screen bg-[#0A0A0A] pt-32 text-center text-zinc-500">Loading profile…</main>;
  if (!member) return <main className="min-h-screen bg-[#0A0A0A] px-5 pt-32 text-white"><div className="mx-auto max-w-4xl"><Link to="/members" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Members</Link><h1 className="mt-12 font-serif text-4xl">Profile not found.</h1><p className="mt-3 text-zinc-500">This member may have changed their profile name or made their profile private.</p></div></main>;

  const location = member.location_label || member.city || member.location;
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(180,123,42,0.12),transparent_35%),#0A0A0A] px-5 pb-24 pt-28 text-white">
    <article className="mx-auto max-w-4xl"><Link to="/members" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" />All members</Link>
      <div className="mt-10 grid gap-8 md:grid-cols-[180px_1fr] md:gap-12"><div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-amber-300/15 bg-zinc-800 text-5xl text-zinc-500 md:h-44 md:w-44">{member.photo_url ? <img src={member.photo_url} alt={member.full_name || 'Member'} className="h-full w-full object-cover" /> : (member.full_name?.[0] || '?').toUpperCase()}</div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">{member.is_team_member ? 'IOBS Team Member' : 'Institute Member'}</p><h1 className="mt-3 font-serif text-5xl leading-tight sm:text-6xl">{member.full_name || 'Member'}</h1>{member.team_role && <p className="mt-3 text-lg text-amber-200/75">{member.team_role}</p>}{location && <p className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-500"><MapPin className="h-4 w-4" />{location}</p>}{member.bio && <p className="mt-8 max-w-2xl whitespace-pre-line text-lg leading-8 text-zinc-300">{member.bio}</p>}{member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-amber-300/30 hover:text-amber-200"><Linkedin className="h-4 w-4" />LinkedIn</a>}</div>
      </div>
    </article>
  </main>;
}
