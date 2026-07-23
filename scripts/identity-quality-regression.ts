// scripts/identity-quality-regression.ts
import { hasIdentityLanguage, isGrounded } from '../supabase/functions/identity-discovery/qualityGate.ts';
import { matchEntities } from '../supabase/functions/identity-discovery/extraction.ts';

const cases = [
  {
    name: 'Bluetongue is not identity',
    evidence: 'Overview of current bluetongue cases, risk level, vaccinations and restrictions.',
    expected: false,
  },
  {
    name: 'Partnership is not purpose',
    evidence: 'We are partnering with Screwfix to help tradespeople use AI tools.',
    expected: false,
  },
  {
    name: 'Expansion is not aspiration',
    evidence: 'Amazon Leo targets India for satellite broadband expansion.',
    expected: false,
  },
  {
    name: 'Explicit definition is identity',
    evidence: 'We are a people who never stop building.',
    expected: true,
  },
  {
    name: 'Explicit preservation is identity',
    evidence: 'We vow to ensure our Republic remains the fiercest guardian of freedom.',
    expected: true,
  },
  {
    name: 'Desired role is identity',
    evidence: 'America will continue to lead humanity into a new age of discovery.',
    expected: true,
  },
];

for (const fixture of cases) {
  const actual = hasIdentityLanguage(fixture.evidence);
  if (actual !== fixture.expected) {
    throw new Error(`${fixture.name}: expected ${fixture.expected}, received ${actual}`);
  }
}

const source = 'The institution states: We are a people who never stop building. This is its claim.';
if (!isGrounded(source, 'We are a people who never stop building.')) {
  throw new Error('Exact evidence should be grounded.');
}
if (isGrounded(source, 'We exist to protect every person everywhere.')) {
  throw new Error('Invented evidence must not pass.');
}

const article = {
  url: 'https://example.com/account-update',
  title: 'Apple account update',
  snippet: 'A routine product announcement.',
  publishedAt: null,
  language: 'en',
  domain: 'example.com',
  sourceName: 'Example',
};
const entities = [
  { id: 'un', name: 'UN', aliases: [], region: 'global', official_domains: [] },
  { id: 'apple', name: 'Apple', aliases: [], region: 'north_america', official_domains: [] },
];
const matches = matchEntities(article, entities);
if (matches.length !== 1 || matches[0].id !== 'apple') {
  throw new Error('Entity matching must use whole names, not substrings.');
}

console.log(`Identity quality regression passed: ${cases.length + 3} checks.`);
