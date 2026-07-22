// src/pages/admin/TeamAdmin.tsx
import { useEffect, useState } from 'react';
import { Save, Shield, X, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/types';

export default function TeamAdmin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<Profile | null>(null);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name');
    setProfiles((data as Profile[]) || []);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  if (editing) {
    return (
      <ProfileEditor
        profile={editing}
        onClose={() => {
          setEditing(null);
          fetchProfiles();
        }}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Profile Management</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Edit profiles, team visibility and admin access.
      </p>

      <ProfileSection
        title="Team Members"
        icon={<UserCheck className="h-5 w-5 text-emerald-400" />}
        profiles={profiles.filter((p) => p.is_team_member)}
        empty="No team members yet."
        onEdit={setEditing}
      />

      <ProfileSection
        title="Other Profiles"
        icon={<UserX className="h-5 w-5 text-zinc-500" />}
        profiles={profiles.filter((p) => !p.is_team_member)}
        empty="No other profiles."
        onEdit={setEditing}
      />
    </div>
  );
}

function ProfileSection({
  title,
  icon,
  profiles,
  empty,
  onEdit,
}: {
  title: string;
  icon: React.ReactNode;
  profiles: Profile[];
  empty: string;
  onEdit: (profile: Profile) => void;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">{icon} {title}</h2>
      {profiles.length === 0 ? (
        <p className="text-sm text-zinc-500">{empty}</p>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <ProfileRow key={profile.id} profile={profile} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProfileRow({
  profile,
  onEdit,
}: {
  profile: Profile;
  onEdit: (profile: Profile) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xs text-zinc-400">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            (profile.full_name?.[0] || profile.email?.[0] || '?').toUpperCase()
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {profile.full_name || profile.email || 'Explorer'}
            </span>
            {profile.role === 'admin' && (
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-300">
                Admin
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {profile.team_role || profile.location || 'No role/location set'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onEdit(profile)}
        className="rounded-md px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
      >
        Edit
      </button>
    </div>
  );
}

function ProfileEditor({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const { user } = useAuth();
  const isSelf = user?.id === profile.id;

  const [fullName, setFullName] = useState(profile.full_name || '');
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [isTeamMember, setIsTeamMember] = useState(profile.is_team_member);
  const [role, setRole] = useState<'explorer' | 'admin'>(profile.role);
  const [teamRole, setTeamRole] = useState(profile.team_role || '');
  const [teamSortOrder, setTeamSortOrder] = useState(profile.team_sort_order ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        photo_url: photoUrl,
        linkedin_url: linkedinUrl,
        location,
        bio,
        is_team_member: isTeamMember,
        role: isSelf ? profile.role : role,
        team_role: teamRole,
        team_sort_order: teamSortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    onClose();
  };

  return (
    <div>
      <button onClick={onClose} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <X className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold">Edit Profile</h1>
      <p className="mt-1 text-sm text-zinc-400">
        {profile.email || profile.id}
      </p>
      <div className="mt-6 max-w-2xl space-y-5">
        <TextInput label="Full Name" value={fullName} onChange={setFullName} inputClass={inputClass} />
        <TextInput label="Photo URL" value={photoUrl} onChange={setPhotoUrl} inputClass={inputClass} />
        <TextInput label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} inputClass={inputClass} />
        <TextInput label="Location" value={location} onChange={setLocation} inputClass={inputClass} />

        <TextArea label="Bio" value={bio} onChange={setBio} inputClass={inputClass} rows={4} />

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input type="checkbox" checked={isTeamMember} onChange={(e) => setIsTeamMember(e.target.checked)} />
          Show on Team page
        </label>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Shield className="h-4 w-4" /> Access Role
          </label>
          <select value={role} onChange={(e) => setRole(e.target.value as 'explorer' | 'admin')} disabled={isSelf} className={inputClass}>
            <option value="explorer" className="bg-zinc-900">Explorer</option>
            <option value="admin" className="bg-zinc-900">Admin</option>
          </select>
          {isSelf && <p className="mt-2 text-xs text-zinc-500">You cannot remove your own admin access here.</p>}
        </div>

        <TextInput label="Team Role" value={teamRole} onChange={setTeamRole} inputClass={inputClass} />
        <TextInput label="Sort Order" value={String(teamSortOrder)} onChange={(value) => setTeamSortOrder(Number(value))} inputClass={inputClass} type="number" />

        {error && <div className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</div>}

        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-5 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, inputClass, type = 'text' }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  type?: string;
}) {
  return <div><label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} /></div>;
}

function TextArea({ label, value, onChange, inputClass, rows }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  rows: number;
}) {
  return <div><label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${inputClass} resize-none`} /></div>;
}