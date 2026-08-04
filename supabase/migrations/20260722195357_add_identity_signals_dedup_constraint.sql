-- supabase/migrations/20260722195357_add_identity_signals_dedup_constraint.sql
-- Add a unique constraint to prevent duplicate signals on retry.
create unique index if not exists identity_signals_document_candidate_uniq
  on public.identity_signals (document_id, candidate_sentence);
