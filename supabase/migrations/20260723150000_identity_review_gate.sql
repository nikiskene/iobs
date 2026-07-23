-- supabase/migrations/20260723150000_identity_review_gate.sql
-- Keep measured HOW/context records out of the human identity review queue.

alter table public.identity_signals
  add column if not exists review_eligible boolean not null default false;

update public.identity_signals
set review_eligible = (
  classification = 'what'
  and coalesce(identity_relevance, 0) >= 60
  and coalesce(evidence_strength, 0) >= 40
  and coalesce(model_confidence, 0) >= 0.55
  and coalesce(extraction_model, '') not like 'heuristic%'
);

