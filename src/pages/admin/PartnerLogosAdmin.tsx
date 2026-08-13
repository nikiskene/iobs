// src/pages/admin/PartnerLogosAdmin.tsx
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PARTNER_ROLES, partnerRole, type PartnerRole } from '../../content/partnerRoles';

type Logo = { id:string; section_key:string; media_url:string; media_path:string|null; display_order:number; subheadline:string|null };

export default function PartnerLogosAdmin() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data, error: loadError } = await supabase.from('homepage_sections').select('id,section_key,media_url,media_path,display_order,subheadline').like('section_key', 'partner_logo_%').order('display_order');
    if (loadError) setError(loadError.message); else setLogos((data as Logo[]) || []);
  }

  useEffect(() => { load(); }, []);

  async function upload(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Logo files must be smaller than 5 MB.'); return; }
    setBusy(true); setError('');
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const path = `partners/${crypto.randomUUID()}-${safeName}`;
    const stored = await supabase.storage.from('homepage-media').upload(path, file);
    if (stored.error) { setError(stored.error.message); setBusy(false); return; }
    const mediaUrl = supabase.storage.from('homepage-media').getPublicUrl(path).data.publicUrl;
    const inserted = await supabase.from('homepage_sections').insert({ section_key: `partner_logo_${crypto.randomUUID()}`, subheadline: 'principal', media_url: mediaUrl, media_path: path, display_order: logos.length, is_active: true });
    if (inserted.error) { await supabase.storage.from('homepage-media').remove([path]); setError(inserted.error.message); }
    await load(); setBusy(false);
  }

  async function remove(logo: Logo) {
    if (!window.confirm('Remove this partner logo?')) return;
    setBusy(true); setError('');
    const { error: deleteError } = await supabase.from('homepage_sections').delete().eq('id', logo.id);
    if (!deleteError && logo.media_path) await supabase.storage.from('homepage-media').remove([logo.media_path]);
    if (deleteError) setError(deleteError.message); else await load();
    setBusy(false);
  }

  async function setRole(id: string, role: PartnerRole) {
    setBusy(true); setError('');
    const { error: updateError } = await supabase.from('homepage_sections').update({ subheadline: role }).eq('id', id);
    if (updateError) setError(updateError.message); else setLogos((items) => items.map((item) => item.id === id ? { ...item, subheadline: role } : item));
    setBusy(false);
  }

  async function move(index: number, direction: -1 | 1) {
    const otherIndex = index + direction;
    if (!logos[otherIndex]) return;
    setBusy(true); setError('');
    const current = logos[index]; const other = logos[otherIndex];
    const results = await Promise.all([
      supabase.from('homepage_sections').update({ display_order: other.display_order }).eq('id', current.id),
      supabase.from('homepage_sections').update({ display_order: current.display_order }).eq('id', other.id),
    ]);
    const updateError = results.find((result) => result.error)?.error;
    if (updateError) setError(updateError.message); else await load();
    setBusy(false);
  }

  return <div className="space-y-7">
    <div><p className="text-sm uppercase tracking-[.3em] text-zinc-500">Public website</p><h1 className="mt-3 text-3xl font-semibold text-white">Partner logos</h1><p className="mt-2 text-sm text-zinc-400">Upload and order the logos displayed above the public footer.</p></div>
    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-black ${busy ? 'pointer-events-none opacity-50' : ''}`}><Upload className="h-4 w-4" />{busy ? 'Working…' : 'Upload logo'}<input className="hidden" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); event.target.value = ''; }} /></label>
    {error && <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
    {!logos.length ? <p className="rounded-xl border border-white/10 p-6 text-zinc-500">No partner logos yet. The public stripe stays hidden until the first upload.</p> : <div className="grid gap-3">{logos.map((logo, index) => <article key={logo.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/[.03] p-4"><div className="flex h-20 min-w-52 flex-1 items-center justify-center rounded-lg bg-zinc-900 p-3"><img src={logo.media_url} alt="Partner logo preview" className="h-14 w-40 object-contain" /></div><select aria-label="Partner category" value={partnerRole(logo.subheadline)} disabled={busy} onChange={(event) => setRole(logo.id, event.target.value as PartnerRole)} className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white">{PARTNER_ROLES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><div className="flex gap-1"><button aria-label="Move up" disabled={busy || index === 0} onClick={() => move(index, -1)} className="rounded-md p-2 text-zinc-300 hover:bg-white/10 disabled:opacity-20"><ArrowUp className="h-4 w-4" /></button><button aria-label="Move down" disabled={busy || index === logos.length - 1} onClick={() => move(index, 1)} className="rounded-md p-2 text-zinc-300 hover:bg-white/10 disabled:opacity-20"><ArrowDown className="h-4 w-4" /></button><button aria-label="Remove" disabled={busy} onClick={() => remove(logo)} className="rounded-md p-2 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>}
  </div>;
}
