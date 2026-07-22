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
  { step: '3', label: 'Cluster duplicate stories' },
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
    items: ['GDELT', 'Media Cloud'],
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
  { label: 'Headlines discovered', value: 'up to 2,000' },
  { label: 'Entity matches', value: '200' },
  { label: 'Story clusters', value: '50' },
  { label: 'Retrieved documents', value: '20' },
  { label: 'AI candidates', value: '10' },
  { label: 'Admin review candidates', value: '3–7' },
  { label: 'Approved signals', value: '0–3' },
];

export const decisionsLog: string[] = [
  'W01 admin only',
  'Fortune 50 first',
  'public/member/explorer/team/admin model planned but not activated',
  'Explorer means a manually granted research contributor',
  'members/public release comes only after the workflow is proven',
  'explicit identity statements first; behavioral inference later',
  'daily automation only after a seven-day manual-assisted pilot',
];

export const visualizationSections: string[] = [
  'WE ARE',
  'WE ARE BECOMING',
  'WE REMAIN',
  'WE ARE NO LONGER',
  'MOSTLY HOW',
];
