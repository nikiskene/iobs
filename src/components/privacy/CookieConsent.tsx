import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../providers/LocaleProvider';
import { COOKIE_COPY } from '../../content/cookieCopy';
import type { ConsentPreference } from '../../lib/privacy/consent';
import './cookieConsent.css';

type Props = { preference:ConsentPreference|null; settings:boolean; onCustomize:()=>void; onClose:()=>void; onChoose:(analytics:boolean)=>void };
export default function CookieConsent({preference,settings,onCustomize,onClose,onChoose}:Props) {
  const {locale} = useLocale(); const copy = COOKIE_COPY[locale === 'ar' ? 'ar' : 'en'];
  return <>
    {!preference && !settings && <section className="iobs-cookie-banner" aria-label={copy.title}>
      <div><h2>{copy.title}</h2><p>{copy.intro} <Link to="/legal#cookies">{copy.privacy}</Link></p></div>
      <div className="iobs-cookie-actions">
        <button type="button" onClick={()=>onChoose(true)}>{copy.accept}</button>
        <button type="button" onClick={()=>onChoose(false)}>{copy.reject}</button>
        <button type="button" onClick={onCustomize}>{copy.customize}</button>
      </div>
    </section>}
    {settings && <Settings key={String(preference?.savedAt)} copy={copy} analytics={preference?.analytics === true} onClose={onClose} onChoose={onChoose} />}
  </>;
}
function Settings({copy,analytics,onClose,onChoose}:{copy:typeof COOKIE_COPY.en;analytics:boolean;onClose:()=>void;onChoose:(analytics:boolean)=>void}) {
  const [enabled,setEnabled] = useState(analytics);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    ref.current?.showModal(); document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=overflow;opener?.focus();};
  },[]);
  return <dialog ref={ref} className="iobs-cookie-dialog" aria-labelledby="iobs-cookie-title" onCancel={event=>{event.preventDefault();onClose();}}>
    <header><h2 id="iobs-cookie-title">{copy.settings}</h2><button type="button" className="iobs-cookie-close" aria-label={copy.close} onClick={onClose}>×</button></header>
    <p>{copy.intro}</p>
    <div className="iobs-cookie-option"><label><input type="checkbox" checked disabled />{copy.necessary}<span>{copy.always}</span></label><p>{copy.necessaryBody}</p></div>
    <div className="iobs-cookie-option"><label><input type="checkbox" checked={enabled} onChange={event=>setEnabled(event.target.checked)} />{copy.analytics}</label><p>{copy.analyticsBody}</p></div>
    <p>{copy.duration}</p><Link to="/legal#cookies" onClick={onClose}>{copy.privacy}</Link>
    <div className="iobs-cookie-actions">
      <button type="button" onClick={()=>onChoose(enabled)}>{copy.save}</button>
      <button type="button" onClick={()=>onChoose(false)}>{copy.reject}</button>
    </div>
  </dialog>;
}
