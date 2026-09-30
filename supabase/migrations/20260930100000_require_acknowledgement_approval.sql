-- Keep every acknowledgement nomination out of the public gallery until an admin approves it.
alter table public.acknowledgement_nominations
  alter column is_visible set default false;

-- Existing entries now need the same explicit approval as future submissions.
update public.acknowledgement_nominations
set is_visible = false
where is_visible;
