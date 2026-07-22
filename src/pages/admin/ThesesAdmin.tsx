// src/pages/admin/ThesesAdmin.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Thesis, ThesisCategory, ThesisMedia } from '../../lib/types';
import { Pencil, Star, Upload } from 'lucide-react';

export default function ThesesAdmin() {
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Thesis | null>(null);

  const fetchTheses = async () => {
    const { data } = await supabase
      .from('theses')
      .select('*, thesis_categories(*), profiles(id, full_name), thesis_media(*)')
      .order('updated_at', { ascending: false });

    setTheses((data as Thesis[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    Promise.all([
      fetchTheses(),
      supabase
        .from('thesis_categories')
        .select('*')
        .order('display_order')
        .then(({ data }) => setCategories((data as ThesisCategory[]) || [])),
    ]);
  }, []);

  if (editing) {
    return (
      <AdminThesisEditor
        thesis={editing}
        categories={categories}
        onClose={() => {
          setEditing(null);
          fetchTheses();
        }}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">All Theses</h1>
      <p className="mt-1 text-sm text-zinc-400">Manage all theses across the platform.</p>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-zinc-500">Loading...</p>}
        {!loading && theses.length === 0 && <p className="text-zinc-500">No theses yet.</p>}

        {theses.map((thesis) => {
          const cat = thesis.thesis_categories;
          const author = thesis.profiles;
          const image = thesis.thesis_media?.[0];

          return (
            <div key={thesis.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
              {image?.file_url ? (
                <img src={image.file_url} alt="" className="h-16 w-24 rounded-md object-cover" />
              ) : (
                <div className="h-16 w-24 rounded-md bg-white/5" />
              )}

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  {cat && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${cat.color_hex}15`, color: cat.color_hex }}
                    >
                      {cat.name}
                    </span>
                  )}

                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
                    {thesis.status}
                  </span>

                  {thesis.is_featured && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  )}
                </div>

                <h3 className="font-semibold">{thesis.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  by {author?.full_name || 'Unknown'} · {new Date(thesis.updated_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setEditing(thesis)}
                className="rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminThesisEditor({
  thesis,
  categories,
  onClose,
}: {
  thesis: Thesis;
  categories: ThesisCategory[];
  onClose: () => void;
}) {
  const [categoryId, setCategoryId] = useState(thesis.category_id || '');
  const [title, setTitle] = useState(thesis.title || '');
  const [subheadline, setSubheadline] = useState(thesis.subheadline || '');
  const [shortExplanation, setShortExplanation] = useState(thesis.short_explanation || '');
  const [body, setBody] = useState(thesis.body || '');
  const [status, setStatus] = useState(thesis.status);
  const [isFeatured, setIsFeatured] = useState(thesis.is_featured);
  const [displayOrder, setDisplayOrder] = useState(thesis.display_order);
  const [media, setMedia] = useState<ThesisMedia[]>(thesis.thesis_media || []);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputClass = 'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const remainingSlots = Math.max(0, 3 - media.length);
    setFiles(Array.from(selectedFiles).slice(0, remainingSlots));
  };

  const uploadFiles = async () => {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `${thesis.id}/${safeName}`;

      const upload = await supabase.storage.from('thesis-visuals').upload(filePath, file, { upsert: true });
      if (upload.error) throw upload.error;

      const { data } = supabase.storage.from('thesis-visuals').getPublicUrl(filePath);

      const insert = await supabase.from('thesis_media').insert({
        thesis_id: thesis.id,
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

    try {
      const { error: updateError } = await supabase
        .from('theses')
        .update({
          category_id: categoryId,
          title: title.trim(),
          subheadline,
          short_explanation: shortExplanation,
          body,
          status,
          is_featured: isFeatured,
          display_order: displayOrder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', thesis.id);

      if (updateError) throw updateError;
      await uploadFiles();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update thesis.');
      setSaving(false);
    }
  };

  return (
    <div>
      <button onClick={onClose} className="mb-6 text-sm text-zinc-400 hover:text-white">Back</button>
      <h1 className="text-2xl font-bold">Edit Thesis</h1>

      <div className="mt-6 max-w-2xl space-y-5">
        <Field label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="" className="bg-zinc-900">Select a category</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.name}</option>)}
          </select>
        </Field>

        <TextInput label="Title" value={title} onChange={setTitle} inputClass={inputClass} />
        <TextInput label="Subheadline" value={subheadline} onChange={setSubheadline} inputClass={inputClass} />

        <Field label="Images">
          <div className="grid grid-cols-3 gap-3">
            {media.map((item) => <img key={item.id} src={item.file_url} alt="" className="h-24 w-full rounded-md object-cover" />)}
          </div>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
            <Upload className="h-4 w-4" /> Upload images
            <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          </label>

          {files.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              {files.length} image(s) selected. Click update to upload.
            </p>
          )}
        </Field>

        <Field label="Short Explanation">
          <textarea value={shortExplanation} onChange={(e) => setShortExplanation(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </Field>

        <Field label="Body">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className={`${inputClass} resize-none`} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
              <option value="draft" className="bg-zinc-900">Draft</option>
              <option value="published" className="bg-zinc-900">Published</option>
              <option value="archived" className="bg-zinc-900">Archived</option>
            </select>
          </Field>

          <TextInput label="Display Order" value={String(displayOrder)} onChange={(v) => setDisplayOrder(Number(v))} inputClass={inputClass} type="number" />
        </div>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          Featured
        </label>

        {error && (
          <div className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="rounded-md bg-sky-500 px-5 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-50">
          {saving ? 'Saving...' : 'Update Thesis'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</label>{children}</div>;
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
    <Field label={label}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </Field>
  );
}