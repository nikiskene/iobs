import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { NARRATIVE_MAX_LENGTH, narrativeLimitError, NOMINATION_RAYS, PRINCIPLE_IDS } from '../../content/nominationContent';
import type { AcknowledgementNomination } from '../../lib/acknowledgements';
import './acknowledgement.css';

export default function MyAcknowledgementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AcknowledgementNomination[]>([]);
  const [editing, setEditing] = useState<AcknowledgementNomination | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  useEffect(() => { if (user) void supabase.from('acknowledgement_nominations').select('*').eq('submitted_by', user.id).order('created_at', { ascending: false }).then(({ data, error }) => { if (error) setError('Your submissions could not be loaded.'); else setItems(data as AcknowledgementNomination[]); }); }, [user]);
  function updateDraft(field: keyof AcknowledgementNomination, value: unknown) { setEditing(current => current ? { ...current, [field]: value } : current); }
  function updatePrinciple(id: string, value: string) { setEditing(current => current ? { ...current, principles: { ...current.principles, [id]: value } } : current); }
  async function addImage(item: AcknowledgementNomination, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !user) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3145728) { setError('Choose a JPG, PNG or WebP image up to 3 MB.'); return; }
    setUploading(item.id); setError('');
    const path = `${user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
    const upload = await supabase.storage.from('acknowledgement-images').upload(path, file);
    if (upload.error) { setError('The image could not be uploaded.'); setUploading(null); return; }
    const imageUrl = supabase.storage.from('acknowledgement-images').getPublicUrl(path).data.publicUrl;
    const result = await supabase.rpc('update_my_acknowledgement', { p_id: item.id, p_company_name: item.company_name, p_website: item.website || '', p_image_url: imageUrl, p_description: item.description, p_ray: item.ray, p_principles: item.principles });
    if (result.error) setError('The image could not be saved.');
    else { setItems(current => current.map(row => row.id === item.id ? { ...row, image_url: imageUrl, is_visible: false } : row)); setEditing(current => current?.id === item.id ? { ...current, image_url: imageUrl, is_visible: false } : current); }
    setUploading(null);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    if (!Object.values(editing.principles).some(value => value.trim())) { setError('Answer at least one Beautiful Success principle.'); return; }
    const limitError = narrativeLimitError(editing.description, editing.principles);
    if (limitError) { setError(limitError); return; }
    setSaving(true); setError('');
    const result = await supabase.rpc('update_my_acknowledgement', { p_id: editing.id, p_company_name: editing.company_name, p_website: editing.website || '', p_image_url: editing.image_url || '', p_description: editing.description, p_ray: editing.ray, p_principles: editing.principles });
    if (result.error) setError('Your submission could not be saved. Please check the required fields.');
    else { const saved = { ...editing, is_visible: false }; setItems(current => current.map(item => item.id === saved.id ? saved : item)); setEditing(null); }
    setSaving(false);
  }
  if (!user) return <main className="ack-page ack-hero"><h1>Sign in to see<br /><em>your submissions.</em></h1><Link className="award-button" to="/login?returnTo=/acknowledgement/mine">Sign in</Link></main>;
  return <main className="ack-page"><section className="ack-hero"><Link className="ack-back" to="/acknowledgement">← All acknowledgements</Link><p className="ibs-eyebrow">Your submissions</p><h1>Keep each entry<br /><em>complete.</em></h1><p>Edit your company details, impact answers and image. Any change returns an approved entry to Institute review.</p></section><section className="ack-gallery"><div className="ack-grid">{items.map(item => <article className="ack-card" key={item.id}><div className="ack-card-image">{item.image_url ? <img src={item.image_url} alt={item.company_name} /> : <span>{item.company_name.slice(0, 1)}</span>}</div><div className="ack-card-body">{editing?.id === item.id ? <form className="ack-edit" onSubmit={save}><label>Company name<input required value={editing.company_name} onChange={event => updateDraft('company_name', event.target.value)} /></label><label>Company website<input required type="url" value={editing.website || ''} onChange={event => updateDraft('website', event.target.value)} /></label><p className="nomination-help">Up to 3,000 characters per narrative answer.</p><label>Short description<textarea maxLength={NARRATIVE_MAX_LENGTH} required rows={3} value={editing.description} onChange={event => updateDraft('description', event.target.value)} /></label><label>Ray of impact<select value={editing.ray} onChange={event => updateDraft('ray', event.target.value)}>{NOMINATION_RAYS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><fieldset><legend>Beautiful Success principles</legend>{PRINCIPLE_IDS.map(id => <label key={id}>{id}<textarea maxLength={NARRATIVE_MAX_LENGTH} rows={3} value={editing.principles[id] || ''} onChange={event => updatePrinciple(id, event.target.value)} /></label>)}</fieldset><div className="ack-edit-actions"><button type="button" onClick={() => setEditing(null)}>Cancel</button><button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div></form> : <><h3>{item.company_name}</h3><p>{item.is_visible ? 'Approved and public' : 'Awaiting Institute review'}</p><div className="ack-edit-actions"><button type="button" onClick={() => { setError(''); setEditing(item); }}>Edit submission</button><label>{uploading === item.id ? 'Saving image…' : 'Replace image'}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={!!uploading} onChange={event => void addImage(item, event)} /></label></div></>}</div></article>)}</div>{!items.length && !error && <p>You have not submitted a company yet.</p>}{error && <p role="alert">{error}</p>}</section></main>;
}
