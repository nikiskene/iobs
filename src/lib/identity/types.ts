// src/lib/identity/types.ts
export type IdentityRunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type IdentityReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_evidence';
export type IdentityReviewDecision = 'approved' | 'rejected' | 'rewritten' | 'needs_evidence';
export type IdentityClassification = 'what' | 'how' | 'context';
export type IdentitySignalType =
  | 'definition'
  | 'purpose'
  | 'aspiration'
  | 'promise'
  | 'preservation'
  | 'rejection'
  | 'external_interpretation';
export type IdentitySpeakerType = 'self' | 'attributed' | 'editorial' | 'system';
export type IdentityDirection = 'preserves' | 'strengthens' | 'changes' | 'abandons' | 'unclear';
export type IdentityExplicitness = 'explicit' | 'strongly_implied';
export type IdentityVisibility = 'admin_only' | 'team' | 'explorers' | 'members' | 'public';
export type IdentitySourceTier = 'primary' | 'discovery' | 'media';
export type IdentitySourceRegion =
  | 'europe'
  | 'north_america'
  | 'asia'
  | 'china'
  | 'middle_east'
  | 'south_america'
  | 'global'
  | 'other';

export type IdentityEntity = {
  id: string;
  name: string;
  slug: string;
  entity_type: 'company' | 'country' | 'organization';
  country_code: string | null;
  region: IdentitySourceRegion | null;
  fortune_rank: number | null;
  aliases: string[];
  official_domains: string[];
  active: boolean;
};

export type IdentitySource = {
  id: string;
  name: string;
  domain: string | null;
  source_tier: IdentitySourceTier;
  region: IdentitySourceRegion;
  country_code: string | null;
  languages: string[];
  feed_url: string | null;
  active: boolean;
  automation_allowed: boolean;
  terms_notes: string | null;
};

export type IdentityScanRun = {
  id: string;
  run_date: string;
  mode: string;
  status: IdentityRunStatus;
  scope: Record<string, unknown>;
  counts: Record<string, number | string>;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
};

export type IdentitySignal = {
  id: string;
  entity_id: string;
  document_id: string;
  story_cluster_id: string | null;
  speaker_type: IdentitySpeakerType;
  speaker_name: string | null;
  speaker_role: string | null;
  evidence_text: string;
  classification: IdentityClassification;
  signal_type: IdentitySignalType | null;
  identity_dimension: string | null;
  direction: IdentityDirection;
  temporal_orientation: string | null;
  explicitness: IdentityExplicitness;
  candidate_sentence: string;
  model_interpretation: string | null;
  model_confidence: number | null;
  extraction_model: string | null;
  prompt_version: string | null;
  review_status: IdentityReviewStatus;
  visibility: IdentityVisibility | 'research_team';
  created_at: string;
  updated_at: string;
};

export type IdentityDocument = {
  id: string;
  source_id: string | null;
  scan_run_id: string | null;
  story_cluster_id: string | null;
  canonical_url: string;
  title: string;
  snippet: string | null;
  published_at: string | null;
  language: string | null;
  source_region: IdentitySourceRegion | null;
  status: 'discovered' | 'shortlisted' | 'retrieved' | 'discovery_only' | 'rejected';
  content_hash: string | null;
  evidence_excerpt: string | null;
  evidence_location: string | null;
  retain_until: string | null;
  discovered_at: string;
  metadata: Record<string, unknown>;
};

export type SignalWithRelations = IdentitySignal & {
  entity?: Pick<IdentityEntity, 'name' | 'slug'> | null;
  document?: Pick<IdentityDocument, 'title' | 'canonical_url' | 'snippet' | 'source_region'> | null;
};

export type ScanRunCounts = {
  documents_found: number;
  clusters: number;
  candidate_signals: number;
  pending_review: number;
  approved_signals: number;
  [key: string]: number | string;
};
