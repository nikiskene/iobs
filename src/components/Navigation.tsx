// src/components/Navigation.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, LogOut, Menu, Shield, User, X } from 'lucide-react';

import { useUnreadMessages } from '../hooks/messaging/useUnreadMessages';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

type NavLinkItem = {
  to: string;
  label: string;
  badge?: number;
};

export default function Navigation() {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useUnreadMessages();

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('logo_url')
        .eq('is_active', true)
        .maybeSingle();

      setLogoUrl(data?.logo_url || null);
    }

    fetchSettings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const publicLinks: NavLinkItem[] = [
    { to: '/thesis', label: 'Thesis' },
    { to: '/expeditions', label: 'Expeditions' },
    { to: '/events', label: 'Events' },
    ...(!user ? [{ to: '/join', label: 'Join' }] : []),
  ];

  const userLinks: NavLinkItem[] = user
    ? [
        { to: '/dashboard/explorers', label: 'Explorers' },
        { to: '/dashboard/inbox', label: 'Inbox', badge: unreadCount },
      ]
    : [];

  const links = [...publicLinks, ...userLinks];

  function isActive(path: string) {
    return path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo logoUrl={logoUrl} />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavItem key={link.to} link={link} isActive={isActive(link.to)} />
          ))}

          <div className="ml-3 h-5 w-px bg-white/10" />

          {user ? (
            <ProfileMenu
              refElement={menuRef}
              open={profileOpen}
              onToggle={() => setProfileOpen((current) => !current)}
              onLogout={handleLogout}
              name={profile?.full_name || 'Explorer'}
              email={user.email || null}
              photoUrl={profile?.photo_url || null}
              isAdmin={isAdmin}
            />
          ) : (
            <SignInLink />
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="text-zinc-400 hover:text-white md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <MobileMenu
          links={links}
          isActive={isActive}
          user={Boolean(user)}
          isAdmin={isAdmin}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </nav>
  );
}

function Logo({ logoUrl }: { logoUrl: string | null }) {
  return (
    <Link to="/" className="group flex items-center gap-2">
      {logoUrl ? (
        <img src={logoUrl} alt="WorldOS" className="h-10 w-auto object-contain" />
      ) : (
        <Globe className="h-6 w-6 text-sky-400 transition-colors group-hover:text-sky-300" />
      )}
    </Link>
  );
}

function NavItem({ link, isActive }: { link: NavLinkItem; isActive: boolean }) {
  return (
    <Link
      to={link.to}
      className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span>{link.label}</span>

      {link.badge !== undefined && link.badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {link.badge}
        </span>
      )}
    </Link>
  );
}

function ProfileMenu({
  refElement,
  open,
  onToggle,
  onLogout,
  name,
  email,
  photoUrl,
  isAdmin,
}: {
  refElement: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  onToggle: () => void;
  onLogout: () => void;
  name: string;
  email: string | null;
  photoUrl: string | null;
  isAdmin: boolean;
}) {
  const initial = (name?.[0] || email?.[0] || '?').toUpperCase();

  return (
    <div ref={refElement} className="relative ml-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-700 text-xs font-medium text-white">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>

        <span className="hidden lg:inline">{name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            {email && <p className="mt-0.5 truncate text-xs text-zinc-500">{email}</p>}
          </div>

          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function SignInLink() {
  return (
    <Link
      to="/login"
      className="ml-3 rounded-md bg-sky-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-400"
    >
      Sign In
    </Link>
  );
}

function MobileMenu({
  links,
  isActive,
  user,
  isAdmin,
  onClose,
  onLogout,
}: {
  links: NavLinkItem[];
  isActive: (path: string) => boolean;
  user: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-1 border-t border-white/5 bg-[#0A0A0A] px-6 py-4 md:hidden">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onClose}
          className={`block rounded-md px-3 py-2 text-sm transition-colors ${
            isActive(link.to)
              ? 'bg-white/10 text-white'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{link.label}</span>

            {link.badge !== undefined && link.badge > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold leading-none text-white">
                {link.badge}
              </span>
            )}
          </div>
        </Link>
      ))}

      {user ? (
        <>
          <Link
            to="/dashboard/profile"
            onClick={onClose}
            className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Profile
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              Admin
            </Link>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
          >
            Log out
          </button>
        </>
      ) : (
        <Link
          to="/login"
          onClick={onClose}
          className="block rounded-md px-3 py-2 text-sm text-sky-400 hover:text-sky-300"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}