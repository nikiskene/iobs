// src/components/navigationMenus.tsx
import { Link } from 'react-router-dom';
import type { NavLinkItem } from './navigationBasics';

export function MobileMenu({ links, isActive, user, isAdmin, onClose, onLogout }: {
  links: NavLinkItem[]; isActive: (path: string) => boolean; user: boolean; isAdmin: boolean;
  onClose: () => void; onLogout: () => void;
}) {
  return <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/5 bg-[#0A0A0A] px-4 py-4 lg:hidden">
    <div className="space-y-1">{links.map((link) => <MobileLink key={link.to} link={link} active={isActive(link.to)} onClose={onClose} />)}</div>
    {user ? <div className="space-y-1"><Link to="/dashboard/profile" onClick={onClose} className={mobileClass}>Profile</Link>{isAdmin && <Link to="/admin" onClick={onClose} className={mobileClass}>Admin dashboard</Link>}<button type="button" onClick={onLogout} className="block w-full rounded-md px-3 py-3 text-left text-sm text-red-300 hover:bg-red-500/10">Log out</button></div> : <Link to="/login" onClick={onClose} className="block px-3 py-3 text-sm text-sky-400">Sign In</Link>}
  </div>;
}

function MobileLink({ link, active, onClose }: { link: NavLinkItem; active: boolean; onClose: () => void }) {
  return <Link to={link.to} onClick={onClose} className={`${mobileClass} ${active ? 'bg-white/10 text-white' : ''}`}><span className="flex items-center justify-between"><span>{link.label}</span>{!!link.badge && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">{link.badge}</span>}</span></Link>;
}

const mobileClass = 'block rounded-md px-3 py-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white';
