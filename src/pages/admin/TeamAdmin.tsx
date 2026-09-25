import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { TEAM_CATEGORIES, safeWebUrl } from '../../lib/team';
import { memberMatches, newMember, type ManagedMember } from '../../lib/memberAdmin';
import MemberEditor from './MemberEditor';

export default function TeamAdmin() {
  const [members, setMembers] = useState<ManagedMember[]>([]);
  const [editing, setEditing] = useState<ManagedMember | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(editId?: string) {
    setLoading(true);
    setError('');
    try {
      const result = await supabase.rpc('admin_list_members');
      if (result.error) throw result.error;
      const people = (result.data || []) as ManagedMember[];
      setMembers(people);
      setEditing(editId ? people.find((person) => person.id === editId) || null : null);
    } catch {
      setError('Unable to load members. Please retry.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  if (editing) return <MemberEditor key={`${editing.id}:${editing.updated_at}`} member={editing} members={members}
    onCancel={() => { setEditing(null); void load(); }} onSaved={() => load()} onCombined={() => load(editing.id)} />;

  const visible = members.filter((member) => memberMatches(member, search));
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Members</h1><p className="mt-2 text-sm text-zinc-400">One entry per person. Edit public details, team category and login access together.</p></div>
    <div className="flex flex-wrap gap-3">
      <button className="rounded-lg bg-white/10 px-4 py-2 text-sm disabled:opacity-50" disabled={loading || !!error} onClick={() => setEditing(newMember())}>Add member</button>
      <Link className="rounded-lg border border-white/15 px-4 py-2 text-sm" to="/team" target="_blank" rel="noopener noreferrer">View public team page</Link>
    </div>
    <label className="block max-w-xl text-sm text-zinc-300">Find a member
      <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, title or location…"
        className="mt-2 w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white" />
    </label>
    {error && <p role="alert" className="text-red-300">{error} <button className="underline" onClick={() => load()}>Retry</button></p>}
    {loading ? <p role="status">Loading members…</p> : !error && <>
      <p className="text-xs text-zinc-500">{visible.length} {visible.length === 1 ? 'member' : 'members'}</p>
      <div className="space-y-3">{visible.map((member) => <div key={member.id} className="flex items-start gap-4 rounded-xl border border-white/10 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-zinc-400">
          {safeWebUrl(member.photo_url) ? <img src={member.photo_url} alt="" className="h-full w-full object-cover" /> : member.full_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1"><h2 className="break-words font-medium">{member.full_name}</h2>
          {member.title && <p className="text-sm text-zinc-400">{member.title}</p>}
          <p className="mt-1 text-xs text-zinc-400">{TEAM_CATEGORIES.find(([value]) => value === member.category)?.[1]} · {member.status === 'published' ? 'Public team page' : member.status === 'archived' ? 'Archived from team page' : 'Not published on team page'}</p>
          {member.accounts.length ? member.accounts.map((account) => <p key={account.id} className="mt-1 break-words text-xs text-zinc-500">
            {account.email}{account.id === member.primary_profile_id && member.accounts.length > 1 ? ' · Active public profile' : ''} · {account.role === 'admin' ? 'Admin' : account.is_team_member ? 'Workspace access' : 'Explorer'}{!account.is_active ? ' · Inactive' : ''}
          </p>) : <p className="mt-1 text-xs text-zinc-500">No login account</p>}
        </div>
        <button className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10" onClick={() => setEditing(member)}>Edit</button>
      </div>)}</div>
      {!visible.length && <p className="text-zinc-400">No members found.</p>}
    </>}
  </div>;
}
