// src/providers/AwardSiteContentProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useLocale, type Locale } from './LocaleProvider';
import { awardSiteDefaults } from '../content/awardSiteTranslations';

export type AwardSiteContent = {
  id?: string;
  content_key: string;
  locale?: Locale;
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

export const localizedContentKey = (key: string, locale: Locale) => locale === 'en' ? key : `${key}__${locale}`;
export const baseContentKey = (key: string) => key.replace(/__(de|fr|ar|zh|es)$/, '');

type ContentContextValue = { rows: AwardSiteContent[]; get: (key: string) => AwardSiteContent | undefined };
const DEFAULT_ROWS = awardSiteDefaults('en');
const AwardSiteContentContext = createContext<ContentContextValue>({ rows: DEFAULT_ROWS, get: (key) => DEFAULT_ROWS.find((item) => item.content_key === key) });

export function AwardSiteContentProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const defaults = useMemo(() => awardSiteDefaults(locale), [locale]);
  const [rows, setRows] = useState<AwardSiteContent[]>(defaults);

  useEffect(() => {
    let active = true;
    setRows(defaults);
    const timer = window.setTimeout(() => {
      supabase.from('award_site_content')
        .select('id,content_key,section,label,headline,subheadline,body,media_url,media_path,display_order,is_active')
        .eq('is_active', true)
        .order('display_order')
        .then(({ data, error }) => {
          if (!active || error || !data) return;
          const byKey = new Map(defaults.map((item) => [item.content_key, item]));
          const stored = data as AwardSiteContent[];
          if (locale === 'en') {
            stored.filter((item) => !/__(de|fr|ar|zh|es)$/.test(item.content_key)).forEach((item) => byKey.set(item.content_key, { ...item, locale:'en' }));
          } else {
            stored.filter((item) => item.content_key.endsWith(`__${locale}`)).forEach((item) => {
              const key = baseContentKey(item.content_key);
              byKey.set(key, { ...item, content_key:key, locale });
            });
          }
          setRows(Array.from(byKey.values()).sort((a, b) => a.display_order - b.display_order));
        });
    }, 900);
    return () => { active = false; window.clearTimeout(timer); };
  }, [locale, defaults]);

  const value = useMemo<ContentContextValue>(() => ({ rows, get: (key) => rows.find((item) => item.content_key === key) }), [rows]);
  return <AwardSiteContentContext.Provider value={value}>{children}</AwardSiteContentContext.Provider>;
}

export const useAwardSiteContent = () => useContext(AwardSiteContentContext);
