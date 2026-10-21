import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useLocale, type Locale } from './LocaleProvider';
import { awardSiteDefaults } from '../content/awardSiteTranslations';
import { normalizeCmsText, translateArabicCms, type TranslateCms } from '../content/localizedCms';

export type AwardSiteContent = {
  id?: string; content_key: string; locale?: Locale; section: string;
  label: string | null; headline: string | null; subheadline: string | null; body: string | null;
  media_url: string | null; media_path: string | null; display_order: number; is_active: boolean;
};
export const localizedContentKey = (key: string, locale: Locale) => locale === 'en' ? key : `${key}__${locale}`;
export const baseContentKey = (key: string) => key.replace(/__(de|fr|ar|zh|es)$/, '');

type ContentContextValue = { rows: AwardSiteContent[]; get: (key: string) => AwardSiteContent | undefined; translate: TranslateCms };
const DEFAULT_ROWS = awardSiteDefaults('en');
const AwardSiteContentContext = createContext<ContentContextValue>({ rows: DEFAULT_ROWS, get: key => DEFAULT_ROWS.find(item => item.content_key === key), translate: value => value });

export function AwardSiteContentProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [stored, setStored] = useState<AwardSiteContent[]>([]);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      supabase.from('award_site_content')
        .select('id,content_key,locale,section,label,headline,subheadline,body,media_url,media_path,display_order,is_active')
        .eq('is_active', true).order('display_order')
        .then(({ data, error }) => { if (active && !error && data) setStored(data as AwardSiteContent[]); });
    }, 900);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);
  const value = useMemo<ContentContextValue>(() => {
    const overrides = new Map(stored.filter(row => row.section === 'translations' && row.locale === locale && row.label && row.body)
      .map(row => [normalizeCmsText(row.label!), row.body!]));
    const translate: TranslateCms = text => locale === 'ar' ? overrides.get(normalizeCmsText(text)) ?? translateArabicCms(text) : text;
    const byKey = new Map(awardSiteDefaults(locale).map(row => [row.content_key, row]));
    // English records remain the source for current images and editorial structure.
    stored.filter(row => row.locale === 'en' && !/__(de|fr|ar|zh|es)$/.test(row.content_key)).forEach(row => {
      const localized = { ...row, locale };
      for (const field of ['label','headline','subheadline','body'] as const) {
        if (localized[field]) localized[field] = translate(localized[field]!);
      }
      byKey.set(row.content_key, localized);
    });
    if (locale !== 'en') stored.filter(row => row.locale === locale && row.section !== 'translations').forEach(row => {
      const key = baseContentKey(row.content_key);
      const source = byKey.get(key);
      byKey.set(key, { ...source, ...row, content_key: key,
        media_url: row.media_url || source?.media_url || null,
        media_path: row.media_path || source?.media_path || null });
    });
    const rows = Array.from(byKey.values()).sort((a,b) => a.display_order - b.display_order);
    return { rows, get: key => byKey.get(key), translate };
  }, [stored, locale]);
  return <AwardSiteContentContext.Provider value={value}>{children}</AwardSiteContentContext.Provider>;
}
export const useAwardSiteContent = () => useContext(AwardSiteContentContext);
