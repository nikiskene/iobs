-- supabase/migrations/20260723083000_add_identity_quality_scores.sql
-- Keep identity relevance separate from evidence quality and model confidence.

alter table public.identity_signals
  add column if not exists identity_relevance integer
    check (identity_relevance between 0 and 100),
  add column if not exists evidence_strength integer
    check (evidence_strength between 0 and 100);
