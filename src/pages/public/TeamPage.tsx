import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/types';
import { Linkedin } from 'lucide-react';

export default function TeamPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('is_team_member', true)
      .eq('is_active', true)
      .order('team_sort_order')
      .then(({ data }) => {
        setMembers((data as Profile[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-white pt-16">
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Team</h1>
          <p className="mt-4 text-xl text-zinc-400">
            The people shaping the conversation.
          </p>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-zinc-500">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-zinc-500 text-center py-16">
              <p>Team members will be announced soon.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-semibold text-zinc-400 overflow-hidden mx-auto">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.full_name || 'Team member'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (member.full_name?.[0] || '?').toUpperCase()
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold">{member.full_name || 'Team Member'}</h3>
                    {member.team_role && (
                      <p className="text-sm text-sky-400 mt-1">{member.team_role}</p>
                    )}
            {member.bio && (
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                {member.bio}
              </p>
            )}
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-zinc-500 hover:text-sky-400 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
