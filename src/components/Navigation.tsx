// src/components/Navigation.tsx
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useUnreadMessages } from '../hooks/messaging/useUnreadMessages';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Logo, NavItem, ProfileMenu, SignInLink, type NavLinkItem } from './navigationBasics';
import { IdentityMenu, MobileMenu } from './navigationMenus';

export default function Navigation() {
  const { user, profile, isAdmin, hasTeamAccess } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = useUnreadMessages();

  useEffect(() => {
    supabase.from('site_settings').select('logo_url').eq('is_active', true).maybeSingle()
      .then(({ data }) => setLogoUrl(data?.logo_url || null));
  }, []);

  useEffect(() => {
    function closeProfile(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', closeProfile);
    return () => document.removeEventListener('mousedown', closeProfile);
  }, []);

  const publicLinks: NavLinkItem[] = [
    { to: '/thesis', label: 'Thesis' },
    { to: '/members', label: 'Members' },
    { to: '/expeditions', label: 'Expeditions' },
    { to: '/events', label: 'Events' },
    ...(!user ? [{ to: '/join', label: 'Join' }] : []),
  ];
  const userLinks: NavLinkItem[] = user ? [
    ...(hasTeamAccess ? [{ to: '/work', label: 'Work' }] : []),
    { to: '/dashboard/inbox', label: 'Inbox', badge: unreadCount },
  ] : [];
  const links = [...publicLinks, ...userLinks];
  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo logoUrl={logoUrl} />
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <NavItem key={link.to} link={link} active={isActive(link.to)} />)}
          {isAdmin && <IdentityMenu active={isActive('/admin/identity')} />}
          <div className="ml-3 h-5 w-px bg-white/10" />
          {user ? <ProfileMenu refElement={menuRef} open={profileOpen} onToggle={() => setProfileOpen((value) => !value)} onLogout={handleLogout} name={profile?.full_name || 'Explorer'} email={user.email || null} photoUrl={profile?.photo_url || null} isAdmin={isAdmin} /> : <SignInLink />}
        </div>
        <button type="button" onClick={() => setMobileOpen((value) => !value)} className="rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Toggle navigation">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {mobileOpen && <MobileMenu links={links} isActive={isActive} user={Boolean(user)} isAdmin={isAdmin} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />}
    </nav>
  );
}
