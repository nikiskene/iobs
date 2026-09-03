// src/components/admin/adminNav.ts
import { BookOpen, CalendarDays, Compass, FileText, Globe2, Image, Inbox, MessageCircle, Palette, Shield, Type, Users } from 'lucide-react';

export type AdminNavLink = { to:string; label:string; icon:React.ElementType; description?:string };
export type AdminNavGroup = { title:string; to:string; description:string; links:AdminNavLink[] };

export const adminNavGroups: AdminNavGroup[] = [
  { title:'Home', to:'/admin', description:'Admin overview and quick actions.', links:[{ to:'/admin', label:'Admin Home', icon:Shield, description:'Overview, status and shortcuts.' }] },
  { title:'Content', to:'/admin/content', description:'Beautiful Success pages, categories and cases.', links:[
    { to:'/admin/content/site-copy', label:'Site Copy', icon:Type, description:'Edit current Beautiful Success headlines and page copy.' },
    { to:'/admin/content/scale-worlds', label:'Award Categories & Dial', icon:Globe2, description:'Edit the seven dial positions, labels and knob images.' },
    { to:'/admin/content/theses', label:'Cases', icon:BookOpen, description:'Manage Beautiful Success cases, images and award categories.' },
    { to:'/admin/content/partners', label:'Partner Logos', icon:Image, description:'Upload, categorize and order logos in the public partner stripe.' },
    { to:'/admin/content/about', label:'About Page', icon:FileText, description:'Edit the public About page.' },
    { to:'/admin/content/categories', label:'Case Topics', icon:FileText, description:'Manage internal case-topic taxonomy.' },
  ]},
  { title:'Members', to:'/admin/members', description:'People, team and access.', links:[{ to:'/admin/members/team', label:'Team', icon:Users, description:'Manage visible team profiles.' }] },
  { title:'Experiences', to:'/admin/experiences', description:'Expeditions, events and applications.', links:[
    { to:'/admin/experiences/expeditions', label:'Expeditions', icon:Compass, description:'Manage expedition pages.' },
    { to:'/admin/experiences/applications', label:'Applications', icon:FileText, description:'Review expedition applications.' },
    { to:'/admin/experiences/custom', label:'Custom Expeditions', icon:Compass, description:'Review custom expedition inquiries.' },
    { to:'/admin/experiences/events', label:'Events', icon:CalendarDays, description:'Manage events.' },
  ]},
  { title:'Messaging', to:'/admin/messaging', description:'All public inquiries and conversation content.', links:[
    { to:'/admin/messaging/contact', label:'Admin Inbox', icon:Inbox, description:'Contact, partnership-deck and other public inquiries.' },
    { to:'/admin/messaging/conversations', label:'Conversations', icon:MessageCircle, description:'Manage conversation content.' },
  ]},
  { title:'Settings', to:'/admin/settings', description:'Site configuration.', links:[
    { to:'/admin/settings/design', label:'Design & Site Settings', icon:Palette, description:'Manage logos, fonts and global visual settings.' },
  ]},
];
