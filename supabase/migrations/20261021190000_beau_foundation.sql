-- BEAU foundation. Institutional seed material is supplied privately, never committed here.
begin;
set local lock_timeout = '5s';
create table if not exists public.beau_knowledge (
 id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
 category text not null, content text not null,
 status text not null default 'working_draft' check(status in ('approved','working_draft','superseded','archived')),
 visibility text not null default 'internal' check(visibility in ('internal','restricted')),
 source_note text, updated_at timestamptz not null default now(),
 search_vector tsvector generated always as (to_tsvector('english',coalesce(title,'')||' '||coalesce(content,''))) stored
);
alter table public.beau_knowledge
 add column if not exists chapter_id uuid references public.chapters(id) on delete restrict,
 add column if not exists faq_questions text[] not null default '{}',
 add column if not exists faq_answer text not null default '',
 add column if not exists version integer not null default 1,
 add column if not exists created_by uuid references public.profiles(id) on delete set null,
 add column if not exists updated_by uuid references public.profiles(id) on delete set null,
 add column if not exists created_at timestamptz not null default now();
create index if not exists beau_knowledge_search_idx on public.beau_knowledge using gin(search_vector);
create index if not exists beau_knowledge_category_idx on public.beau_knowledge(category,status);
create table if not exists public.beau_knowledge_versions (
 knowledge_id uuid references public.beau_knowledge(id) on delete cascade, version integer not null,
 snapshot jsonb not null, changed_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(), primary key(knowledge_id,version)
);
create table if not exists public.beau_conversations (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null default 'New conversation' check(char_length(title) between 1 and 160),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists beau_conversations_owner_idx on public.beau_conversations(user_id,updated_at desc);
create table if not exists public.beau_messages (
 id uuid primary key default gen_random_uuid(), seq bigint generated always as identity unique, conversation_id uuid not null references public.beau_conversations(id) on delete cascade,
 role text not null check(role in ('user','assistant')), content text not null default '',
 status text not null default 'complete' check(status in ('streaming','complete','interrupted','failed')),
 reply_to uuid references public.beau_messages(id) on delete set null,
 attachment_ids uuid[] not null default '{}', metadata jsonb not null default '{}',
 created_at timestamptz not null default now()
);
create index if not exists beau_messages_conversation_idx on public.beau_messages(conversation_id,created_at);
alter table public.beau_messages add column if not exists search_vector tsvector generated always as (to_tsvector('simple',content)) stored;
create index if not exists beau_messages_search_idx on public.beau_messages using gin(search_vector);
create table if not exists public.beau_files (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 conversation_id uuid references public.beau_conversations(id) on delete cascade,
 knowledge_id uuid references public.beau_knowledge(id) on delete cascade,
 file_name text not null, storage_path text not null unique, content_hash text not null, file_size bigint not null check(file_size between 1 and 5242880),
 extracted_text text not null check(char_length(extracted_text)<=60000),
 created_at timestamptz not null default now(),
 check ((conversation_id is not null)::int + (knowledge_id is not null)::int = 1)
);
create table if not exists public.beau_file_cleanup (
 storage_path text primary key, created_at timestamptz not null default now()
);
create or replace function public.beau_queue_file_cleanup() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.beau_file_cleanup(storage_path) values(old.storage_path) on conflict do nothing; return old; end $$;
create trigger beau_queue_file_cleanup before delete on public.beau_files for each row execute function public.beau_queue_file_cleanup();
create table if not exists public.beau_settings (
 id boolean primary key default true check(id), enabled boolean not null default true,
 mini_model text not null default 'gpt-5.4-mini', intelligence_model text not null default 'gpt-5.4',
 mini_input_price numeric not null default 0.75, mini_cached_price numeric not null default 0.075, mini_output_price numeric not null default 4.5,
 intelligence_input_price numeric not null default 2.5, intelligence_cached_price numeric not null default 0.25, intelligence_output_price numeric not null default 15,
 max_output_tokens integer not null default 2048 check(max_output_tokens between 256 and 8192),
 daily_user_limit integer not null default 100 check(daily_user_limit between 1 and 1000),
 daily_user_budget numeric not null default 2 check(daily_user_budget>0 and daily_user_budget<=100),
 daily_global_budget numeric not null default 20 check(daily_global_budget>0 and daily_global_budget<=10000),
 system_instructions text not null default 'Be clear, concise, curious and constructive. Know what we know. Ask what we do not. Never pretend.',
 updated_at timestamptz not null default now(),
 check(mini_input_price>=0 and mini_cached_price>=0 and mini_cached_price<=mini_input_price and mini_output_price>=0 and intelligence_input_price>=0 and intelligence_cached_price>=0 and intelligence_cached_price<=intelligence_input_price and intelligence_output_price>=0)
);
insert into public.beau_settings(id) values(true) on conflict do nothing;
create table if not exists public.beau_revision(id boolean primary key default true check(id), revision bigint not null default 1);
insert into public.beau_revision(id) values(true) on conflict do nothing;
create table if not exists public.beau_answer_cache (
 user_id uuid not null references public.profiles(id) on delete cascade, cache_key text not null,
 revision bigint not null, answer jsonb not null, expires_at timestamptz not null default now()+interval '1 day',
 primary key(user_id,cache_key)
);
create table if not exists public.beau_usage (
 id uuid primary key, user_id uuid references public.profiles(id) on delete set null,
 level integer not null check(level between 1 and 3), model text,
 api_request boolean not null default false, cache_hit boolean not null default false,
 input_tokens integer not null default 0, cached_tokens integer not null default 0, output_tokens integer not null default 0,
 reserved_cost numeric not null default 0 check(reserved_cost>=0), estimated_cost numeric,
 status text not null default 'pending' check(status in ('pending','complete','failed','interrupted')),
 created_at timestamptz not null default now(), finished_at timestamptz
);
create index if not exists beau_usage_user_day_idx on public.beau_usage(user_id,created_at);
create table if not exists public.beau_turns (
 id uuid primary key, conversation_id uuid not null references public.beau_conversations(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 user_message_id uuid not null references public.beau_messages(id) on delete cascade,
 assistant_message_id uuid not null references public.beau_messages(id) on delete cascade,
 state text not null default 'running' check(state in ('running','complete','failed')),
 created_at timestamptz not null default now()
);
create unique index if not exists beau_one_active_turn on public.beau_turns(conversation_id) where state='running';
create table if not exists public.beau_seed_imports (digest text primary key, imported_at timestamptz not null default now());
create table if not exists public.beau_audit (
 id bigint generated always as identity primary key, actor_id uuid references public.profiles(id) on delete set null,
 action text not null, entity_id uuid, created_at timestamptz not null default now()
);

create or replace function public.beau_active_member(actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=actor and is_active);
$$;
create or replace function public.beau_current_active() returns boolean language sql stable security definer set search_path='' as $$ select public.beau_active_member(auth.uid()); $$;
create or replace function public.beau_admin(actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=actor and is_active and role in ('admin','super_admin'));
$$;
create or replace function public.beau_scope_allowed(actor uuid, visibility text, chapter uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.beau_active_member(actor) and (public.beau_admin(actor) or (visibility='internal' and (chapter is null or exists(
 select 1 from public.profiles p where p.id=actor and (exists(select 1 from public.chapters c where c.id=chapter and c.head_member_id=p.member_id) or exists(select 1 from public.chapter_members m where m.chapter_id=chapter and m.member_id=p.member_id))
 ))));
$$;
create or replace function public.beau_normalize(value text) returns text language sql immutable set search_path='' as $$
 select btrim(regexp_replace(lower(value),'[^[:alnum:]]+',' ','g'));
$$;
create or replace function public.beau_retrieve(actor uuid, query text) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(k)),'[]'::jsonb) from (
 select b.id,b.slug,b.title,b.content,b.category,b.source_note,b.version,b.faq_answer,
 exists(select 1 from unnest(b.faq_questions) q where public.beau_normalize(q)=public.beau_normalize(query)) exact_faq
 from public.beau_knowledge b
 where b.status='approved' and public.beau_scope_allowed(actor,b.visibility,b.chapter_id)
 and (b.search_vector @@ websearch_to_tsquery('english',left(query,500)) or exists(select 1 from unnest(b.faq_questions) q where public.beau_normalize(q)=public.beau_normalize(query)))
 order by exists(select 1 from unnest(b.faq_questions) q where public.beau_normalize(q)=public.beau_normalize(query)) desc,
 ts_rank(b.search_vector,websearch_to_tsquery('english',left(query,500))) desc,b.id limit 6
 ) k;
$$;
create or replace function public.beau_invalidate() returns trigger language plpgsql security definer set search_path='' as $$
begin update public.beau_revision set revision=revision+1 where id; return null; end $$;
create trigger beau_knowledge_invalidate after insert or update or delete on public.beau_knowledge for each statement execute function public.beau_invalidate();
create trigger beau_chapter_invalidate after insert or update or delete on public.chapters for each statement execute function public.beau_invalidate();
create trigger beau_head_invalidate after insert or update or delete on public.team_people for each statement execute function public.beau_invalidate();
create trigger beau_membership_invalidate after insert or update or delete on public.chapter_members for each statement execute function public.beau_invalidate();
create trigger beau_access_invalidate after insert or update of role,is_active,member_id or delete on public.profiles for each statement execute function public.beau_invalidate();
create or replace function public.beau_version_knowledge() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_when='BEFORE' then
  if tg_op='UPDATE' then new.version=old.version+1; end if;
  new.updated_at=now(); return new;
 end if;
 insert into public.beau_knowledge_versions(knowledge_id,version,snapshot,changed_by)
 values(new.id,new.version,to_jsonb(new)-'search_vector',new.updated_by);
 return new;
end $$;
insert into public.beau_knowledge_versions(knowledge_id,version,snapshot,changed_by) select id,version,to_jsonb(k)-'search_vector',updated_by from public.beau_knowledge k on conflict do nothing;
create trigger beau_knowledge_version_before before insert or update on public.beau_knowledge for each row execute function public.beau_version_knowledge();
create trigger beau_knowledge_version_after after insert or update on public.beau_knowledge for each row execute function public.beau_version_knowledge();

create or replace function public.beau_begin_turn(actor uuid, convo uuid, request_id uuid, prompt text, files uuid[] default '{}', regenerate uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u public.beau_messages; a uuid; c public.beau_conversations;
begin
 if not public.beau_active_member(actor) then raise exception 'Membership required.' using errcode='42501'; end if;
 select * into c from public.beau_conversations where id=convo and user_id=actor for update;
 if not found then raise exception 'Conversation access required.' using errcode='42501'; end if;
 if exists(select 1 from public.beau_turns where id=request_id) or exists(select 1 from public.beau_usage where id=request_id) then raise exception 'This request has already been submitted.' using errcode='23505'; end if;
 update public.beau_turns set state='failed' where conversation_id=convo and state='running' and created_at<now()-interval '5 minutes';
 if exists(select 1 from public.beau_turns where conversation_id=convo and state='running') then raise exception 'An answer is already in progress.' using errcode='55000'; end if;
 if regenerate is not null then
  select m.* into u from public.beau_messages m join public.beau_messages reply on reply.reply_to=m.id where reply.id=regenerate and reply.conversation_id=convo and reply.role='assistant' and m.role='user';
  if not found then raise exception 'Answer unavailable.' using errcode='42501'; end if;
  a=regenerate;
 else
  if char_length(btrim(prompt)) not between 1 and 12000 or cardinality(files)>4 then raise exception 'Use up to 12,000 characters and four documents.'; end if;
  if exists(select 1 from unnest(files) f where not exists(select 1 from public.beau_files b where b.id=f and b.user_id=actor and b.conversation_id=convo)) then raise exception 'Attachment access required.' using errcode='42501'; end if;
  insert into public.beau_messages(conversation_id,role,content,attachment_ids) values(convo,'user',btrim(prompt),files) returning * into u;
  insert into public.beau_messages(conversation_id,role,reply_to,status) values(convo,'assistant',u.id,'streaming') returning id into a;
 end if;
 insert into public.beau_turns(id,conversation_id,user_id,user_message_id,assistant_message_id) values(request_id,convo,actor,u.id,a);
 update public.beau_conversations set title=case when title='New conversation' then left(u.content,80) else title end,updated_at=now() where id=convo;
 return jsonb_build_object('user_message',to_jsonb(u),'assistant_id',a,'turn_id',request_id);
end $$;
create or replace function public.beau_reserve(actor uuid, request_id uuid, tier integer, model_id text, reservation numeric, hit boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare settings public.beau_settings; day_start timestamptz=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
begin
 select * into settings from public.beau_settings where id for update;
 if not settings.enabled or not public.beau_active_member(actor) then raise exception 'BEAU is unavailable.' using errcode='42501'; end if;
 if tier not between 1 and 3 or reservation<0 then raise exception 'Invalid reservation.'; end if;
 if (select count(*) from public.beau_usage where user_id=actor and created_at>=day_start)>=settings.daily_user_limit or (select count(*) from public.beau_usage where user_id=actor and created_at>now()-interval '1 minute')>=12 then raise exception 'Your BEAU request limit has been reached.' using errcode='54000'; end if;
 if reservation>0 and ((select coalesce(sum(coalesce(estimated_cost,reserved_cost)),0) from public.beau_usage where user_id=actor and created_at>=day_start)+reservation>settings.daily_user_budget or (select coalesce(sum(coalesce(estimated_cost,reserved_cost)),0) from public.beau_usage where created_at>=day_start)+reservation>settings.daily_global_budget) then raise exception 'The BEAU daily budget has been reached. Knowledge Engine answers are still available.' using errcode='54000'; end if;
 insert into public.beau_usage(id,user_id,level,model,reserved_cost,cache_hit) values(request_id,actor,tier,model_id,reservation,hit);
end $$;
create or replace function public.beau_finish(actor uuid, request_id uuid, answer text, result_status text, meta jsonb, tokens_in integer, tokens_cached integer, tokens_out integer, cost numeric)
returns void language plpgsql security definer set search_path='' as $$
declare t public.beau_turns;
begin
 if result_status not in ('complete','failed','interrupted') then raise exception 'Invalid answer status.'; end if;
 select * into t from public.beau_turns where id=request_id and user_id=actor for update;
 if found and t.state='running' then
  update public.beau_messages set content=answer,status=result_status,metadata=meta where id=t.assistant_message_id and conversation_id=t.conversation_id;
  update public.beau_turns set state=case when result_status='complete' then 'complete' else 'failed' end where id=request_id;
  update public.beau_conversations set updated_at=now() where id=t.conversation_id;
 end if;
 update public.beau_usage set status=result_status,input_tokens=greatest(tokens_in,0),cached_tokens=greatest(tokens_cached,0),output_tokens=greatest(tokens_out,0),estimated_cost=cost,finished_at=now() where id=request_id and user_id=actor and status='pending';
end $$;

create or replace function public.beau_history_search(actor uuid, phrase text) returns setof public.beau_conversations language sql stable security definer set search_path='' as $$
 select c.* from public.beau_conversations c where c.user_id=actor and public.beau_active_member(actor) and
 (btrim(phrase)='' or to_tsvector('simple',c.title) @@ websearch_to_tsquery('simple',left(phrase,200)) or exists(select 1 from public.beau_messages m where m.conversation_id=c.id and m.search_vector @@ websearch_to_tsquery('simple',left(phrase,200))))
 order by c.updated_at desc limit 100;
$$;
create or replace function public.beau_cache_lookup(actor uuid, key text) returns jsonb language sql stable security definer set search_path='' as $$
 select answer from public.beau_answer_cache c where c.user_id=actor and c.cache_key=key and c.expires_at>now() and public.beau_active_member(actor) and c.revision=(select revision from public.beau_revision where id);
$$;
create or replace function public.beau_cache_store(actor uuid, key text, payload jsonb, observed_revision bigint) returns void language plpgsql security definer set search_path='' as $$
begin
 if public.beau_active_member(actor) and observed_revision=(select revision from public.beau_revision where id) then
  delete from public.beau_answer_cache where expires_at<now() or revision<>observed_revision;
  insert into public.beau_answer_cache(user_id,cache_key,revision,answer) values(actor,key,observed_revision,payload)
  on conflict(user_id,cache_key) do update set revision=excluded.revision,answer=excluded.answer,expires_at=now()+interval '1 day';
 end if;
end $$;
create or replace function public.beau_usage_report(actor uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.beau_admin(actor) then raise exception 'Admin access required.' using errcode='42501'; end if;
 select jsonb_build_object('days',coalesce((select jsonb_agg(d) from (
  select (created_at at time zone 'UTC')::date as "day",level,model,count(*) requests,count(*) filter(where api_request) api_requests,count(*) filter(where cache_hit) cache_hits,
  sum(input_tokens) input_tokens,sum(cached_tokens) cached_tokens,sum(output_tokens) output_tokens,sum(coalesce(estimated_cost,reserved_cost)) estimated_cost,count(*) filter(where status='pending') pending_requests
  from public.beau_usage where created_at>=now()-interval '30 days' group by 1,2,3 order by 1 desc,2
 ) d),'[]'::jsonb),'active_users',(select count(distinct user_id) from public.beau_usage where created_at>=now()-interval '30 days')) into result;
 return result;
end $$;
create or replace function public.beau_limit_uploads() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.profiles where id=new.user_id for update;
 if (select count(*) from public.beau_files where user_id=new.user_id)>=100 or (select coalesce(sum(file_size),0) from public.beau_files where user_id=new.user_id and created_at>now()-interval '1 day')+new.file_size>52428800 then
  raise exception 'Your document storage allowance has been reached.' using errcode='54000';
 end if;
 return new;
end $$;
create trigger beau_limit_uploads before insert on public.beau_files for each row execute function public.beau_limit_uploads();
create or replace function public.beau_private_memory(actor uuid, phrase text, current_conversation uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from (
  select c.title conversation,m.role,left(m.content,2000) content from public.beau_messages m join public.beau_conversations c on c.id=m.conversation_id
  where c.user_id=actor and c.id<>current_conversation and public.beau_active_member(actor) and m.status='complete'
  and (m.search_vector @@ websearch_to_tsquery('simple',left(phrase,200)) or phrase ~* '(last time|left off|our discussion|continue.*discussion|previous conversation)')
  order by c.updated_at desc,m.seq desc limit 6
 ) x;
$$;
-- Explicit grants: only owners can read chats. Even Admins get no private-chat exception.
do $$ declare name text; begin
 foreach name in array array['beau_knowledge','beau_knowledge_versions','beau_conversations','beau_messages','beau_files','beau_file_cleanup','beau_settings','beau_revision','beau_answer_cache','beau_usage','beau_turns','beau_audit','beau_seed_imports'] loop
  execute format('alter table public.%I enable row level security',name);
  execute format('revoke all on public.%I from public,anon,authenticated',name);
  execute format('grant all on public.%I to service_role',name);
 end loop;
end $$;
grant usage,select on sequence public.beau_audit_id_seq to service_role;
grant select on public.beau_conversations,public.beau_messages to authenticated;
create policy beau_owner_conversations on public.beau_conversations for select to authenticated using(user_id=auth.uid() and public.beau_current_active());
create policy beau_owner_messages on public.beau_messages for select to authenticated using(public.beau_current_active() and exists(select 1 from public.beau_conversations c where c.id=conversation_id and c.user_id=auth.uid()));
do $$ declare f record; begin
 for f in select oid::regprocedure signature from pg_proc where pronamespace='public'::regnamespace and proname like 'beau_%' loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
grant execute on function public.beau_current_active() to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('beau-files','beau-files',false,5242880,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/markdown']) on conflict(id) do nothing;
-- No browser Storage policy is added; uploads/downloads pass the authenticated BEAU handler.
commit;
