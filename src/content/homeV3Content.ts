import type { ImpactScale } from '../providers/ImpactScaleProvider';

const MEDIA = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3';

export const HOME_V3_HERO_IMAGES = Array.from({ length: 12 }, (_, index) =>
  `${MEDIA}/${String(index + 1).padStart(2, '0')}.png`
);

export const HOME_V3_PRINCIPLES = [
  { number: '01', name: 'PHILANTHROPY', question: 'What can I offer?', tone: 'plum' },
  { number: '02', name: 'NEW FOCUS', question: 'What can I create?', tone: 'violet' },
  { number: '03', name: 'ECHO', question: 'Whose choices do I influence?', tone: 'orange' },
  { number: '04', name: 'MOMENTUM', question: 'What can my assets set in motion?', tone: 'mint' },
  { number: '05', name: 'LEGACY', question: 'What outlasts me?', tone: 'blue' },
] as const;

export type HomeV3Scale = {
  id: ImpactScale;
  urlId: 'me' | 'community' | 'team' | 'company' | 'country' | 'world' | 'beyond';
  number: string;
  label: string;
};

export const HOME_V3_SCALES: HomeV3Scale[] = [
  { id: 'me', urlId: 'me', number: '01', label: 'ME' },
  { id: 'circle', urlId: 'community', number: '02', label: 'MY COMMUNITY' },
  { id: 'teams', urlId: 'team', number: '03', label: 'MY TEAM' },
  { id: 'organizations', urlId: 'company', number: '04', label: 'MY COMPANY' },
  { id: 'country', urlId: 'country', number: '05', label: 'MY COUNTRY' },
  { id: 'society', urlId: 'world', number: '06', label: 'THE WHOLE WORLD' },
  { id: 'world', urlId: 'beyond', number: '07', label: 'BEYOND OUR WORLD' },
];

export const HOME_V3_COPY = {
  heroEyebrow: 'THE INSTITUTE OF BEAUTIFUL SUCCESS',
  heroLead: 'Success is not the problem.',
  heroFollow: 'Our definition of it is.',
  principleSupport: 'For humans. For non-humans. For society. For the planet. For what comes after us.',
  scaleSupport: ['Beautiful Success is not measured by how large it becomes.', 'Scale tells us how far it reaches.', 'The principles tell us whether it is beautiful.'],
} as const;
