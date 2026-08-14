// src/providers/AwardSiteContentProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type AwardSiteContent = {
  id?: string;
  content_key: string;
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

const DEFAULTS: AwardSiteContent[] = [
  { content_key:'hero_me', section:'hero', label:'A private beginning', headline:'What would you celebrate as success?', subheadline:null, body:'The Beautiful Success Awards recognize achievements that make the world better through their success.', media_url:null, media_path:null, display_order:10, is_active:true },
  { content_key:'hero_community', section:'hero', label:'The intimate world', headline:'What would your community celebrate as success?', subheadline:null, body:'The Beautiful Success Awards recognize achievements that make the world better through their success.', media_url:null, media_path:null, display_order:20, is_active:true },
  { content_key:'hero_team', section:'hero', label:'The shared endeavour', headline:'What would your team celebrate as success?', subheadline:null, body:'The Beautiful Success Awards recognize achievements that make the world better through their success.', media_url:null, media_path:null, display_order:30, is_active:true },
  { content_key:'hero_company', section:'hero', label:'The living institution', headline:'What would your company celebrate as success?', subheadline:null, body:'The Beautiful Success Awards recognize achievements that make the world better through their success.', media_url:null, media_path:null, display_order:40, is_active:true },
  { content_key:'hero_country', section:'hero', label:'The national imagination', headline:'What would your country celebrate as success?', subheadline:null, body:'The Beautiful Success Awards recognize achievements that make the world better through their success.', media_url:null, media_path:null, display_order:50, is_active:true },
  { content_key:'hero_world', section:'hero', label:'The beautiful possible', headline:'What would our world celebrate as success?', subheadline:null, body:'The Beautiful Success Awards recognize achievements that make the world better through their success.', media_url:null, media_path:null, display_order:60, is_active:true },
  { content_key:'hero_universe', section:'hero', label:'The beautiful impossible', headline:'What would the universe celebrate as success?', subheadline:null, body:'The Beautiful Success Awards recognize achievements that make the world better through their success.', media_url:null, media_path:null, display_order:70, is_active:true },
  { content_key:'site_claim', section:'global', label:null, headline:'Celebrating a better world, one Beautiful Success at a time.', subheadline:null, body:null, media_url:null, media_path:null, display_order:80, is_active:true },
  { content_key:'principle', section:'homepage', label:'The Beautiful Success Principle', headline:'The more successful it becomes, the better the world becomes.', subheadline:null, body:'Not every success deserves to be celebrated. We recognize achievements whose positive value compounds as they grow.', media_url:null, media_path:null, display_order:100, is_active:true },
  { content_key:'judging_intro', section:'homepage', label:'A new social contract, measured', headline:'Recognition begins where ordinary success metrics end.', subheadline:null, body:null, media_url:null, media_path:null, display_order:110, is_active:true },
  { content_key:'recognition_intro', section:'homepage', label:'Recognition', headline:'Scarce by design.', subheadline:null, body:null, media_url:null, media_path:null, display_order:120, is_active:true },
  { content_key:'voices_intro', section:'homepage', label:'The Beautiful Success Question', headline:'What does beautiful success mean to you?', subheadline:null, body:'Founding voices from business, culture, science and public life will help define what humanity should celebrate as success.', media_url:null, media_path:null, display_order:130, is_active:true },
  { content_key:'founding_edition', section:'homepage', label:'The Founding Edition', headline:'One global search. Seven scales. One Grand Prix.', subheadline:'Dubai · Shenzhen · Hong Kong · Vienna · London · San Francisco · Lithuania', body:null, media_url:null, media_path:null, display_order:140, is_active:true },
  { content_key:'partners_intro', section:'partners', label:null, headline:'Grateful for our Beautiful Partners', subheadline:null, body:null, media_url:null, media_path:null, display_order:150, is_active:true },
];

type ContentContextValue = {
  rows: AwardSiteContent[];
  get: (key: string) => AwardSiteContent | undefined;
};

const AwardSiteContentContext = createContext<ContentContextValue>({
  rows: DEFAULTS,
  get: (key) => DEFAULTS.find((item) => item.content_key === key),
});

export function AwardSiteContentProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<AwardSiteContent[]>(DEFAULTS);

  useEffect(() => {
    supabase
      .from('award_site_content')
      .select('id,content_key,section,label,headline,subheadline,body,media_url,media_path,display_order,is_active')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data, error }) => {
        if (!error && data?.length) {
          const incoming = data as AwardSiteContent[];
          const byKey = new Map(DEFAULTS.map((item) => [item.content_key, item]));
          incoming.forEach((item) => byKey.set(item.content_key, item));
          setRows(Array.from(byKey.values()).sort((a, b) => a.display_order - b.display_order));
        }
      });
  }, []);

  const value = useMemo<ContentContextValue>(() => ({
    rows,
    get: (key) => rows.find((item) => item.content_key === key),
  }), [rows]);

  return <AwardSiteContentContext.Provider value={value}>{children}</AwardSiteContentContext.Provider>;
}

export const useAwardSiteContent = () => useContext(AwardSiteContentContext);
