import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNominationMode } from '../../providers/NominationModeProvider';
import { NOMINATION_RAYS, PRINCIPLE_IDS } from '../../content/nominationContent';
import { safeWebUrl, type AcknowledgementNomination } from '../../lib/acknowledgements';
import ReadingDialog from '../../components/acknowledgement/ReadingDialog';
import './acknowledgement.css';

export default function AcknowledgementPage() {
  const { mode } = useNominationMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<AcknowledgementNomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async (offset = 0) => {
    setLoading(true); setError('');
    const { data, error } = await supabase.rpc('list_acknowledgements', { p_offset: offset, p_limit: 24 });
    if (error) setError('We could not load the nominations. Please try again.');
    else { setItems(previous => offset ? [...previous, ...data] : data); setMore(data.length === 24); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load, user?.id]);
  async function vote(item: AcknowledgementNomination, direction: number) {
    if (!user) { navigate('/login?returnTo=/acknowledgement'); return; }
    if (busy) return;
    setBusy(item.id); setError('');
    const value = item.my_vote === direction ? 0 : direction;
    const { error } = await supabase.rpc('vote_acknowledgement', { p_nomination_id: item.id, p_value: value });
    if (error) setError('Your vote could not be saved. Please try again.');
    else setItems(previous => previous.map(row => row.id === item.id ? {
      ...row, my_vote: value,
      upvotes: Number(row.upvotes) - Number(row.my_vote === 1) + Number(value === 1),
      downvotes: Number(row.downvotes) - Number(row.my_vote === -1) + Number(value === -1),
    } : row));
    setBusy(null);
  }
  const selected = items.find(item => item.id === selectedId);
  const voteControls = (item: AcknowledgementNomination) => <div className="ack-votes" aria-label={`Votes for ${item.company_name}`}>
    <span className="ack-vote-label">Community vote</span>
    <button aria-label={`Upvote ${item.company_name}: ${item.upvotes} votes`} aria-pressed={item.my_vote === 1} disabled={!!busy} onClick={() => void vote(item,1)}><ArrowUp size={18} />{item.upvotes}</button>
    <button aria-label={`Downvote ${item.company_name}: ${item.downvotes} votes`} aria-pressed={item.my_vote === -1} disabled={!!busy} onClick={() => void vote(item,-1)}><ArrowDown size={18} />{item.downvotes}</button>
    {busy === item.id && <span role="status">Saving…</span>}
  </div>;
  return <main className="ack-page">
    <section className="ack-hero">
      <p className="ibs-eyebrow">Beautiful Success · Acknowledgement</p>
      <h1>Good companies.<br /><em>Beautiful impact.</em></h1>
      <div className="ack-hero-bottom"><p>Discover companies making a difference through the principles of Beautiful Success. Share a nomination. Add your vote.</p>
        <div className="ack-hero-actions">{mode === 'acknowledgement' && <Link className="award-button" to="/acknowledgement/nominate">Nominate a company <ArrowUpRight size={18} /></Link>}{user && <Link className="ack-my-link" to="/acknowledgement/mine">My submissions</Link>}</div>
      </div>
    </section>
    <section className="ack-gallery" aria-label="Company nominations">
      <div className="ack-gallery-heading"><div><p className="ibs-eyebrow">The community’s nominations</p><h2>Success worth seeing.</h2></div><p>Newest first · Upvote or downvote<br />{user ? 'One vote per company. Change it anytime.' : 'Everyone can browse. Sign in to vote.'}</p></div>
      {error && <div role="alert" className="ack-notice">{error} <button onClick={() => void load()}>Try again</button></div>}
      {!loading && !error && !items.length && <div className="ack-empty"><h3>Who should be here?</h3><p>Bring a company’s contribution into view. The first nomination could be yours.</p>{mode === 'acknowledgement' && <Link to="/acknowledgement/nominate">Nominate a company →</Link>}</div>}
      <div className="ack-stack">{items.map(item => <article className="ack-card ack-feature" key={item.id}>
        <div className="ack-card-image">{safeWebUrl(item.image_url) ? <img src={safeWebUrl(item.image_url)} alt={item.company_name} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <span aria-hidden="true">{item.company_name.slice(0,1)}</span>}</div>
        <div className="ack-card-body"><div className="ack-tags"><span>Ray of impact · {NOMINATION_RAYS.find(([id]) => id === item.ray)?.[1] || item.ray}</span></div>
          <h3>{item.company_name}</h3><p className="ack-preview">{item.description}</p>
          <div className="ack-entry-actions"><button className="ack-read" onClick={() => setSelectedId(item.id)} aria-label={`Read the full nomination for ${item.company_name}`} aria-haspopup="dialog">Read the nomination <ArrowUpRight size={17} /></button>{safeWebUrl(item.website || '') && <a className="ack-website" href={safeWebUrl(item.website || '')} target="_blank" rel="noopener noreferrer">Company website ↗</a>}</div>
          {voteControls(item)}
        </div>
      </article>)}</div>
      {loading && <p role="status">Loading nominations…</p>}
      {more && <button className="award-button ack-more" disabled={loading} onClick={() => void load(items.length)}>Show more companies</button>}
    </section>
    {selected && <ReadingDialog title={selected.company_name} eyebrow={`Ray of impact · ${NOMINATION_RAYS.find(([id]) => id === selected.ray)?.[1] || selected.ray}`} onClose={() => setSelectedId(null)}>
      {safeWebUrl(selected.image_url) && <div className="ack-reading-image"><img src={safeWebUrl(selected.image_url)} alt={selected.company_name} /></div>}
      <p className="ack-reading-intro">{selected.description}</p>
      {PRINCIPLE_IDS.some(id => selected.principles[id]?.trim()) && <nav className="ack-reading-nav" aria-label="Principles in this nomination">{PRINCIPLE_IDS.filter(id => selected.principles[id]?.trim()).map(id => <button type="button" key={id} onClick={() => document.getElementById(`reading-${id}`)?.scrollIntoView({ block: 'start' })}>{id}</button>)}</nav>}
      {PRINCIPLE_IDS.filter(id => selected.principles[id]?.trim()).map(id => <section id={`reading-${id}`} className="ack-reading-principle" key={id}><h3>{id}</h3><p>{selected.principles[id]}</p></section>)}
      {safeWebUrl(selected.website || '') && <a className="ack-reading-website" href={safeWebUrl(selected.website || '')} target="_blank" rel="noopener noreferrer">Visit company website <ArrowUpRight size={17} /></a>}
      {error && <p role="alert" className="ack-notice">{error}</p>}
      {voteControls(selected)}<p className="ack-vote-note">Votes are community input. The Institute decides which companies receive an acknowledgement.</p>
    </ReadingDialog>}
  </main>;
}
