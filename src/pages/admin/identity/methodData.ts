// src/pages/admin/identity/methodData.ts
export type TriggerRow = {
  name: string;
  pattern: string;
  question: string;
};

export const triggerGrammar: TriggerRow[] = [
  { name: 'Definition', pattern: '"We are…"', question: 'Who are we?' },
  { name: 'Purpose', pattern: '"Our role or purpose is…"', question: 'Why do we exist?' },
  { name: 'Aspiration', pattern: '"We want to become…"', question: 'Who are we becoming?' },
  { name: 'Promise', pattern: '"We will be known for…"', question: 'What will define us?' },
  { name: 'Preservation', pattern: '"We remain…"', question: 'What must not change?' },
  { name: 'Rejection', pattern: '"We are no longer…"', question: 'What identity is being left behind?' },
  {
    name: 'External interpretation',
    pattern: '"They are" or "X is becoming"',
    question: 'Candidate only, lower confidence.',
  },
  {
    name: 'Context',
    pattern: '"There is", launches, invests, appoints',
    question: 'Usually not identity.',
  },
];

export type FunnelStage = { step: string; label: string };

export const funnelStages: FunnelStage[] = [
  { step: '1', label: 'Discover broadly' },
  { step: '2', label: 'Match entities and trigger language' },
  { step: '3', label: 'Deduplicate URLs and content hashes' },
  { step: '4', label: 'Retrieve selected evidence' },
  { step: '5', label: 'Extract candidate identity signals' },
  { step: '6', label: 'Admin review' },
  { step: '7', label: 'Daily Identity Scan' },
];

export type SourceTier = {
  tier: string;
  title: string;
  items: string[];
};

export const sourceTiers: SourceTier[] = [
  {
    tier: 'Tier 1',
    title: 'Primary sources',
    items: [
      'Government / ministry sites, speeches, policy documents',
      'Central banks',
      'Company newsrooms, investor relations, CEO letters, annual reports',
    ],
  },
  {
    tier: 'Tier 2',
    title: 'Global discovery',
    items: ['GDELT (secondary discovery)', 'Media Cloud (planned)'],
  },
  {
    tier: 'Tier 3',
    title: 'Curated media',
    items: [
      'Balanced across Europe, North America, Asia, China, Middle East, South America',
    ],
  },
];

export type LimitRow = { label: string; value: string };

export const dailyLimits: LimitRow[] = [
  { label: 'Entity coverage', value: 'all active Fortune 50, G7, and BRICS entities' },
  { label: 'Discovery queries', value: 'entities grouped in batches of 5' },
  { label: 'Documents screened per run', value: 'several hundred' },
  { label: 'Documents analyzed per run', value: 'up to 400 relevant candidates' },
  { label: 'Per region', value: 'maximum 60' },
  { label: 'Per source', value: 'maximum 15' },
  { label: 'Per entity', value: 'maximum 20' },
  { label: 'AI analysis batch', value: '20 documents' },
  { label: 'Admin review observations', value: 'only materially useful items' },
  { label: 'Approved signals', value: '0–10' },
];

export const decisionsLog: string[] = [
  'W01 admin only',
  'Fortune 50 first',
  'admin/team/explorer/member/public visibility is recorded; delivery remains admin only',
  'Explorer means a manually granted research contributor',
  'members/public release comes only after the workflow is proven',
  'explicit identity statements first; behavioral inference later',
  'daily automation active; failed feeds remain visible through source health',
  'only sources with explicit automation rights enter unattended ingestion',
  'the first 59 stored classifications were fully audited and quarantined from all metrics',
  'identity yield counts unique evidence-assessed documents, never raw signal rows',
];

export const visualizationSections: string[] = [
  'WE ARE',
  'WE ARE BECOMING',
  'WE REMAIN',
  'WE ARE NO LONGER',
  'MOSTLY HOW',
];
