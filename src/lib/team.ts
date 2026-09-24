export const TEAM_CATEGORIES = [
  ['founders', 'Founders'],
  ['team', 'Team'],
  ['supporters', 'Supporters'],
  ['advisory_board', 'Advisory Board'],
] as const;

export type TeamPerson = {
  id: string;
  full_name: string;
  category: typeof TEAM_CATEGORIES[number][0];
  status: 'draft' | 'published' | 'archived';
  title: string;
  description: string;
  photo_url: string;
  linkedin_url: string;
  substack_url: string;
  sort_order: number;
};

export function safeWebUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}
