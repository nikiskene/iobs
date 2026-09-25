import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { TEAM_CATEGORIES, safeWebUrl } from '../../lib/team';
import type { ManagedMember, MemberAccount } from '../../lib/memberAdmin';
import { useAuth } from '../../hooks/useAuth';

const inputClass = 'mt-1 block w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-white disabled:opacity-50';
const buttonClass = 'rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50';
const errorText = (cause: unknown) => cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : 'Could not save. Please try again.';

type Props = { member: ManagedMember; members: ManagedMember[]; onCancel: () => void; onSaved: () => Promise<void>; onCombined: () => Promise<void> };

export default function MemberEditor({ member, members, onCancel, onSaved, onCombined }: Props) {
  const { user, refreshProfile } = useAuth();
  const [draft, setDraft] = useState(member);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [combineId, setCombineId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(member) || !!file;
  const combineMember = members.find((person) => person.id === combineId);

  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function change<K extends keyof ManagedMember>(field: K, value: ManagedMember[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }
  function changeAccount<K extends keyof MemberAccount>(id: string, field: K, value: MemberAccount[K]) {
    setDraft((current) => ({ ...current, accounts: current.accounts.map((account) => account.id === id ? { ...account, [field]: value } : account) }));
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setError('');
    for (const field of ['linkedin_url', 'substack_url', 'photo_url'] as const) {
      if (draft[field].trim() && !safeWebUrl(draft[field].trim())) { setError('Use complete http:// or https:// links.'); return; }
    }
    if (!draft.full_name.trim()) { setError('Please enter a name.'); return; }
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('Choose a JPG, PNG or WebP photo up to 5 MB.'); return;
    }
    setBusy(true);
    try {
      let photoUrl = draft.photo_url.trim();
      if (file) {
        const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
        const path = `${draft.id}/${crypto.randomUUID()}.${extension}`;
        const result = await supabase.storage.from('team-photos').upload(path, file, { contentType: file.type });
        if (result.error) throw result.error;
        photoUrl = supabase.storage.from('team-photos').getPublicUrl(path).data.publicUrl;
        // Keep a successfully uploaded image available for retries after save failure.
        change('photo_url', photoUrl); setFile(null);
      }
      const { accounts, ...details } = draft;
      const result = await supabase.rpc('admin_save_member', {
        p_member: { ...details, full_name: draft.full_name.trim(), title: draft.title.trim(),
          photo_url: photoUrl, linkedin_url: draft.linkedin_url.trim(), substack_url: draft.substack_url.trim() },
        p_accounts: accounts,
      });
      if (result.error) throw result.error;
      if (accounts.some((account) => account.id === user?.id)) await refreshProfile();
      await onSaved();
    } catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  }

  async function combine() {
    if (!combineId || !confirmed || dirty) return;
    setBusy(true); setError('');
    try {
      const result = await supabase.rpc('admin_combine_members', { p_target: member.id, p_source: combineId });
      if (result.error) throw result.error;
      await onCombined();
    } catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  }

  return <form onSubmit={save} className="max-w-3xl space-y-6">
    <div><h1 className="text-2xl font-bold">{member.updated_at ? 'Edit member' : 'Add member'}</h1>
      <p className="mt-2 text-sm text-zinc-400">One profile for this person, with public presentation and login access managed below.</p></div>
    <fieldset disabled={busy} className="space-y-6">
      <section className="space-y-4 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold">Member details</h2>
        <label className="block text-sm">Name<input required maxLength={160} className={inputClass} value={draft.full_name} onChange={(e) => change('full_name', e.target.value)} /></label>
        <label className="block text-sm">Title<input maxLength={160} placeholder="e.g. Co-Founder" className={inputClass} value={draft.title} onChange={(e) => change('title', e.target.value)} /></label>
        <label className="block text-sm">Biography<textarea rows={5} className={inputClass} value={draft.description} onChange={(e) => change('description', e.target.value)} /></label>
        <label className="block text-sm">Location<input className={inputClass} value={draft.location} onChange={(e) => change('location', e.target.value)} /></label>
        {(preview || safeWebUrl(draft.photo_url)) && <img src={preview || draft.photo_url} alt="Photo preview" className="h-40 w-32 rounded-lg object-cover" />}
        <label className="block text-sm">Upload photo<input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(e) => setFile(e.target.files?.[0] || null)} /><span className="text-xs text-zinc-400">JPG, PNG or WebP, up to 5 MB.</span></label>
        <label className="block text-sm">Photo URL<input type="url" className={inputClass} value={draft.photo_url} onChange={(e) => change('photo_url', e.target.value)} /></label>
        <label className="block text-sm">LinkedIn<input type="url" className={inputClass} value={draft.linkedin_url} onChange={(e) => change('linkedin_url', e.target.value)} /></label>
        <label className="block text-sm">Substack<input type="url" className={inputClass} value={draft.substack_url} onChange={(e) => change('substack_url', e.target.value)} /></label>
      </section>
      <section className="space-y-4 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold">Public presentation</h2>
        <label className="block text-sm">Team category<select className={inputClass} value={draft.category} onChange={(e) => change('category', e.target.value as ManagedMember['category'])}>
          {TEAM_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select><span className="text-xs text-zinc-400">Founder is a public category. It does not change login permissions.</span></label>
        <label className="block text-sm">Team page visibility<select className={inputClass} value={draft.status} onChange={(e) => change('status', e.target.value as ManagedMember['status'])}>
          <option value="draft">Draft — hidden</option><option value="published">Published — visible on /team</option><option value="archived">Archived — hidden</option>
        </select></label>
        <label className="block text-sm">Sort order<input type="number" required step={1} min={-2147483648} max={2147483647} className={inputClass} value={draft.sort_order} onChange={(e) => change('sort_order', Number(e.target.value))} /></label>
        {draft.accounts.length > 0 && <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.directory_public} onChange={(e) => change('directory_public', e.target.checked)} />Show in the public member directory</label>}
      </section>
      <section className="space-y-4 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold">Login & workspace access</h2>
        {draft.accounts.length === 0 ? <p className="text-sm text-zinc-400">This member has no login account. Public team members do not need a login. An existing account can be linked using “Combine duplicate member” after saving.</p> : <>
          {draft.accounts.length > 1 && <label className="block text-sm">Active public profile<select className={inputClass} value={draft.primary_profile_id || ''} onChange={(e) => change('primary_profile_id', e.target.value)}>
            {draft.accounts.map((account) => <option key={account.id} value={account.id}>{account.email}</option>)}
          </select><span className="text-xs text-zinc-400">Choose which linked account represents this person in the public member directory. The other account stays active, keeps its history and can be selected again later.</span></label>}
          {draft.accounts.map((account) => <div key={account.id} className="space-y-3 rounded-lg border border-white/10 p-4">
            <p className="break-words text-sm font-medium">{account.email}</p>
            <label className="block text-sm">Access role<select className={inputClass} value={account.role} disabled={account.id === user?.id} onChange={(e) => changeAccount(account.id, 'role', e.target.value as MemberAccount['role'])}><option value="explorer">Explorer</option><option value="admin">Admin</option></select></label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={account.is_team_member} onChange={(e) => changeAccount(account.id, 'is_team_member', e.target.checked)} />Workspace access</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={account.is_active} disabled={account.id === user?.id} onChange={(e) => changeAccount(account.id, 'is_active', e.target.checked)} />Active profile</label>
            <p className="text-xs text-zinc-500">Admins also have workspace access. Account email and password are unchanged by this editor.</p>
          </div>)}
        </>}
      </section>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-3"><button type="submit" className={buttonClass}>{busy ? 'Saving…' : 'Save member'}</button><button type="button" onClick={onCancel} className={buttonClass}>Back to members</button></div>
      {member.updated_at && <details className="rounded-xl border border-white/10 p-5">
        <summary className="cursor-pointer text-sm">Combine duplicate member</summary>
        <p className="mt-3 text-sm text-zinc-400">Use this only when another entry represents the same person. Keep this member’s public details, fill any empty details from the duplicate, and link its logins and history here. Login permissions stay unchanged.</p>
        <label className="mt-4 block text-sm">Duplicate entry<select className={inputClass} value={combineId} onChange={(e) => { setCombineId(e.target.value); setConfirmed(false); }}>
          <option value="">Choose a member…</option>{members.filter((person) => person.id !== member.id).map((person) => <option key={person.id} value={person.id}>{person.full_name} — {person.accounts.map((account) => account.email).join(', ') || 'No login'}</option>)}
        </select></label>
        {combineMember && <label className="my-4 flex items-start gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />I confirm {combineMember.full_name} and {member.full_name} are the same person. Keep the details shown in this editor.</label>}
        {dirty && <p className="my-3 text-xs text-amber-300">Save your edits before combining members.</p>}
        <button type="button" disabled={!combineId || !confirmed || dirty} className={`${buttonClass} mt-3`} onClick={combine}>Combine into this member</button>
      </details>}
    </fieldset>
  </form>;
}
