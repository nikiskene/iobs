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
  { number: '01', title: 'What became possible?', copy: 'What do you offer?' },
  { number: '02', title: 'Who benefits as it grows?', copy: 'What is the echo you create?' },
  { number: '03', title: 'What does success cost?', copy: 'What did you unlock - and what did it require?' },
  { number: '04', title: 'Can the value endure?', copy: 'Is your growth good for humans and non-humans?' },
  { number: '05', title: 'Does growth improve the system?', copy: 'What outlasts you?' },
];

export const RECOGNITION_LEVELS = [
  ['Selected', 'Meets the standard and enters the annual record.'],
  ['Distinguished', 'A defining example within its scale.'],
  ['Beautiful Success Laureate', 'The rare achievement that changes what success can mean.'],
  ['Grand Prix', 'The most distinguished approach to create and scale beautiful success.'],
];
