export interface AcknowledgementNomination {
  id: string;
  company_name: string;
  website: string;
  image_url: string;
  description: string;
  ray: string;
  principles: Record<string, string>;
  created_at: string;
  upvotes: number;
  downvotes: number;
  my_vote: number;
}
export function safeWebUrl(value: string): string | undefined {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
