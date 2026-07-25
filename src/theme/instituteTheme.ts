// src/theme/instituteTheme.ts

import type { ImpactScale } from '../providers/ImpactScaleProvider';

export type InstituteTheme = {
  background: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  border: string;
  gold: string;
  maxWidth: number;
};

const BASE: InstituteTheme = {
  background: '#f6f1e8',
  surface: '#fffdf9',
  surfaceSoft: '#efe5d6',
  text: '#1d1b18',
  textMuted: '#6c645a',
  accent: '#5a3b23',
  accentSoft: '#a8825a',
  border: '#d8c6ae',
  gold: '#b88a3b',
  maxWidth: 1320,
};

const WORLD: InstituteTheme = {
  ...BASE,
  background: '#f2ede4',
  surface: '#fffdfa',
  surfaceSoft: '#ece2d2',
  accent: '#17384d',
  accentSoft: '#4d7288',
  gold: '#c49a42',
};

const THEMES: Record<ImpactScale, InstituteTheme> = {
  self: BASE,
  relationships: {
    ...BASE,
    accent: '#7a4a47',
    accentSoft: '#b17b74',
  },
  team: {
    ...BASE,
    accent: '#4d5e37',
    accentSoft: '#80966a',
  },
  organization: {
    ...BASE,
    accent: '#32475f',
    accentSoft: '#607891',
  },
  industry: {
    ...BASE,
    accent: '#2d5160',
    accentSoft: '#5c8a96',
  },
  world: WORLD,
};

export function getInstituteTheme(
  scale: ImpactScale,
): InstituteTheme {
  return THEMES[scale];
}