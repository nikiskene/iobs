// src/providers/ImpactScaleProvider.tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export const IMPACT_SCALE_ORDER = [
  'me',
  'circle',
  'teams',
  'organizations',
  'society',
  'world',
] as const;

export type ImpactScale = (typeof IMPACT_SCALE_ORDER)[number];

type ImpactScaleContextValue = {
  scale: ImpactScale;
  setScale: (scale: ImpactScale) => void;
  next: () => void;
  previous: () => void;
};

const ImpactScaleContext = createContext<ImpactScaleContextValue | null>(null);

export function ImpactScaleProvider({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState<ImpactScale>('me');
  const value = useMemo(() => {
    const index = IMPACT_SCALE_ORDER.indexOf(scale);
    return {
      scale,
      setScale,
      next: () => setScale(IMPACT_SCALE_ORDER[Math.min(index + 1, 5)]),
      previous: () => setScale(IMPACT_SCALE_ORDER[Math.max(index - 1, 0)]),
    };
  }, [scale]);

  return <ImpactScaleContext.Provider value={value}>{children}</ImpactScaleContext.Provider>;
}

export function useImpactScale() {
  const context = useContext(ImpactScaleContext);
  if (!context) throw new Error('useImpactScale must be used inside ImpactScaleProvider');
  return context;
}
