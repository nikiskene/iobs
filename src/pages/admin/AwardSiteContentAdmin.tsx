// src/pages/admin/AwardSiteContentAdmin.tsx
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LANGUAGE_OPTIONS, type Locale } from '../../providers/LocaleProvider';
import { awardSiteDefaults } from '../../content/awardSiteTranslations';
import { arabicCmsCatalog } from '../../content/localizedCms';
import { localizedContentKey, type AwardSiteContent } from '../../providers/AwardSiteContentProvider';

const inputClass = 'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500';
const sectionLabels: Record<string,string> = { global:'Global', hero:'Homepage Hero', homepage:'Homepage Sections', homepage_v3:'Homepage V3', partners:'Partners', general:'General', translations:'CMS translations' };

export default function AwardSiteContentAdmin() {
  const [search, setSearch] = useState('');
  const [locale, setLocale] = useState<Locale>('en');
  const [rows, setRows] = useState<AwardSiteContent[]>([]);
  const [editing, setEditing] = useState<AwardSiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    const defaults: AwardSiteContent[] = [...awardSiteDefaults(locale), ...(locale === 'ar' ? arabicCmsCatalog.map((row,index) => ({ content_key:row.key,locale,section:'translations',label:row.source,headline:row.context,subheadline:null,body:row.translation,media_url:null,media_path:null,display_order:1000+index,is_active:true })) : [])];
    const query = supabase.from('award_site_content').select('*').order('display_order');
    const { data, error: loadError } = await (signal ? query.abortSignal(signal) : query);
    if (signal?.aborted) return;
    if (loadError) setError(loadError.message);
    const stored = (data as AwardSiteContent[]) || [];
    const known = new Set(defaults.map(row => localizedContentKey(row.content_key,locale)));
    const additional = stored.filter(row => row.locale === locale && !known.has(row.content_key)).map(row => ({...row,content_key:row.content_key.replace(/__ar$/, '')}));
    setRows([...defaults.map((fallback) => {
      const storedKey = localizedContentKey(fallback.content_key, locale);
      const match = stored.find((item) => item.content_key === storedKey);
      return match ? { ...match, content_key:fallback.content_key, locale } : fallback;
    }), ...additional]);
    setLoading(false);
  };

  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [locale]);
  const groups = useMemo(() => rows.filter(row => !search || [row.label,row.headline,row.body,row.content_key].some(value => value?.toLowerCase().includes(search.toLowerCase()))).reduce<Record<string,AwardSiteContent[]>>((acc,row) => { (acc[row.section] ||= []).push(row); return acc; }, {}), [rows,search]);
  if (editing) return <ContentEditor row={editing} locale={locale} onClose={() => { setEditing(null); load(); }} />;

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold">Site Copy</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">Edit the current Beautiful Success website in English and Arabic. Arabic CMS translations include chapters, team, events, expeditions and insights. Search by English source or Arabic text; save to override the built-in translation.</p></div>
      <label className="text-sm text-zinc-300"><span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-zinc-500">Language</span><select aria-label="Content language" className={inputClass} value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>{LANGUAGE_OPTIONS.map((option) => <option key={option.code} value={option.code} className="bg-zinc-900">{option.label}</option>)}</select></label>
    </div>
    <input className={`${inputClass} mt-6 max-w-xl`} placeholder="Search copy or translation…" aria-label="Search copy or translation" value={search} onChange={event => setSearch(event.target.value)} />
    {error && <p className="mt-5 rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</p>}
    {loading && <p className="mt-8 text-zinc-500">Loading...</p>}
    {!loading && Object.entries(groups).map(([section,items]) => <section key={section} className="mt-9"><h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">{sectionLabels[section] || section}</h2><div className="space-y-3">{items.map((row) => <button key={`${row.content_key}-${locale}`} onClick={() => setEditing(row)} className="flex w-full items-center justify-between gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-5 text-left hover:border-white/10"><span className="min-w-0"><span className="font-mono text-xs text-zinc-600">{row.content_key} · {locale.toUpperCase()}</span><strong className="mt-1 block text-white">{row.headline || row.label || 'Untitled'}</strong>{row.label && row.headline && <span className="mt-1 line-clamp-2 block text-sm text-zinc-500">{row.label}</span>}</span><Pencil className="h-4 w-4 shrink-0 text-zinc-500" /></button>)}</div></section>)}
  </div>;
}

function ContentEditor({ row, locale, onClose }: { row:AwardSiteContent; locale:Locale; onClose:()=>void }) {
  const [draft,setDraft] = useState(row); const [saving,setSaving] = useState(false); const [error,setError] = useState('');
  const set = (key:keyof AwardSiteContent,value:string|boolean|number|null) => setDraft((current) => ({...current,[key]:value}));
  const save = async () => {
    setSaving(true); setError('');
    const payload = { locale, content_key:localizedContentKey(row.content_key,locale), section:draft.section, label:draft.label || null, headline:draft.headline || null, subheadline:draft.subheadline || null, body:draft.body || null, media_url:draft.media_url || null, media_path:draft.media_path || null, display_order:draft.display_order, is_active:draft.is_active, updated_at:new Date().toISOString() };
    const { error:updateError } = await supabase.from('award_site_content').upsert(payload,{ onConflict:'content_key,locale' });
    if (updateError) { setError(updateError.message); setSaving(false); return; } onClose();
  };
  return <div><button onClick={onClose} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><X className="h-4 w-4" /> Back</button><p className="font-mono text-xs text-zinc-500">{row.content_key} · {locale.toUpperCase()}</p><h1 className="mt-2 text-2xl font-bold">Edit Site Copy</h1><div className="mt-6 max-w-3xl space-y-5">
    {row.section === 'translations' ? <Field label="English source (read only)"><textarea readOnly dir="ltr" rows={5} className={inputClass} value={draft.label || ''} /></Field> : <Field label="Label / eyebrow"><input dir={locale === 'ar' ? 'rtl' : 'ltr'} className={inputClass} value={draft.label || ''} onChange={(e) => set('label',e.target.value)} /></Field>}
    <Field label={row.section === 'translations' ? 'Source location' : 'Headline'}><textarea readOnly={row.section === 'translations'} dir={row.section === 'translations' ? 'ltr' : locale === 'ar' ? 'rtl' : 'ltr'} rows={3} className={`${inputClass} resize-none`} value={draft.headline || ''} onChange={(e) => set('headline',e.target.value)} /></Field>
    <Field label="Subheadline"><textarea dir={locale === 'ar' ? 'rtl' : 'ltr'} rows={2} className={`${inputClass} resize-none`} value={draft.subheadline || ''} onChange={(e) => set('subheadline',e.target.value)} /></Field>
    <Field label={row.section === 'translations' ? 'Arabic translation' : 'Body'}><textarea aria-label={row.section === 'translations' ? 'Arabic translation' : 'Body'} dir={locale === 'ar' ? 'rtl' : 'ltr'} rows={row.section === 'translations' ? 12 : 5} className={`${inputClass} resize-none`} value={draft.body || ''} onChange={(e) => set('body',e.target.value)} /></Field>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Section"><input readOnly={row.section === 'translations'} className={inputClass} value={draft.section} onChange={(e) => set('section',e.target.value)} /></Field><Field label="Display order"><input type="number" className={inputClass} value={draft.display_order} onChange={(e) => set('display_order',Number(e.target.value))} /></Field></div>
    <label className="flex items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={draft.is_active} onChange={(e) => set('is_active',e.target.checked)} /> Active</label>
    {error && <p className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</p>}
    <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-5 py-2.5 font-medium text-white hover:bg-amber-500 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save translation'}</button>
  </div></div>;
}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="block text-sm font-medium text-zinc-300"><span className="mb-1.5 block">{label}</span>{children}</label>;}
