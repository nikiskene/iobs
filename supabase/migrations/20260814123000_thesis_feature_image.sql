alter table thesis_media
add column if not exists is_featured boolean not null default false;

create unique index if not exists thesis_media_one_featured_per_thesis
on thesis_media (thesis_id)
where is_featured = true;