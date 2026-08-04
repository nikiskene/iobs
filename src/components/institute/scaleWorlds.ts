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
    slug: 'me', label: 'Me', eyebrow: 'A private beginning',
    title: 'What would you build if success could be beautiful?',
    introduction: 'Every world begins with a person willing to imagine a different life.',
    iAm: 'The author of my identity, attention and direction.',
    iCanBe: 'More intentional, more alive and more fully myself.',
    whatToDo: 'Explore public tours, intimate talks and personal expeditions.',
    knobImageUrl: `${MEDIA}/Pos%20me.png`, iconUrl: `${MEDIA}/justmepic.png`,
    textImageUrl: `${MEDIA}/justmetxt.png`,
  },
  {
    slug: 'circle', label: 'My Circle', eyebrow: 'The intimate world',
    title: 'Every relationship creates a tiny civilization.',
    introduction: 'Beautiful success grows through the people who shape and challenge us.',
    iAm: 'A friend, peer, partner and participant in something shared.',
    iCanBe: 'Part of a circle where candour, imagination and belonging flourish.',
    whatToDo: 'Join salons, shared journeys and small-group encounters.',
    knobImageUrl: `${MEDIA}/Pos1.png`,
  },
  {
    slug: 'teams', label: 'Teams', eyebrow: 'The shared endeavour',
    title: 'Turn a group of people into a beautiful force.',
    introduction: 'Teams are where identity becomes trust, rhythm and collective possibility.',
    iAm: 'A contributor to a purpose none of us can reach alone.',
    iCanBe: 'Part of a team that combines excellence with humanity.',
    whatToDo: 'Enter workshops, facilitated sessions and team expeditions.',
    knobImageUrl: `${MEDIA}/Pos%202.png`,
  },
  {
    slug: 'organizations', label: 'Organizations', eyebrow: 'The living institution',
    title: 'Build the organization people wish existed.',
    introduction: 'Organizations turn repeated choices into culture, systems and consequence.',
    iAm: 'A steward of culture, resources and institutional possibility.',
    iCanBe: 'Part of an organization designed around a more generous definition of success.',
    whatToDo: 'Explore custom programmes, leadership journeys and institutional expeditions.',
    knobImageUrl: `${MEDIA}/Pos%203.png`,
  },
  {
    slug: 'society', label: 'Society', eyebrow: 'The civic imagination',
    title: 'Make society feel newly possible.',
    introduction: 'Communities, cities and industries are stories made durable through systems.',
    iAm: 'A citizen and co-designer of the structures around me.',
    iCanBe: 'Part of a place that rewards participation, dignity and imagination.',
    whatToDo: 'Discover civic programmes, public events and system-level cases.',
    knobImageUrl: `${MEDIA}/Pos%204.png`, iconUrl: `${MEDIA}/mycommunitypic.png`,
    textImageUrl: `${MEDIA}/mycommunitytxt.png`,
  },
  {
    slug: 'world', label: 'World', eyebrow: 'The beautiful impossible',
    title: 'The whole world is still ours to imagine.',
    introduction: 'At the widest scale, beautiful success becomes a civilizational proposition.',
    iAm: 'A temporary custodian of a living planet and a shared future.',
    iCanBe: 'Part of a civilization worthy of its extraordinary potential.',
    whatToDo: 'Enter flagship gatherings, global expeditions and transformative questions.',
    knobImageUrl: `${MEDIA}/pos%20world.png`, iconUrl: `${MEDIA}/wholeworldglobe.png`,
    textImageUrl: `${MEDIA}/wholeworldtext.png`,
  },
];

export const getScaleWorld = (slug: ImpactScale) =>
  SCALE_WORLDS.find((world) => world.slug === slug) ?? SCALE_WORLDS[0];
