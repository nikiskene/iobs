// src/providers/AwardSiteContentProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useLocale, type Locale } from './LocaleProvider';
import { awardSiteDefaults } from '../content/awardSiteTranslations';

export type AwardSiteContent = {
  id?: string;
  content_key: string;
  locale: Locale;
  section: string;
  label: string | null;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  media_url: string | null;
  media_path: string | null;
  display_order: number;
  is_active: boolean;
};

type ContentContextValue = {
  rows: AwardSiteContent[];
  get: (key: string) => AwardSiteContent | undefined;
};

const DEFAULT_ROWS = awardSiteDefaults('en');
const AwardSiteContentContext = createContext<ContentContextValue>({
  rows: DEFAULT_ROWS,
  get: (key) => DEFAULT_ROWS.find((item) => item.content_key === key),
});

export function AwardSiteContentProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const defaults = useMemo(() => awardSiteDefaults(locale), [locale]);
  const [rows, setRows] = useState<AwardSiteContent[]>(defaults);

  useEffect(() => {
    let active = true;
    setRows(defaults);

    Promise.all([
      supabase.from('award_site_content').select('id,content_key,locale,section,label,headline,subheadline,body,media_url,media_path,display_order,is_active').eq('is_active', true).eq('locale', locale).order('display_order'),
      locale === 'en'
        ? Promise.resolve({ data: [], error: null })
        : supabase.from('award_site_content').select('id,content_key,locale,section,label,headline,subheadline,body,media_url,media_path,display_order,is_active').eq('is_active', true).eq('locale', 'en').order('display_order'),
    ]).then(([localized, english]) => {
      if (!active) return;
      const byKey = new Map(defaults.map((item) => [item.content_key, item]));
      if (!english.error) (english.data as AwardSiteContent[] || []).forEach((item) => byKey.set(item.content_key, { ...item, locale }));
      if (!localized.error) (localized.data as AwardSiteContent[] || []).forEach((item) => byKey.set(item.content_key, item));
      setRows(Array.from(byKey.values()).sort((a, b) => a.display_order - b.display_order));
    });

    return () => { active = false; };
  }, [locale, defaults]);

  const value = useMemo<ContentContextValue>(() => ({
    rows,
    get: (key) => rows.find((item) => item.content_key === key),
  }), [rows]);

  return <AwardSiteContentContext.Provider value={value}>{children}</AwardSiteContentContext.Provider>;
}

export const useAwardSiteContent = () => useContext(AwardSiteContentContext);
