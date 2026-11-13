import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import InstituteLogo from '../components/InstituteLogo';
import CookieSettingsLink from '../components/privacy/CookieSettingsLink';
import { useAwardSiteContent } from '../providers/AwardSiteContentProvider';
import { NOMINATION_RAYS } from '../content/nominationContent';
import { PRINCIPLE_KEYS } from '../content/homeV3Content';
import { supabase } from '../lib/supabase';
import { safeWebUrl, type AcknowledgementNomination } from '../lib/acknowledgements';
import poster from '../assets/homepage-preview-waves.jpg';
import waves from '../assets/homepage-preview-waves.mp4';
import './homePreview.css';

const footerLinks = [
  ['About the Institute', '/about'], ['Principles', '/principles'],
  ['Acknowledgements', '/acknowledgement'], ['Chapters', '/chapters'],
  ['Team', '/team'], ['Cases', '/thesis'], ['Voices', '/voices'],
  ['Assembly', '/assembly'], ['Expeditions', '/expeditions'],
  ['The Award', '/award'], ['Partners', '/partners'], ['Contact', '/contact'],
];

function Waves() {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPlay(!preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return <div className="home-preview-wave" aria-hidden="true">
    <img src={poster} alt="" fetchPriority="high" />
    {play && <video src={waves} poster={poster} autoPlay muted playsInline />}
  </div>;
}

function Principles({ full = false }: { full?: boolean }) {
  const { get, translate: tr } = useAwardSiteContent();
  const PrincipleHeading = full ? 'h2' : 'h3';
  return <section className="home-preview-section" aria-labelledby="preview-principles">
    {full
      ? <h1 id="preview-principles">{tr('The Five Principles')}</h1>
      : <h2 id="preview-principles">{tr('The Five Principles')}</h2>}
    <ol className="home-preview-principles">
      {PRINCIPLE_KEYS.map(key => {
        const principle = get(key);
        if (!principle) return null;
        return <li key={key}>
          <PrincipleHeading className="home-preview-principle-name">{principle.label}</PrincipleHeading>
          <div>
            <p>{principle.headline}</p>
            {principle.subheadline && <p>{principle.subheadline}</p>}
            {full && principle.body && <p>{principle.body}</p>}
          </div>
        </li>;
      })}
    </ol>
    {!full && <Link className="home-preview-link" to="/principles">{tr('Explore the principles')}</Link>}
  </section>;
}

function Acknowledgements() {
  const { translate: tr } = useAwardSiteContent();
  const [items, setItems] = useState<AcknowledgementNomination[]>([]);
  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.rpc('list_acknowledgements', { p_offset: 0, p_limit: 2 });
      if (active && data) setItems(data);
    }
    void load();
    return () => { active = false; };
  }, []);

  return <section className="home-preview-section" aria-labelledby="preview-acknowledgements">
    <h2 id="preview-acknowledgements">{tr('Beautiful Success already exists')}</h2>
    {items.length > 0 && <div className="home-preview-stories">
      {items.map(item => {
        const photo = safeWebUrl(item.image_url ?? '');
        return <article key={item.id}>
          {photo && <img src={photo} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />}
          <div><h3>{item.company_name}</h3><p>{tr(item.description)}</p></div>
        </article>;
      })}
    </div>}
    <Link className="home-preview-link" to="/acknowledgement">{tr('See all acknowledgements')}</Link>
  </section>;
}

function PreviewLayout({ children, home = false }: { children: ReactNode; home?: boolean }) {
  const { translate: tr } = useAwardSiteContent();
  return <div className="home-preview">
    <header className="home-preview-wrap home-preview-header">
      <Link to={home ? '/' : '/b'}><InstituteLogo tone="positive" /></Link>
    </header>
    <main className="home-preview-wrap">{children}</main>
    <footer className="home-preview-footer">
      <div className="home-preview-wrap">
        <nav aria-label={tr('Footer')}>{footerLinks.map(([label, path]) => <Link key={path} to={path}>{tr(label)}</Link>)}</nav>
        <div className="home-preview-meta">
          <span>© {new Date().getFullYear()} {tr('Institute of Beautiful Success')}</span>
          <Link to="/legal">{tr('Legal')}</Link>
          <Link to="/login">{tr('Log in')}</Link>
          <CookieSettingsLink />
        </div>
      </div>
    </footer>
  </div>;
}

export default function HomePreviewPage() {
  const { translate: tr } = useAwardSiteContent();
  return <PreviewLayout home>
    <section className="home-preview-hero">
      <h1>{tr('Let’s change what the world celebrates as success.')}</h1>
      <Waves />
    </section>
    <Principles />
    <Acknowledgements />
  </PreviewLayout>;
}

export function PrinciplesPreviewPage() {
  const { translate: tr } = useAwardSiteContent();
  return <PreviewLayout>
    <Principles full />
    <section className="home-preview-section">
      <h2>{tr('The Seven Rays of Impact')}</h2>
      <p>{tr('The rays describe the different scales at which a contribution can make a difference.')}</p>
      <ul className="home-preview-rays">{NOMINATION_RAYS.map(([id, label]) => <li key={id}>{tr(label)}</li>)}</ul>
    </section>
  </PreviewLayout>;
}
