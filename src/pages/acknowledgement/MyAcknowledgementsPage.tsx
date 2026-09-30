import { useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { AcknowledgementNomination } from '../../lib/acknowledgements';
import './acknowledgement.css';

export default function MyAcknowledgementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AcknowledgementNomination[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  useEffect(() => { if (user) void supabase.from('acknowledgement_nominations').select('*').eq('submitted_by', user.id).order('created_at', { ascending: false }).then(({ data, error }) => { if (error) setError('Your submissions could not be loaded.'); else setItems(data as AcknowledgementNomination[]); }); }, [user]);
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
    else setItems(current => current.map(row => row.id === item.id ? { ...row, image_url: imageUrl } : row));
    setUploading(null);
  }
  if (!user) return <main className="ack-page ack-hero"><h1>Sign in to see<br /><em>your submissions.</em></h1><Link className="award-button" to="/login?returnTo=/acknowledgement/mine">Sign in</Link></main>;
  return <main className="ack-page"><section className="ack-hero"><Link className="ack-back" to="/acknowledgement">← All acknowledgements</Link><p className="ibs-eyebrow">Your submissions</p><h1>Keep each entry<br /><em>complete.</em></h1><p>Add or replace the image while your nomination is awaiting review. Updating an approved entry sends it back for review.</p></section><section className="ack-gallery"><div className="ack-grid">{items.map(item => <article className="ack-card" key={item.id}><div className="ack-card-image">{item.image_url ? <img src={item.image_url} alt={item.company_name} /> : <span>{item.company_name.slice(0,1)}</span>}</div><div className="ack-card-body"><h3>{item.company_name}</h3><p>{item.is_visible ? 'Approved and public' : 'Awaiting Institute review'}</p><label className="ack-my-link">{uploading === item.id ? 'Saving image…' : 'Add or replace image'}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={!!uploading} onChange={event => void addImage(item, event)} /></label></div></article>)}</div>{!items.length && !error && <p>You have not submitted a company yet.</p>}{error && <p role="alert">{error}</p>}</section></main>;
}
