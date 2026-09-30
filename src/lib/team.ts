export const TEAM_CATEGORIES = [
  ['founders', 'Co-founders'],
  ['advisory_board', 'Advisors'],
  ['supporters', 'Supporters'],
  ['team', 'Team'],
  ['user', 'Users'],
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
