-- supabase/migrations/20260723160000_identity_quality_audit.sql
-- Quarantine the fully audited legacy corpus without deleting its review history.

alter table public.identity_signals
  add column if not exists quality_status text not null default 'unverified'
    check (quality_status in ('unverified', 'verified', 'invalid'));

update public.identity_signals
set quality_status = 'invalid',
    review_eligible = false;

update public.identity_scan_runs
set counts = coalesce(counts, '{}'::jsonb) || jsonb_build_object(
  'what_documents', 0,
  'how_documents', 0,
  'context_documents', 0,
  'analysis_complete', 0,
  'legacy_audit_invalid', true
)
where exists (
  select 1
  from public.identity_documents document
  where document.scan_run_id = identity_scan_runs.id
);

create unique index if not exists identity_signals_one_verified_entity_document
  on public.identity_signals (document_id, entity_id)
  where quality_status = 'verified';
