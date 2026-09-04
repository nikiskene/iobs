// src/providers/ScaleWorldsProvider.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { SCALE_WORLDS, type ScaleWorld } from '../components/institute/scaleWorlds';
import type { ImpactScale } from './ImpactScaleProvider';

type ScaleRow = {
  slug: ImpactScale;
  label: string;
  eyebrow: string;
  title: string;
  introduction: string;
  i_am: string;
  i_can_be: string;
  what_to_do: string;
  knob_image_url: string;
  icon_url: string | null;
  text_image_url: string | null;
};

const ScaleWorldsContext = createContext<ScaleWorld[]>(SCALE_WORLDS);

export function ScaleWorldsProvider({ children }: { children: ReactNode }) {
  const [worlds, setWorlds] = useState(SCALE_WORLDS);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      supabase
        .from('impact_scales')
        .select('slug,label,eyebrow,title,introduction,i_am,i_can_be,what_to_do,knob_image_url,icon_url,text_image_url')
        .eq('is_published', true)
        .order('position')
        .then(({ data, error }) => {
          if (active && !error && data?.length === SCALE_WORLDS.length) {
            setWorlds((data as ScaleRow[]).map(toScaleWorld));
          }
        });
    }, 1200);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  return <ScaleWorldsContext.Provider value={worlds}>{children}</ScaleWorldsContext.Provider>;
}

export const useScaleWorlds = () => useContext(ScaleWorldsContext);

function toScaleWorld(row: ScaleRow): ScaleWorld {
  return {
    slug: row.slug,
    label: row.label,
    eyebrow: row.eyebrow,
    title: row.title,
    introduction: row.introduction,
    iAm: row.i_am,
    iCanBe: row.i_can_be,
    whatToDo: row.what_to_do,
    knobImageUrl: row.knob_image_url,
    iconUrl: row.icon_url || undefined,
    textImageUrl: row.text_image_url || undefined,
  };
}
