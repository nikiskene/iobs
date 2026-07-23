-- supabase/migrations/20260723143000_backfill_identity_gap_counts.sql
-- Make historical scans usable in the Identity Gap visualization.

with breakdown as (
  select
    document.scan_run_id,
    count(*) filter (where signal.classification = 'what') as what_signals,
    count(*) filter (where signal.classification = 'how') as how_signals,
    count(*) filter (where signal.classification = 'context') as context_signals
  from public.identity_documents document
  join public.identity_signals signal on signal.document_id = document.id
  where document.scan_run_id is not null
  group by document.scan_run_id
)
update public.identity_scan_runs run
set counts = coalesce(run.counts, '{}'::jsonb) || jsonb_build_object(
  'what_signals', breakdown.what_signals,
  'how_signals', breakdown.how_signals,
  'context_signals', breakdown.context_signals
)
from breakdown
where run.id = breakdown.scan_run_id;
