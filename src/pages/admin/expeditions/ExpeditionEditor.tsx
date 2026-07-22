// src/pages/admin/expeditions/ExpeditionEditor.tsx
import { useState } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Expedition } from '../../../lib/types';

export default function ExpeditionEditor({
  expedition,
  onClose,
}: {
  expedition: Expedition | null;
  onClose: () => void;
}) {
  const isEditing = !!expedition;

  const [title, setTitle] = useState(expedition?.title || '');
  const [slug, setSlug] = useState(expedition?.slug || '');
  const [location, setLocation] = useState(expedition?.location || '');
  const [startDate, setStartDate] = useState(expedition?.start_date?.slice(0, 10) || '');
  const [endDate, setEndDate] = useState(expedition?.end_date?.slice(0, 10) || '');
  const [price, setPrice] = useState(expedition?.price || '');
  const [shortDescription, setShortDescription] = useState(expedition?.short_description || '');
  const [description, setDescription] = useState(expedition?.description || '');
  const [heroImageUrl, setHeroImageUrl] = useState(expedition?.hero_image_url || '');
  const [heroImagePath, setHeroImagePath] = useState(expedition?.hero_image_path || '');
  const [status, setStatus] = useState<Expedition['status']>(expedition?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState(expedition?.is_featured ?? false);
  const [isActive, setIsActive] = useState(expedition?.is_active ?? true);
  const [applyButtonLabel, setApplyButtonLabel] = useState(expedition?.apply_button_label || 'Apply to join');
  const [contactEmail, setContactEmail] = useState(expedition?.contact_email || '');
  const [displayOrder, setDisplayOrder] = useState(expedition?.display_order ?? 0);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

  const handleHeroUpload = async (file: File) => {
    setUploading(true);
    setError('');

    const safeName = file.name.replace(/\s+/g, '-');
    const filePath = `hero/${Date.now()}-${safeName}`;

    const upload = await supabase.storage
      .from('expedition-media')
      .upload(filePath, file);

    if (upload.error) {
      setError(upload.error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('expedition-media')
      .getPublicUrl(filePath);

    setHeroImageUrl(data.publicUrl);
    setHeroImagePath(filePath);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      setSaving(false);
      return;
    }

    if (!slug.trim()) {
      setError('Slug is required.');
      setSaving(false);
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      location,
      start_date: startDate || null,
      end_date: endDate || null,
      price,
      short_description: shortDescription,
      description,
      hero_image_url: heroImageUrl,
      hero_image_path: heroImagePath,
      status,
      is_featured: isFeatured,
      is_active: isActive,
      apply_button_label: applyButtonLabel,
      contact_email: contactEmail,
      display_order: displayOrder,
      updated_at: new Date().toISOString(),
    };

    const result = isEditing
      ? await supabase.from('expeditions').update(payload).eq('id', expedition.id)
      : await supabase.from('expeditions').insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    onClose();
  };

  return (
    <div>
      <button
        onClick={onClose}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <X className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold">
        {isEditing ? 'Edit Expedition' : 'New Expedition'}
      </h1>

      <div className="mt-6 max-w-3xl space-y-5">
        <TextInput label="Title" value={title} onChange={setTitle} inputClass={inputClass} />

        <TextInput
          label="Slug"
          value={slug}
          onChange={setSlug}
          inputClass={inputClass}
          placeholder="e.g. silicon-valley-august-2026"
        />

        <TextInput label="Location" value={location} onChange={setLocation} inputClass={inputClass} />
        <TextInput label="Start Date" value={startDate} onChange={setStartDate} inputClass={inputClass} type="date" />
        <TextInput label="End Date" value={endDate} onChange={setEndDate} inputClass={inputClass} type="date" />
        <TextInput label="Price" value={price} onChange={setPrice} inputClass={inputClass} placeholder="e.g. €3,500 excl. VAT" />

        <Field label="Hero Photo">
          {heroImageUrl && (
            <img
              src={heroImageUrl}
              alt=""
              className="mb-3 h-44 w-full rounded-lg object-cover"
            />
          )}

          <input
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            className={inputClass}
            placeholder="Image URL or uploaded file URL"
          />

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload hero photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleHeroUpload(file);
              }}
            />
          </label>
        </Field>

        <TextArea
          label="Short Description"
          value={shortDescription}
          onChange={setShortDescription}
          inputClass={inputClass}
          rows={3}
        />

        <TextArea
          label="Description"
          value={description}
          onChange={setDescription}
          inputClass={inputClass}
          rows={8}
        />

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Expedition['status'])}
            className={inputClass}
          >
            <option value="draft" className="bg-zinc-900">Draft</option>
            <option value="published" className="bg-zinc-900">Published</option>
            <option value="archived" className="bg-zinc-900">Archived</option>
          </select>
        </Field>

        <TextInput
          label="Apply Button Label"
          value={applyButtonLabel}
          onChange={setApplyButtonLabel}
          inputClass={inputClass}
        />

        <TextInput
          label="Contact Email"
          value={contactEmail}
          onChange={setContactEmail}
          inputClass={inputClass}
          type="email"
        />

        <TextInput
          label="Display Order"
          value={String(displayOrder)}
          onChange={(value) => setDisplayOrder(Number(value))}
          inputClass={inputClass}
          type="number"
        />

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured
        </label>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>

        {error && (
          <div className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-5 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Expedition'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  inputClass,
  type = 'text',
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={placeholder}
      />
    </Field>
  );
}

function TextArea({
  label,
  value,
  onChange,
  inputClass,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  rows: number;
}) {
  return (
    <Field label={label}>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-none`}
      />
    </Field>
  );
}