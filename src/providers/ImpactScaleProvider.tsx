//src/providers/ImpactScaleProvider.tsx

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ImpactScale =
  | 'self'
  | 'relationships'
  | 'team'
  | 'organization'
  | 'industry'
  | 'world';

type ImpactScaleContextValue = {
  scale: ImpactScale;
  setScale: (scale: ImpactScale) => void;
  next: () => void;
  previous: () => void;
};

const order: ImpactScale[] = [
  'self',
  'relationships',
  'team',
  'organization',
  'industry',
  'world',
];

const labels: Record<ImpactScale, number> = {
  self: 0,
  relationships: 1,
  team: 2,
  organization: 3,
  industry: 4,
  world: 5,
};

const ImpactScaleContext =
  createContext<ImpactScaleContextValue | null>(null);

export function ImpactScaleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [scale, setScale] = useState<ImpactScale>('self');

  const value = useMemo<ImpactScaleContextValue>(() => {
    const index = labels[scale];

    return {
      scale,
      setScale,

      next() {
        if (index < order.length - 1) {
          setScale(order[index + 1]);
        }
      },

      previous() {
        if (index > 0) {
          setScale(order[index - 1]);
        }
      },
    };
  }, [scale]);

  return (
    <ImpactScaleContext.Provider value={value}>
      {children}
    </ImpactScaleContext.Provider>
  );
}

export function useImpactScale() {
  const context = useContext(ImpactScaleContext);

  if (!context) {
    throw new Error(
      'useImpactScale must be used inside ImpactScaleProvider'
    );
  }

  return context;
}