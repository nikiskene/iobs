// src/components/navigationMenus.tsx
import { Link } from 'react-router-dom';
import { ChevronDown, Clock, FileText, ScanLine, Telescope } from 'lucide-react';
import type { NavLinkItem } from './navigationBasics';

const identityLinks = [
  { to: '/admin/identity/daily-scan', label: 'Daily Scan', icon: ScanLine, note: 'What is changing today?' },
  { to: '/admin/identity/review', label: 'Review', icon: FileText, note: 'Approve the evidence.' },
  { to: '/admin/identity/method', label: 'METHOD', icon: Telescope, note: 'How WorldOS reads identity.' },
  { to: '/admin/identity/settings', label: 'Schedule', icon: Clock, note: 'Automation and retention.' },
];

export function IdentityMenu({ active }: { active: boolean }) {
  return <div className="group relative">
    <Link to="/admin/identity/daily-scan" className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm ${active ? 'bg-sky-500/10 text-sky-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>Identity<ChevronDown className="h-3.5 w-3.5" /></Link>
    <div className="invisible absolute right-0 top-full z-50 w-72 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111] p-2 shadow-2xl">
        {identityLinks.map(({ to, label, icon: Icon, note }) => <Link key={to} to={to} className="flex gap-3 rounded-lg p-3 hover:bg-white/5"><Icon className="mt-0.5 h-4 w-4 text-sky-400" /><span><span className="block text-sm text-white">{label}</span><span className="mt-0.5 block text-xs text-zinc-500">{note}</span></span></Link>)}
      </div>
    </div>
  </div>;
}

export function MobileMenu({ links, isActive, user, isAdmin, onClose, onLogout }: {
  links: NavLinkItem[]; isActive: (path: string) => boolean; user: boolean; isAdmin: boolean;
  onClose: () => void; onLogout: () => void;
}) {
  return <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/5 bg-[#0A0A0A] px-4 py-4 md:hidden">
    <div className="space-y-1">{links.map((link) => <MobileLink key={link.to} link={link} active={isActive(link.to)} onClose={onClose} />)}</div>
    {isAdmin && <div className="my-4 border-y border-white/5 py-4"><p className="mb-2 px-3 text-[10px] uppercase tracking-[0.25em] text-sky-500">Identity Research</p>{identityLinks.map((link) => <Link key={link.to} to={link.to} onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-zinc-300 hover:bg-white/5"><link.icon className="h-4 w-4 text-sky-400" />{link.label}</Link>)}</div>}
    {user ? <div className="space-y-1"><Link to="/dashboard/profile" onClick={onClose} className={mobileClass}>Profile</Link>{isAdmin && <Link to="/admin" onClick={onClose} className={mobileClass}>Admin dashboard</Link>}<button type="button" onClick={onLogout} className="block w-full rounded-md px-3 py-3 text-left text-sm text-red-300 hover:bg-red-500/10">Log out</button></div> : <Link to="/login" onClick={onClose} className="block px-3 py-3 text-sm text-sky-400">Sign In</Link>}
  </div>;
}

function MobileLink({ link, active, onClose }: { link: NavLinkItem; active: boolean; onClose: () => void }) {
  return <Link to={link.to} onClick={onClose} className={`${mobileClass} ${active ? 'bg-white/10 text-white' : ''}`}><span className="flex items-center justify-between"><span>{link.label}</span>{!!link.badge && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">{link.badge}</span>}</span></Link>;
}

const mobileClass = 'block rounded-md px-3 py-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white';
