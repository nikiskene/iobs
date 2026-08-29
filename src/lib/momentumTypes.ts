import type { Profile } from './types';

export type MomentumStatus = 'pushing' | 'waiting' | 'stuck' | 'fact';
export type MomentumPriority = 'low' | 'normal' | 'high';
export type MomentumDocumentCategory = 'legal' | 'pitch' | 'partner' | 'sales' | 'research' | 'interview_media' | 'event' | 'operations' | 'case_content' | 'other';

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
  desired_output: string | null;
  definition_of_done: string | null;
  dependency_note: string | null;
  target_period: string | null;
  requires_document: boolean;
  document_requirement_note: string | null;
  source_key: string | null;
  created_by: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  archived_at: string | null;
  archived_by: string | null;
}

export interface MomentumDocument {
  id: string;
  momentum_item_id: string;
  title: string;
  description: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  category: MomentumDocumentCategory;
}

export type MomentumOwner = Pick<Profile, 'id' | 'full_name' | 'photo_url' | 'role' | 'is_team_member'>;

export const momentumCategories = [
  'Interviews', 'Events', 'Partnerships', 'Award', 'Cases', 'Content',
  'Dubai', 'Nordics', 'China', 'Operations', 'Other',
];

export const momentumDocumentCategories: { value: MomentumDocumentCategory; label: string }[] = [
  { value: 'legal', label: 'Legal' },
  { value: 'pitch', label: 'Pitch & presentations' },
  { value: 'partner', label: 'Partners & sponsorships' },
  { value: 'sales', label: 'Sales & outreach' },
  { value: 'research', label: 'Research & methodology' },
  { value: 'interview_media', label: 'Interviews & media' },
  { value: 'event', label: 'Events & production' },
  { value: 'operations', label: 'Operations & governance' },
  { value: 'case_content', label: 'Cases & content' },
  { value: 'other', label: 'Other' },
];
