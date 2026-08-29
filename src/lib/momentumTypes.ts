import type { Profile } from './types';

export type MomentumStatus = 'pushing' | 'waiting' | 'stuck' | 'fact';
export type MomentumPriority = 'low' | 'normal' | 'high';

export interface MomentumItem {
  id: string;
  title: string;
  description: string | null;
  owner_user_id: string | null;
  status: MomentumStatus;
  priority: MomentumPriority;
  target_date: string | null;
  next_move: string | null;
  waiting_on: string | null;
  waiting_since: string | null;
  stuck_reason: string | null;
  intervention_needed: string | null;
  category: string | null;
  fact_summary: string | null;
  created_by: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type MomentumOwner = Pick<Profile, 'id' | 'full_name' | 'photo_url' | 'role' | 'is_team_member'>;

export const momentumCategories = [
  'Interviews', 'Events', 'Partnerships', 'Award', 'Cases', 'Content',
  'Dubai', 'Nordics', 'China', 'Operations', 'Other',
];
