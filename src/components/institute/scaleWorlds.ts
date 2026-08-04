// src/components/institute/scaleWorlds.ts
import type { ImpactScale } from '../../providers/ImpactScaleProvider';

const MEDIA = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media';

export type ScaleWorld = {
  slug: ImpactScale;
  label: string;
  eyebrow: string;
  title: string;
  introduction: string;
  iAm: string;
  iCanBe: string;
  whatToDo: string;
  knobImageUrl: string;
  iconUrl?: string;
  textImageUrl?: string;
};

export const SCALE_WORLDS: ScaleWorld[] = [
  {
    slug: 'me', label: 'Just Me', eyebrow: 'A private beginning',
    title: 'What would you build if success could be beautiful?',
    introduction: 'Every world begins with a person willing to imagine a different life.',
    iAm: 'The author of my identity, attention and direction.',
    iCanBe: 'More intentional, more alive and more fully myself.',
    whatToDo: 'Explore public tours, intimate talks and personal expeditions.',
    knobImageUrl: `${MEDIA}/Just%20me%20Knob.png?v=2`,
  },
  {
    slug: 'circle', label: 'My Community', eyebrow: 'The intimate world',
    title: 'Every relationship creates a tiny civilization.',
    introduction: 'Beautiful success grows through the people who shape and challenge us.',
    iAm: 'A friend, peer, partner and participant in something shared.',
    iCanBe: 'Part of a circle where candour, imagination and belonging flourish.',
    whatToDo: 'Join salons, shared journeys and small-group encounters.',
    knobImageUrl: `${MEDIA}/My%20community%20Knob.png`,
  },
  {
    slug: 'teams', label: 'My Team', eyebrow: 'The shared endeavour',
    title: 'Turn a group of people into a beautiful force.',
    introduction: 'Teams are where identity becomes trust, rhythm and collective possibility.',
    iAm: 'A contributor to a purpose none of us can reach alone.',
    iCanBe: 'Part of a team that combines excellence with humanity.',
    whatToDo: 'Enter workshops, facilitated sessions and team expeditions.',
    knobImageUrl: `${MEDIA}/My%20Team%20Knob.png`,
  },
  {
    slug: 'organizations', label: 'My Company', eyebrow: 'The living institution',
    title: 'Build the organization people wish existed.',
    introduction: 'Organizations turn repeated choices into culture, systems and consequence.',
    iAm: 'A steward of culture, resources and institutional possibility.',
    iCanBe: 'Part of an organization designed around a more generous definition of success.',
    whatToDo: 'Explore custom programmes, leadership journeys and institutional expeditions.',
    knobImageUrl: `${MEDIA}/my%20company%20knob.png`,
  },
  {
    slug: 'society', label: 'The World', eyebrow: 'The beautiful possible',
    title: 'The whole world is still ours to imagine.',
    introduction: 'At the widest human scale, beautiful success becomes a civilizational proposition.',
    iAm: 'A temporary custodian of a living planet and a shared future.',
    iCanBe: 'Part of a civilization worthy of its extraordinary potential.',
    whatToDo: 'Enter flagship gatherings, global expeditions and transformative questions.',
    knobImageUrl: `${MEDIA}/world%20knob.png`,
  },
  {
    slug: 'world', label: 'Beyond World', eyebrow: 'The beautiful impossible',
    title: 'What becomes possible beyond the world we know?',
    introduction: 'The final position is the courage to imagine beyond inherited limits.',
    iAm: 'An explorer at the edge of what humanity believes it can become.',
    iCanBe: 'Part of a future that does not yet have a name.',
    whatToDo: 'Enter speculative gatherings, frontier expeditions and impossible questions.',
    knobImageUrl: `${MEDIA}/Beyond%20World.png`,
  },
];

export const getScaleWorld = (slug: ImpactScale) =>
  SCALE_WORLDS.find((world) => world.slug === slug) ?? SCALE_WORLDS[0];
