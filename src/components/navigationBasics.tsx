// src/components/navigationBasics.tsx
import { Link } from 'react-router-dom';
import { Globe, LogOut, Shield, User } from 'lucide-react';

export type NavLinkItem = { to: string; label: string; badge?: number };

export function Logo({ logoUrl, label = 'WorldOS' }: { logoUrl: string | null; label?: string }) {
  return <Link to="/" className="group flex items-center gap-2">{logoUrl ? <img src={logoUrl} alt={label} className="h-12 w-auto object-contain" /> : <Globe className="h-6 w-6 text-amber-400 group-hover:text-amber-300" />}</Link>;
}

export function NavItem({ link, active }: { link: NavLinkItem; active: boolean }) {
  return <Link to={link.to} className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
    <span>{link.label}</span>
    {!!link.badge && <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{link.badge}</span>}
  </Link>;
}

export function ProfileMenu({ refElement, open, onToggle, onLogout, name, email, photoUrl, isAdmin }: {
  refElement: React.RefObject<HTMLDivElement>; open: boolean; onToggle: () => void; onLogout: () => void;
  name: string; email: string | null; photoUrl: string | null; isAdmin: boolean;
}) {
  const initial = (name?.[0] || email?.[0] || '?').toUpperCase();
  return <div ref={refElement} className="relative ml-3">
    <button type="button" onClick={onToggle} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-700 text-xs font-medium text-white">{photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : initial}</span>
      <span className="hidden lg:inline">{name}</span>
    </button>
    {open && <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl">
      <div className="border-b border-white/10 px-4 py-3"><p className="truncate text-sm font-medium text-white">{name}</p>{email && <p className="mt-0.5 truncate text-xs text-zinc-500">{email}</p>}</div>
      <Link to="/dashboard/profile" className={menuClass}><User className="h-4 w-4" />Profile</Link>
      {isAdmin && <Link to="/admin" className={menuClass}><Shield className="h-4 w-4" />Admin</Link>}
      <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"><LogOut className="h-4 w-4" />Log out</button>
    </div>}
  </div>;
}

const menuClass = 'flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5';

export function SignInLink() {
  return <Link to="/login" className="ml-3 rounded-md bg-sky-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-400">Sign In</Link>;
}
