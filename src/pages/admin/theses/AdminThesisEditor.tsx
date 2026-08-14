// src/pages/admin/theses/AdminThesisEditor.tsx
import { useState, type ReactNode } from 'react';
import { Star, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Thesis, ThesisCategory, ThesisMedia } from '../../../lib/types';
import ThesisScaleSelector from './ThesisScaleSelector';

const inputClass = 'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500';

export default function AdminThesisEditor({ thesis, categories, onClose }: { thesis: Thesis & { thesis_impact_scales?: { scale_slug: string }[] }; categories: ThesisCategory[]; onClose: () => void }) {
  const [form, setForm] = useState({
    category_id: thesis.category_id || '', title: thesis.title || '', subheadline: thesis.subheadline || '',
    short_explanation: thesis.short_explanation || '', body: thesis.body || '', status: thesis.status,
    is_featured: thesis.is_featured, display_order: thesis.display_order,
  });
  const [scales, setScales] = useState(thesis.thesis_impact_scales?.map((item) => item.scale_slug) || []);
  const [media, setMedia] = useState<ThesisMedia[]>(thesis.thesis_media || []);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [mediaBusy, setMediaBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const set = (key: keyof typeof form, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const deleteImage = async (item: ThesisMedia) => {
    setMediaBusy(item.id); setError('');
    try {
      const removeRow = await supabase.from('thesis_media').delete().eq('id', item.id);
      if (removeRow.error) throw removeRow.error;
      if (item.file_path) {
        const removeFile = await supabase.storage.from('thesis-visuals').remove([item.file_path]);
        if (removeFile.error) console.warn('Image row deleted, but storage cleanup failed:', removeFile.error.message);
      }
      setMedia((current) => current.filter((image) => image.id !== item.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete image.');
    } finally { setMediaBusy(null); }
  };

  const setFeaturedImage = async (item: ThesisMedia) => {
    setMediaBusy(item.id); setError('');
    try {
      const clear = await supabase.from('thesis_media').update({ is_featured: false }).eq('thesis_id', thesis.id);
      if (clear.error) throw clear.error;
      const feature = await supabase.from('thesis_media').update({ is_featured: true }).eq('id', item.id);
      if (feature.error) throw feature.error;
      setMedia((current) => current.map((image) => ({ ...image, is_featured: image.id === item.id })));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not set feature image.');
    } finally { setMediaBusy(null); }
  };

  const uploadFiles = async () => {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const filePath = `${thesis.id}/${Date.now()}-${index}-${file.name.replace(/\s+/g, '-')}`;
      const upload = await supabase.storage.from('thesis-visuals').upload(filePath, file, { upsert: true });
      if (upload.error) throw upload.error;
      const { data } = supabase.storage.from('thesis-visuals').getPublicUrl(filePath);
      const insert = await supabase.from('thesis_media').insert({ thesis_id: thesis.id, file_url: data.publicUrl, file_path: filePath, alt_text: form.title.trim(), display_order: media.length + index, is_featured: false });
      if (insert.error) throw insert.error;
    }
  };

  const saveScaleLinks = async () => {
    const remove = await supabase.from('thesis_impact_scales').delete().eq('thesis_id', thesis.id);
    if (remove.error) throw remove.error;
    if (scales.length) {
      const insert = await supabase.from('thesis_impact_scales').insert(scales.map((scale_slug) => ({ thesis_id: thesis.id, scale_slug })));
      if (insert.error) throw insert.error;
    }
  };

  const save = async () => {
    setSaving(true); setError('');
    try {
      const result = await supabase.from('theses').update({ ...form, title: form.title.trim(), updated_at: new Date().toISOString() }).eq('id', thesis.id);
      if (result.error) throw result.error;
      await Promise.all([uploadFiles(), saveScaleLinks()]);
      onClose();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not update thesis.'); setSaving(false); }
  };

  return (
    <div>
      <button onClick={onClose} className="mb-6 text-sm text-zinc-400 hover:text-white">Back</button>
      <h1 className="text-2xl font-bold">Edit Thesis</h1>
      <div className="mt-6 max-w-3xl space-y-5">
        <Field label="Category"><select value={form.category_id} onChange={(event) => set('category_id', event.target.value)} className={inputClass}><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
        <TextField label="Title" value={form.title} onChange={(value) => set('title', value)} />
        <TextField label="Subheadline" value={form.subheadline} onChange={(value) => set('subheadline', value)} />
        <ThesisScaleSelector selected={scales} onChange={setScales} />
        <TextField label="Short explanation" value={form.short_explanation} onChange={(value) => set('short_explanation', value)} multiline />
        <TextField label="Body" value={form.body} onChange={(value) => set('body', value)} multiline rows={8} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status"><select value={form.status} onChange={(event) => set('status', event.target.value)} className={inputClass}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
          <TextField label="Display order" value={String(form.display_order)} onChange={(value) => set('display_order', Number(value))} type="number" />
        </div>
        <label className="flex items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={form.is_featured} onChange={(event) => set('is_featured', event.target.checked)} /> Featured</label>

        <div className="block text-sm font-medium text-zinc-300">
          <span className="mb-1.5 block">Images</span>
          <div className="grid grid-cols-3 gap-3">
            {media.map((item) => (
              <div key={item.id} className={`overflow-hidden rounded-md border ${item.is_featured ? 'border-amber-500' : 'border-white/10'}`}>
                <img src={item.file_url} alt={item.alt_text || ''} className="h-24 w-full object-cover" />
                <div className="flex gap-1 p-1.5">
                  <button type="button" onClick={() => setFeaturedImage(item)} disabled={!!mediaBusy || item.is_featured} className="flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-xs text-amber-300 hover:bg-amber-400/10 disabled:opacity-40">
                    <Star className={`h-3.5 w-3.5 ${item.is_featured ? 'fill-amber-400' : ''}`} /> {item.is_featured ? 'Feature image' : 'Set feature'}
                  </button>
                  <button type="button" onClick={() => deleteImage(item)} disabled={!!mediaBusy} className="rounded px-2 py-1 text-red-400 hover:bg-red-400/10 disabled:opacity-40" aria-label="Delete image"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          {media.length < 3 && <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm"><Upload className="h-4 w-4" /> Upload<input type="file" accept="image/*" multiple className="hidden" onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, Math.max(0, 3 - media.length)))} /></label>}
        </div>

        {error && <p className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</p>}
        <button onClick={save} disabled={saving} className="rounded-md bg-amber-600 px-5 py-2.5 font-medium text-white hover:bg-amber-500 disabled:opacity-50">{saving ? 'Saving...' : 'Update Thesis'}</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-medium text-zinc-300"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function TextField({ label, value, onChange, multiline = false, rows = 3, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; rows?: number; type?: string }) {
  return <Field label={label}>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className={`${inputClass} resize-none`} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />}</Field>;
}