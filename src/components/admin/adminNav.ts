// src/components/admin/adminNav.ts
// src/components/admin/adminNav.ts
import { BookOpen, CalendarDays, Clock, Compass, Database, FileText, LayoutGrid as Layout, MessageCircle, Newspaper, Palette, Settings, Shield, Telescope, Users } from 'lucide-react';

export type AdminNavLink = {
  to: string;
  label: string;
  icon: React.ElementType;
  description?: string;
};

export type AdminNavGroup = {
  title: string;
  to: string;
  description: string;
  links: AdminNavLink[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: 'Home',
    to: '/admin',
    description: 'Admin overview and quick actions.',
    links: [
      {
        to: '/admin',
        label: 'Admin Home',
        icon: Shield,
        description: 'Overview, status and shortcuts.',
      },
    ],
  },
  {
    title: 'Content',
    to: '/admin/content',
    description: 'Public-facing pages and knowledge content.',
    links: [
      {
        to: '/admin/content/homepage',
        label: 'Homepage',
        icon: Layout,
        description: 'Edit homepage sections and positioning.',
      },
      {
        to: '/admin/content/about',
        label: 'About Page',
        icon: Layout,
        description: 'Edit the public about page.',
      },
      {
        to: '/admin/content/theses',
        label: 'Theses',
        icon: BookOpen,
        description: 'Manage published theses.',
      },
      {
        to: '/admin/content/categories',
        label: 'Categories',
        icon: FileText,
        description: 'Manage thesis categories.',
      },
      {
        to: '/admin/content/glossary',
        label: 'Glossary',
        icon: BookOpen,
        description: 'Manage glossary entries.',
      },
    ],
  },
  {
    title: 'Members',
    to: '/admin/members',
    description: 'People, team and access.',
    links: [
      {
        to: '/admin/members/team',
        label: 'Team',
        icon: Users,
        description: 'Manage visible team profiles.',
      },
    ],
  },
  {
    title: 'Experiences',
    to: '/admin/experiences',
    description: 'Expeditions, events and applications.',
    links: [
      {
        to: '/admin/experiences/expeditions',
        label: 'Expeditions',
        icon: Compass,
        description: 'Manage expedition pages.',
      },
      {
        to: '/admin/experiences/applications',
        label: 'Applications',
        icon: FileText,
        description: 'Review expedition applications.',
      },
      {
        to: '/admin/experiences/custom',
        label: 'Custom Expeditions',
        icon: Compass,
        description: 'Review custom expedition inquiries.',
      },
      {
        to: '/admin/experiences/events',
        label: 'Events',
        icon: CalendarDays,
        description: 'Manage events.',
      },
    ],
  },
  {
    title: 'Messaging',
    to: '/admin/messaging',
    description: 'Inbox, community and future announcements.',
    links: [
      {
        to: '/admin/messaging/conversations',
        label: 'Conversations',
        icon: MessageCircle,
        description: 'Manage conversation content.',
      },
    ],
  },
  {
    title: 'Identity Research',
    to: '/admin/identity',
    description: 'Internal north star and living methodology.',
    links: [
      {
        to: '/admin/identity',
        label: 'Engine',
        icon: Shield,
        description: 'Identity Engine overview and scan control.',
      },
      {
        to: '/admin/identity/review',
        label: 'Review',
        icon: FileText,
        description: 'Candidate signal review queue.',
      },
      {
        to: '/admin/identity/daily-scan',
        label: 'Daily Scan',
        icon: Newspaper,
        description: 'Reviewed identity signals and patterns by day.',
      },
      {
        to: '/admin/identity/sources',
        label: 'Sources',
        icon: Database,
        description: 'Configured sources and cohorts.',
      },
      {
        to: '/admin/identity/method',
        label: 'METHOD',
        icon: Telescope,
        description: 'WorldOS Identity Research methodology.',
      },
      {
        to: '/admin/identity/settings',
        label: 'Schedule',
        icon: Clock,
        description: 'Daily automation and source retention.',
      },
    ],
  },
  {
    title: 'Settings',
    to: '/admin/settings',
    description: 'Platform configuration.',
    links: [
      {
        to: '/admin/settings/design',
        label: 'Design',
        icon: Palette,
        description: 'Manage visual site settings.',
      },
      {
        to: '/admin/settings/design',
        label: 'Site Settings',
        icon: Settings,
        description: 'Manage platform settings.',
      },
    ],
  },
];
