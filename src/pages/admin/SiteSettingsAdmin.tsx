// src/pages/admin/SiteSettingsAdmin.tsx
import { useEffect, useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SiteSettings } from '../../lib/types';

type UploadField =
  | 'logo'
  | 'default_hero'
  | 'headline_font'
  | 'body_font';

export default function SiteSettingsAdmin() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [heroUrl, setHeroUrl] = useState('');
  const [headlineFontUrl, setHeadlineFontUrl] = useState('');
  const [bodyFontUrl, setBodyFontUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadField | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      setError(error.message);
      return;
    }

    if (data) {
      const typed = data as SiteSettings;
      setSettings(typed);
      setContactEmail(typed.contact_email || '');
      setLogoUrl(typed.logo_url || '');
      setHeroUrl(typed.default_hero_url || '');
      setHeadlineFontUrl(typed.headline_font_url || '');
      setBodyFontUrl(typed.body_font_url || '');
    }
  };

  const uploadFile = async (file: File, field: UploadField) => {
    if (!settings) return;

    setUploading(field);
    setError('');

    try {
      const safeName = file.name.replace(/\s+/g, '-');
      const filePath = `${field}/${Date.now()}-${safeName}`;

      const upload = await supabase.storage
        .from('homepage-media')
        .upload(filePath, file);

      if (upload.error) throw upload.error;

      const { data } = supabase.storage
        .from('homepage-media')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      if (field === 'logo') setLogoUrl(publicUrl);
      if (field === 'default_hero') setHeroUrl(publicUrl);
      if (field === 'headline_font') setHeadlineFontUrl(publicUrl);
      if (field === 'body_font') setBodyFontUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    }

    setUploading(null);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('site_settings')
      .update({
        contact_email: contactEmail,
        logo_url: logoUrl,
        default_hero_url: heroUrl,
        headline_font_url: headlineFontUrl,
        body_font_url: bodyFontUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  const inputClass =
    'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

  return (
    <div>
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Manage global logo, hero media, fonts and contact settings.
      </p>

      <div className="mt-8 max-w-2xl space-y-6">
        <TextInput
          label="Contact Email"
          value={contactEmail}
          onChange={setContactEmail}
          inputClass={inputClass}
          type="email"
        />

        <UploadInput
          label="Logo"
          value={logoUrl}
          onChange={setLogoUrl}
          inputClass={inputClass}
          uploading={uploading === 'logo'}
          onUpload={(file) => uploadFile(file, 'logo')}
        />

        <UploadInput
          label="Default Hero Image / Video"
          value={heroUrl}
          onChange={setHeroUrl}
          inputClass={inputClass}
          uploading={uploading === 'default_hero'}
          onUpload={(file) => uploadFile(file, 'default_hero')}
        />

        <UploadInput
          label="Headline Font File"
          value={headlineFontUrl}
          onChange={setHeadlineFontUrl}
          inputClass={inputClass}
          uploading={uploading === 'headline_font'}
          onUpload={(file) => uploadFile(file, 'headline_font')}
        />

        <UploadInput
          label="Body Font File"
          value={bodyFontUrl}
          onChange={setBodyFontUrl}
          inputClass={inputClass}
          uploading={uploading === 'body_font'}
          onUpload={(file) => uploadFile(file, 'body_font')}
        />

        {error && (
          <div className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  inputClass,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function UploadInput({
  label,
  value,
  onChange,
  inputClass,
  uploading,
  onUpload,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <TextInput
        label={label}
        value={value}
        onChange={onChange}
        inputClass={inputClass}
      />

      <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
        <Upload className="h-4 w-4" />
        {uploading ? 'Uploading...' : 'Upload file'}
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
      </label>
    </div>
  );
}