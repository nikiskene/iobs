// src/content/awardContent.ts
import type { ImpactScale } from '../providers/ImpactScaleProvider';

export type AwardCategory = {
  slug: ImpactScale;
  name: string;
  definition: string;
  fee: string;
  examples: string;
};

export const AWARD_CATEGORIES: AwardCategory[] = [
  { slug: 'me', name: 'Just Me', fee: '$250', definition: 'Personal transformation, courage, recovery or a life intentionally rebuilt.', examples: 'A success that makes one life more fully alive.' },
  { slug: 'circle', name: 'My Community', fee: '$400', definition: 'Achievements that strengthen belonging, dignity, care and shared life.', examples: 'A success whose value grows as more people belong.' },
  { slug: 'teams', name: 'My Team', fee: '$750', definition: 'Extraordinary results created through an unusually beautiful way of working.', examples: 'A success that makes collaboration more human.' },
  { slug: 'organizations', name: 'My Company', fee: '$1,500', definition: 'Commercial achievement that creates increasing value for people and planet.', examples: 'The more successful the company, the better its consequence.' },
  { slug: 'country', name: 'My Country', fee: '$3,000', definition: 'Institutions, policies and national initiatives that expand collective possibility.', examples: 'A success that strengthens a country and its future generations.' },
  { slug: 'society', name: 'The Whole World', fee: '$5,000', definition: 'Proven achievements with meaningful global or planetary consequence.', examples: 'A success whose positive impact compounds across borders.' },
  { slug: 'world', name: 'Beyond Our World', fee: '$7,500', definition: 'Space, frontier science and achievements expanding humanity’s horizon responsibly.', examples: 'A success that enlarges possibility without abandoning responsibility.' },
];

export const AWARD_TEST = [
  { number: '01', title: 'Is it successful?', copy: 'What has demonstrably been achieved—and for whom?' },
  { number: '02', title: 'Is it beautiful?', copy: 'Are the means, relationships and consequences worthy of admiration?' },
  { number: '03', title: 'Does it improve with scale?', copy: 'If it becomes ten or one thousand times more successful, does the world become better?' },
];

export const RECOGNITION_LEVELS = [
  ['Official Selection', 'Verified work worthy of the global archive.'],
  ['Finalist', 'Up to seven exceptional successes at each scale.'],
  ['Laureate', 'One Beautiful Success Laureate at each scale.'],
  ['Grand Laureate', 'One defining achievement across all seven scales.'],
];
