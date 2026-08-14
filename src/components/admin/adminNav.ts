// src/components/admin/adminNav.ts
import { BookOpen, CalendarDays, Compass, FileText, Globe2, Image, Inbox, LayoutGrid as Layout, MessageCircle, Palette, Settings, Shield, Users } from 'lucide-react';

export type AdminNavLink = { to:string; label:string; icon:React.ElementType; description?:string };
export type AdminNavGroup = { title:string; to:string; description:string; links:AdminNavLink[] };

export const adminNavGroups: AdminNavGroup[] = [
  { title:'Home', to:'/admin', description:'Admin overview and quick actions.', links:[{ to:'/admin', label:'Admin Home', icon:Shield, description:'Overview, status and shortcuts.' }] },
  { title:'Content', to:'/admin/content', description:'Public-facing pages and knowledge content.', links:[
    { to:'/admin/content/homepage', label:'Homepage', icon:Layout, description:'Edit homepage sections and positioning.' },
    { to:'/admin/content/scale-worlds', label:'Award Categories', icon:Globe2, description:'Edit the seven award scales and their stories.' },
    { to:'/admin/content/about', label:'About Page', icon:Layout, description:'Edit the public about page.' },
    { to:'/admin/content/theses', label:'Cases', icon:BookOpen, description:'Manage cases and their award categories.' },
    { to:'/admin/content/categories', label:'Case Topics', icon:FileText, description:'Manage case topics.' },
    { to:'/admin/content/partners', label:'Partner Logos', icon:Image, description:'Upload, categorize and order logos in the public partner stripe.' },
    { to:'/admin/content/glossary', label:'Glossary', icon:BookOpen, description:'Manage glossary entries.' },
  ]},
  { title:'Members', to:'/admin/members', description:'People, team and access.', links:[{ to:'/admin/members/team', label:'Team', icon:Users, description:'Manage visible team profiles.' }] },
  { title:'Experiences', to:'/admin/experiences', description:'Expeditions, events and applications.', links:[
    { to:'/admin/experiences/expeditions', label:'Expeditions', icon:Compass, description:'Manage expedition pages.' },
    { to:'/admin/experiences/applications', label:'Applications', icon:FileText, description:'Review expedition applications.' },
    { to:'/admin/experiences/custom', label:'Custom Expeditions', icon:Compass, description:'Review custom expedition inquiries.' },
    { to:'/admin/experiences/events', label:'Events', icon:CalendarDays, description:'Manage events.' },
  ]},
  { title:'Messaging', to:'/admin/messaging', description:'Inbox, community and future announcements.', links:[
    { to:'/admin/messaging/contact', label:'Contact Inbox', icon:Inbox, description:'Read and manage public contact messages.' },
    { to:'/admin/messaging/conversations', label:'Conversations', icon:MessageCircle, description:'Manage conversation content.' },
  ]},
  { title:'Settings', to:'/admin/settings', description:'Platform configuration.', links:[
    { to:'/admin/settings/design', label:'Design', icon:Palette, description:'Manage visual site settings.' },
    { to:'/admin/settings/design', label:'Site Settings', icon:Settings, description:'Manage platform settings.' },
  ]},
];
