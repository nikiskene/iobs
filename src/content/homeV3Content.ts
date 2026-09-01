import type { ImpactScale } from '../providers/ImpactScaleProvider';

const MEDIA = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3';

export const HOME_V3_HERO_IMAGES = Array.from({ length: 12 }, (_, index) =>
  `${MEDIA}/${String(index + 1).padStart(2, '0')}.png`
);

export type HomeV3Scale = {
  id: ImpactScale;
  urlId: 'me' | 'community' | 'team' | 'company' | 'country' | 'world' | 'beyond';
  label: string;
};

export const HOME_V3_SCALES: HomeV3Scale[] = [
  { id: 'me', urlId: 'me', label: 'ME' },
  { id: 'circle', urlId: 'community', label: 'MY COMMUNITY' },
  { id: 'teams', urlId: 'team', label: 'MY TEAM' },
  { id: 'organizations', urlId: 'company', label: 'MY COMPANY' },
  { id: 'country', urlId: 'country', label: 'MY COUNTRY' },
  { id: 'society', urlId: 'world', label: 'THE WHOLE WORLD' },
  { id: 'world', urlId: 'beyond', label: 'BEYOND OUR WORLD' },
];
