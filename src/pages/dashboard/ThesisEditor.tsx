// src/pages/dashboard/ThesisEditor.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Thesis, ThesisCategory, ThesisMedia } from '../../lib/types';

interface Props {
  thesis: Thesis | null;
  categories: ThesisCategory[];
  onClose: () => void;
}

export default function ThesisEditor({ thesis, categories, onClose }: Props) {
  const { user } = useAuth();
  const isEditing = !!thesis;

  const [categoryId, setCategoryId] = useState(thesis?.category_id || '');
  const [title, setTitle] = useState(thesis?.title || '');
  const [subheadline, setSubheadline] = useState(thesis?.subheadline || '');
  const [shortExplanation, setShortExplanation] = useState(thesis?.short_explanation || '');
  const [body, setBody] = useState(thesis?.body || '');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(thesis?.status || 'draft');
  const [media, setMedia] = useState<ThesisMedia[]>(thesis?.thesis_media || []);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500';

  useEffect(() => {
    const fetchMedia = async () => {
      if (!thesis?.id) return;

      const { data } = await supabase
        .from('thesis_media')
        .select('*')
        .eq('thesis_id', thesis.id)
        .order('display_order');

      setMedia((data as ThesisMedia[]) || []);
    };

    fetchMedia();
  }, [thesis?.id]);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const remainingSlots = Math.max(0, 3 - media.length);
    setFiles(Array.from(selectedFiles).slice(0, remainingSlots));
  };

  const uploadFiles = async (thesisId: string) => {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `${thesisId}/${safeName}`;

      const upload = await supabase.storage
        .from('thesis-visuals')
        .upload(filePath, file, { upsert: true });

      if (upload.error) throw upload.error;

      const { data } = supabase.storage
        .from('thesis-visuals')
        .getPublicUrl(filePath);

      const insert = await supabase.from('thesis_media').insert({
        thesis_id: thesisId,
        file_url: data.publicUrl,
        file_path: filePath,
        alt_text: title.trim(),
        display_order: media.length + index,
      });

      if (insert.error) throw insert.error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    if (!user?.id) {
      setError('You must be logged in.');
      setSaving(false);
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      setSaving(false);
      return;
    }

    if (!title.trim()) {
      setError('Title is required.');
      setSaving(false);
      return;
    }

    const payload = {
      category_id: categoryId,
      title: title.trim(),
      subheadline,
      short_explanation: shortExplanation,
      body,
      status,
      updated_at: new Date().toISOString(),
    };

    try {
      let thesisId = thesis?.id;

      if (isEditing) {
        const result = await supabase
          .from('theses')
          .update(payload)
          .eq('id', thesis.id);

        if (result.error) throw result.error;
      } else {
        const result = await supabase
          .from('theses')
          .insert({ ...payload, author_id: user.id })
          .select('id')
          .single();

        if (result.error) throw result.error;
        thesisId = result.data.id;
      }

      if (thesisId) await uploadFiles(thesisId);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save thesis.');
      setSaving(false);
    }
  };

  return (
    <div>
      <button onClick={onClose} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to My Theses
      </button>

      <h1 className="text-2xl font-bold">{isEditing ? 'Edit Thesis' : 'New Thesis'}</h1>

      <div className="mt-6 max-w-2xl space-y-5">
        <Field label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="" className="bg-zinc-900">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-zinc-900">
                {cat.name}
              </option>
            ))}
          </select>
        </Field>

        <TextInput label="Title" value={title} onChange={setTitle} inputClass={inputClass} />
        <TextInput label="Subheadline" value={subheadline} onChange={setSubheadline} inputClass={inputClass} />

        <Field label="Images">
          <div className="grid grid-cols-3 gap-3">
            {media.map((item) => (
              <img key={item.id} src={item.file_url} alt={item.alt_text || ''} className="h-24 w-full rounded-md object-cover" />
            ))}
          </div>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
            <Upload className="h-4 w-4" /> Upload images
            <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          </label>

          {files.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              {files.length} image(s) selected. Click save to upload.
            </p>
          )}
        </Field>

        <Field label="Short Explanation">
          <textarea value={shortExplanation} onChange={(e) => setShortExplanation(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </Field>

        <Field label="Body">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className={`${inputClass} resize-none`} />
        </Field>

        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
            <option value="draft" className="bg-zinc-900">Draft</option>
            <option value="published" className="bg-zinc-900">Published</option>
            <option value="archived" className="bg-zinc-900">Archived</option>
          </select>
        </Field>

        {error && <div className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</div>}

        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-5 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : isEditing ? 'Update Thesis' : 'Create Thesis'}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
}) {
  return (
    <Field label={label}>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </Field>
  );
}