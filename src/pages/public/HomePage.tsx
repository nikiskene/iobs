// src/pages/public/HomePage.tsx
import { useEffect, useMemo, useState } from 'react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

import MobileHomeLauncher from '../../components/mobile/MobileHomeLauncher';
import WorldGlobeHero from '../../components/hero/WorldGlobeHero';
import FeaturedExpeditionsSection from '../../components/home/FeaturedExpeditionsSection';
import FeaturedThesesSection from '../../components/home/FeaturedThesesSection';
import HomepageContentSections from '../../components/home/HomepageContentSections';
import HomepageCtaSection from '../../components/home/HomepageCtaSection';

import type {
  Expedition,
  HomepageRotatingHeadline,
  HomepageSection,
  SiteSettings,
  Thesis,
} from '../../lib/types';

export default function HomePage() {
  const { user } = useAuth();

  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [headlines, setHeadlines] = useState<HomepageRotatingHeadline[]>([]);
  const [featuredTheses, setFeaturedTheses] = useState<Thesis[]>([]);
  const [featuredExpeditions, setFeaturedExpeditions] = useState<Expedition[]>([]);
  const [activeHeadlineIndex, setActiveHeadlineIndex] = useState(0);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  useEffect(() => {
    if (headlines.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveHeadlineIndex((current) => (current + 1) % headlines.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, [headlines.length]);

  async function fetchHomepageData() {
    const [
      { data: sectionsData },
      { data: settingsData },
      { data: headlinesData },
      { data: thesesData },
      { data: expeditionsData },
    ] = await Promise.all([
      supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_active', true)
        .order('display_order'),

      supabase
        .from('site_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle(),

      supabase
        .from('homepage_rotating_headlines')
        .select('*')
        .eq('is_active', true)
        .order('display_order'),

      supabase
        .from('theses')
        .select(`
          *,
          thesis_categories(id, name, slug, color_hex),
          thesis_media(id, file_url, alt_text, display_order)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .order('display_order', {
          foreignTable: 'thesis_media',
          ascending: true,
        })
        .limit(3),

      supabase
        .from('expeditions')
        .select('*')
        .eq('status', 'published')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .order('start_date', { ascending: true })
        .limit(3),
    ]);

    setSections((sectionsData as HomepageSection[]) || []);
    setSiteSettings((settingsData as SiteSettings) || null);
    setHeadlines((headlinesData as HomepageRotatingHeadline[]) || []);
    setFeaturedTheses((thesesData as Thesis[]) || []);
    setFeaturedExpeditions((expeditionsData as Expedition[]) || []);
    setLoading(false);
  }

  const hero = useMemo(
    () => sections.find((section) => section.section_key === 'hero'),
    [sections]
  );

  const cta = useMemo(
    () => sections.find((section) => section.section_key === 'cta'),
    [sections]
  );

  const contentSections = useMemo(
    () =>
      sections.filter(
        (section) =>
          !section.section_key.startsWith('about_') &&
          !['hero', 'cta', 'legal_impressum'].includes(section.section_key)
      ),
    [sections]
  );

  const heroMediaUrl = hero?.media_url || siteSettings?.default_hero_url || null;
  const activeHeadline = headlines[activeHeadlineIndex];

  if (loading) return <div className="min-h-screen bg-[#0A0A0A]" />;

  return (
    <>
      {user && <MobileHomeLauncher />}

      <main
        className={`relative overflow-hidden bg-[#0A0A0A] text-white ${
          user ? 'hidden md:block' : ''
        }`}
      >
        <WorldGlobeHero
          headline={activeHeadline}
          body={hero?.body}
          mediaUrl={heroMediaUrl}
          user={user}
        />

        {featuredExpeditions.length > 0 && (
          <FeaturedExpeditionsSection expeditions={featuredExpeditions} />
        )}

        {featuredTheses.length > 0 && (
          <FeaturedThesesSection theses={featuredTheses} />
        )}

        <HomepageContentSections sections={contentSections} />

        {cta && !user && <HomepageCtaSection cta={cta} />}
      </main>
    </>
  );
}