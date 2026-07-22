// src/pages/dashboard/ProfilePage.tsx
import { useEffect, useRef, useState } from 'react';
import { Camera, Save } from 'lucide-react';

import CityAutocomplete from '../../components/location/CityAutocomplete';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [city, setCity] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [geoLat, setGeoLat] = useState<number | null>(null);
  const [geoLng, setGeoLng] = useState<number | null>(null);
  const [showOnMap, setShowOnMap] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;

    setFullName(profile.full_name || '');
    setEmail(profile.email || '');
    setLinkedinUrl(profile.linkedin_url || '');
    setLocation(profile.location || '');
    setBio(profile.bio || '');
    setIsPublic(profile.is_public ?? true);

    setCity(profile.city || '');
    setLocationLabel(profile.location_label || profile.location || '');
    setGeoLat(profile.geo_lat ?? null);
    setGeoLng(profile.geo_lng ?? null);
    setShowOnMap(profile.show_on_map ?? true);
  }, [profile]);

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        email,
        linkedin_url: linkedinUrl,
        location: locationLabel,
        bio,
        is_public: isPublic,
        city,
        location_label: locationLabel,
        geo_lat: geoLat,
        geo_lng: geoLng,
        show_on_map: showOnMap,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage('Failed to save profile.');
    } else {
      setMessage('Profile saved.');
      await refreshProfile();
    }

    setSaving(false);
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage('Failed to upload photo.');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(path);

    await supabase
      .from('profiles')
      .update({ photo_url: urlData.publicUrl })
      .eq('id', user.id);

    await refreshProfile();
    setMessage('Photo updated.');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Profile</h1>

      <p className="mt-1 text-sm text-zinc-400">
        Manage your profile and visibility.
      </p>

      <div className="mt-8 max-w-2xl space-y-6">
        <ProfilePhoto
          photoUrl={profile?.photo_url}
          fullName={fullName}
          fileInputRef={fileInputRef}
          onUpload={handlePhotoUpload}
        />

        <VisibilityToggle checked={isPublic} onChange={setIsPublic} />
        <MapVisibilityToggle checked={showOnMap} onChange={setShowOnMap} />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Full Name" value={fullName} onChange={setFullName} />

          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <TextInput
            label="LinkedIn URL"
            type="url"
            value={linkedinUrl}
            onChange={setLinkedinUrl}
            placeholder="https://linkedin.com/in/..."
          />

          <CityAutocomplete
            value={locationLabel}
            onSelect={(result) => {
              setCity(result.city);
              setLocationLabel(result.label);
              setLocation(result.label);
              setGeoLat(result.lat);
              setGeoLng(result.lng);
            }}
            onClear={() => {
              setCity('');
              setLocationLabel('');
              setLocation('');
              setGeoLat(null);
              setGeoLng(null);
            }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Tell others about yourself..."
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

          {message && (
            <span
              className={`text-sm ${
                message.includes('Failed') ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function VisibilityToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Public directory</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Allow other members to find you and start a direct message.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            checked ? 'bg-sky-500' : 'bg-zinc-700'
          }`}
          aria-pressed={checked}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              checked ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Current setting: {checked ? 'Public' : 'Private'}
      </p>
    </section>
  );
}

function MapVisibilityToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Explorer map</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Show your city-level location on the WorldOS explorer map.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            checked ? 'bg-sky-500' : 'bg-zinc-700'
          }`}
          aria-pressed={checked}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              checked ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Current setting: {checked ? 'Visible on map' : 'Hidden from map'}
      </p>
    </section>
  );
}

function ProfilePhoto({
  photoUrl,
  fullName,
  fileInputRef,
  onUpload,
}: {
  photoUrl?: string | null;
  fullName: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-2xl font-semibold text-zinc-400">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            (fullName?.[0] || '?').toUpperCase()
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white transition-colors hover:bg-sky-400"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
      </div>

      <div>
        <p className="text-sm text-zinc-400">Profile photo</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Click the camera icon to update.
        </p>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
    </div>
  );
}