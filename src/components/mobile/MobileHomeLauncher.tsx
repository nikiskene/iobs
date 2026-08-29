// src/components/mobile/MobileHomeLauncher.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Info,
  MessageCircle,
  ScanSearch,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import LauncherTile, { type MobileLauncherTile } from './MobileLauncherTile';

const customExpeditionImage =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/expedition-media/IMG_2923.JPG';

export default function MobileHomeLauncher() {
  const { profile } = useAuth();
  const [expeditionImage, setExpeditionImage] = useState<string | null>(null);
  const [thesisImage, setThesisImage] = useState<string | null>(null);
  const [teamImage, setTeamImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      const [{ data: expedition }, { data: thesis }, { data: team }] =
        await Promise.all([
          supabase
            .from('expeditions')
            .select('hero_image_url')
            .eq('is_active', true)
            .eq('status', 'published')
            .order('display_order', { ascending: true })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('theses')
            .select('thesis_media(file_url)')
            .eq('status', 'published')
            .eq('is_featured', true)
            .order('display_order', { ascending: true })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('photo_url')
            .eq('is_team_member', true)
            .eq('is_active', true)
            .not('photo_url', 'is', null)
            .order('team_sort_order', { ascending: true })
            .limit(1)
            .maybeSingle(),
        ]);

      const thesisMedia = Array.isArray(thesis?.thesis_media)
        ? thesis.thesis_media[0]
        : null;

      setExpeditionImage(expedition?.hero_image_url || customExpeditionImage);
      setThesisImage(thesisMedia?.file_url || null);
      setTeamImage(team?.photo_url || null);
    }

    fetchImages();
  }, []);

  const items: MobileLauncherTile[] = [
    {
      to: '/dashboard/inbox',
      label: 'Messages',
      description: 'Inbox',
      icon: MessageCircle,
      highlight: true,
    },
    {
      to: '/expeditions',
      label: 'Expeditions',
      description: 'Field journeys',
      icon: Compass,
      image: expeditionImage,
    },
    {
      to: '/thesis',
      label: 'Thesis',
      description: 'Ideas',
      icon: BookOpen,
      image: thesisImage,
    },
    {
      to: '/our-team',
      label: 'Team',
      description: 'People',
      icon: Users,
      image: teamImage,
    },
    {
      to: '/about',
      label: 'About',
      description: 'Worldview',
      icon: Info,
    },
    {
      to: '/dashboard/profile',
      label: 'Profile',
      description: 'You',
      icon: User,
      image: profile?.photo_url,
    },
  ];

  if (profile?.role === 'admin') {
    items.push({
      to: '/admin/identity',
      label: 'Identity Scanner',
      description: 'Research signals',
      icon: ScanSearch,
      highlight: true,
    });
    items.push({
      to: '/admin',
      label: 'Admin',
      description: 'Control',
      icon: Shield,
    });
  }

  return (
    <section className="min-h-screen bg-[#0A0A0A] px-4 pb-8 pt-20 text-white md:hidden">
      <div className="mx-auto max-w-md">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-[10px] uppercase tracking-[0.32em] text-sky-300/80">
            WorldOS
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight">
            Welcome{profile?.full_name ? `, ${firstName(profile.full_name)}` : ''}
          </h1>

          <p className="mt-1 text-sm text-zinc-400">Choose your next signal.</p>
        </div>

        <Link
          to="/expeditions/custom"
          className="group mt-3 block overflow-hidden rounded-[1.5rem] border border-sky-300/20 bg-white/[0.04] active:scale-[0.98]"
        >
          <div className="relative h-32">
            <img
              src={customExpeditionImage}
              alt="Custom Expedition"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[9px] uppercase tracking-[0.26em] text-sky-300">
                Custom Expedition
              </p>

              <div className="mt-1 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold leading-tight">
                    Build your own field study.
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-300">
                    For companies and institutions.
                  </p>
                </div>

                <ArrowRight className="h-5 w-5 shrink-0 text-sky-300" />
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {items.map((item) => (
            <LauncherTile key={item.to} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0];
}
