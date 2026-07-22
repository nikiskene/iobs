// src/components/DashboardLayout.tsx
// src/components/DashboardLayout.tsx
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, BookOpen, CalendarDays, Clock, Compass, Database, FileText, LayoutGrid as Layout, MessageCircle, Newspaper, Palette, Shield, Telescope, User, Users } from 'lucide-react';

type SidebarLink = {
  to: string;
  label: string;
  icon: React.ElementType;
};

type SidebarGroup = {
  title: string;
  links: SidebarLink[];
};

export default function DashboardLayout() {
  const { profile, isAdmin } = useAuth();
  const location = useLocation();

  const explorerLinks: SidebarLink[] = [
    { to: '/dashboard/profile', label: 'Profile', icon: User },
    { to: '/dashboard/members', label: 'Explorers', icon: Users },
    { to: '/dashboard/theses', label: 'My Theses', icon: BookOpen },
    { to: '/dashboard/inbox', label: 'Messages', icon: MessageCircle },
  ];

  const adminGroups: SidebarGroup[] = [
    {
      title: 'Home',
      links: [{ to: '/admin', label: 'Admin Home', icon: Shield }],
    },
    {
      title: 'Content',
      links: [
        { to: '/admin/homepage', label: 'Homepage', icon: Layout },
        { to: '/admin/about', label: 'About Page', icon: Layout },
        { to: '/admin/theses', label: 'Theses', icon: BookOpen },
        { to: '/admin/categories', label: 'Categories', icon: FileText },
        { to: '/admin/glossary', label: 'Glossary', icon: BookOpen },
      ],
    },
    {
      title: 'Members',
      links: [{ to: '/admin/team', label: 'Team', icon: Users }],
    },
    {
      title: 'Experiences',
      links: [
        { to: '/admin/expeditions', label: 'Expeditions', icon: Compass },
        { to: '/admin/expedition-inquiries', label: 'Applications', icon: FileText },
        { to: '/admin/custom-expedition-inquiries', label: 'Custom Expeditions', icon: Compass },
        { to: '/admin/events', label: 'Events', icon: CalendarDays },
      ],
    },
    {
      title: 'Messaging',
      links: [{ to: '/admin/conversations', label: 'Conversations', icon: MessageCircle }],
    },
    {
      title: 'Identity Research',
      links: [
        { to: '/admin/identity', label: 'Engine', icon: Shield },
        { to: '/admin/identity/review', label: 'Review', icon: FileText },
        { to: '/admin/identity/daily-scan', label: 'Daily Scan', icon: Newspaper },
        { to: '/admin/identity/sources', label: 'Sources', icon: Database },
        { to: '/admin/identity/method', label: 'METHOD', icon: Telescope },
        { to: '/admin/identity/settings', label: 'Schedule', icon: Clock },
      ],
    },
    {
      title: 'Settings',
      links: [
        { to: '/admin/settings', label: 'Design', icon: Palette },
        { to: '/admin/settings', label: 'Site Settings', icon: Shield },
      ],
    },
  ];

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isInboxRoute = location.pathname.startsWith('/dashboard/inbox');

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-16">
      <div
        className={`mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-8 ${
          isInboxRoute ? 'md:max-w-7xl' : ''
        }`}
      >
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-full shrink-0 lg:block lg:w-64">
            <div className="sticky top-24 space-y-6">
              <div className="px-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {isAdminRoute ? 'Admin' : 'Explorer'}
                </h2>

                <p className="mt-1 truncate text-sm text-zinc-400">
                  {profile?.full_name || 'Explorer'}
                </p>
              </div>

              {isAdminRoute ? (
                <div className="space-y-6">
                  {adminGroups.map((group) => (
                    <SidebarGroupBlock key={group.title} group={group} />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {explorerLinks.map((link) => (
                    <SidebarNavLink key={link.to} link={link} />
                  ))}

                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-amber-500 transition-colors hover:bg-amber-400/5 hover:text-amber-400"
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </NavLink>
                  )}
                </div>
              )}

              <div className="border-t border-white/5 pt-4">
                <NavLink
                  to="/"
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Site
                </NavLink>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarGroupBlock({ group }: { group: SidebarGroup }) {
  return (
    <div>
      <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
        {group.title}
      </h3>

      <div className="space-y-1">
        {group.links.map((link) => (
          <SidebarNavLink key={link.to} link={link} />
        ))}
      </div>
    </div>
  );
}

function SidebarNavLink({ link }: { link: SidebarLink }) {
  const Icon = link.icon;

  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {link.label}
    </NavLink>
  );
}
