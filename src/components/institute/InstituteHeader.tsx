// src/components/institute/InstituteHeader.tsx

import { useEffect, useRef, useState } from 'react';
import { Briefcase, Inbox, LogIn, LogOut, Menu, Shield, User, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AWARD_ASSETS } from '../../content/awardAssets';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadMessages } from '../../hooks/messaging/useUnreadMessages';
import { supabase } from '../../lib/supabase';
import { optimizedImageUrl } from '../../lib/media';
import { LANGUAGE_OPTIONS, useLocale, type Locale } from '../../providers/LocaleProvider';

const PUBLIC_LINKS = [
  ['/about', 'The Institute'], ['/award', 'The Award'], ['/#principles', 'The Principles'],
  ['/#scale-of-impact', 'Scales of Impact'], ['/thesis', 'Insights'],
] as const;

export default function InstituteHeader() {
  const { locale, setLocale, t } = useLocale();
  const { user, profile, isAdmin, hasTeamAccess } = useAuth();
  const unreadCount = useUnreadMessages();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); setAccountOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setAccountOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  async function logout() { await supabase.auth.signOut(); setAccountOpen(false); navigate('/'); }
  const accountName = profile?.full_name || user?.email || 'Member';
  const initial = accountName.charAt(0).toUpperCase();

  return (
    <>
      <header className="institute-header">
        <Link className="institute-logo" to="/" aria-label="Institute of Beautiful Success">
          <img src={optimizedImageUrl(AWARD_ASSETS.circleDark, 120, 78, 120)} alt="" width="60" height="60" decoding="async" /><span>Institute of<br />Beautiful Success</span>
        </Link>
        <nav aria-label="Main navigation">
          {PUBLIC_LINKS.map(([to, label]) => <Link to={to} key={to}>{label}</Link>)}
        </nav>
        <div className="institute-header-actions">
          <select className="language-switcher" value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label="Language">
            {LANGUAGE_OPTIONS.map((option) => <option value={option.code} key={option.code}>{option.short}</option>)}
          </select>
          <Link className="enter-link" to="/nominate">{t('nav.nominate')}</Link>
          {user ? <div className="institute-account" ref={menuRef}>
            <button type="button" className="institute-account-trigger" onClick={() => setAccountOpen((open) => !open)} aria-label={`Open account menu for ${accountName}`} aria-expanded={accountOpen}>
              {profile?.photo_url ? <img src={profile.photo_url} alt="" /> : <span>{initial}</span>}{!!unreadCount && <b>{unreadCount > 9 ? '9+' : unreadCount}</b>}
            </button>
            {accountOpen && <AccountMenu name={accountName} isAdmin={isAdmin} hasTeamAccess={hasTeamAccess} unreadCount={unreadCount} logout={logout} />}
          </div> : <Link className="institute-login" to="/login" aria-label="Log in"><LogIn /></Link>}
          <button type="button" className="institute-menu-trigger" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle menu" aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
      </header>
      {mobileOpen && <div className="institute-mobile-nav">
        {PUBLIC_LINKS.map(([to, label]) => <Link to={to} key={to}>{label}</Link>)}
        <Link to="/nominate">{t('nav.nominate')}</Link>
        {user ? <><Link to="/dashboard/profile">Profile</Link><Link to="/dashboard/inbox">Inbox{unreadCount ? ` (${unreadCount})` : ''}</Link>{hasTeamAccess && <Link to="/work">Work</Link>}{isAdmin && <Link to="/admin">Admin</Link>}<button type="button" onClick={logout}>Log out</button></> : <Link to="/login">Log in</Link>}
      </div>}
    </>
  );
}

function AccountMenu({ name, isAdmin, hasTeamAccess, unreadCount, logout }: { name:string; isAdmin:boolean; hasTeamAccess:boolean; unreadCount:number; logout:()=>void }) {
  return <div className="institute-account-menu"><strong>{name}</strong><Link to="/dashboard/profile"><User /> Profile</Link><Link to="/dashboard/inbox"><Inbox /> Inbox {unreadCount ? `(${unreadCount})` : ''}</Link>{hasTeamAccess && <Link to="/work"><Briefcase /> Work</Link>}{isAdmin && <Link to="/admin"><Shield /> Admin</Link>}<button type="button" onClick={logout}><LogOut /> Log out</button></div>;
}
