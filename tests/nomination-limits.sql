-- Run against the migrated database as an administrator. All changes roll back.
begin;
create function pg_temp.expect_limit_error(q text) returns void language plpgsql as $$
begin
  begin execute q; exception when others then
    if sqlerrm like '%3,000%' then return; end if;
    raise;
  end;
  raise exception 'Expected size rejection';
end $$;
do $test$
declare uid uuid; nid uuid; k text; paragraph text := 'DuBois et fils creates new value from assets that had effectively reached the end of their commercial life.
Its historic movements were not newly manufactured for the watches. They had already been produced decades ago and were sitting unused in old inventories. Rather than treating “old” as inferior and consuming new raw materials simply because new production is possible, DuBois et fils restores these movements and builds contemporary watches around them.
This changes the starting question from “What new thing can we manufacture?” to “What value is already here that we have stopped seeing?”
The result does not depend on guarding a scarce new technology. Much of its value comes from recovering, understanding and sharing existing engineering, craftsmanship and history. Every restored movement becomes evidence that creation does not necessarily require more extraction or more production.'; args jsonb;
begin
  select id into uid from auth.users limit 1;
  perform set_config('request.jwt.claim.sub',uid::text,true);
  update public.nomination_settings set mode='acknowledgement' where id;
  update public.acknowledgement_nominations set created_at=created_at-interval '2 days' where submitted_by=uid and created_at>now()-interval '1 day';
  args:=jsonb_build_object('offer',paragraph,'create',paragraph,'echo',paragraph,'momentum',paragraph,'legacy',paragraph);
  nid:=public.submit_acknowledgement('Boundary test','https://example.invalid','',paragraph,'society',args,'Test','test@example.invalid');
  perform public.update_my_acknowledgement(nid,'Boundary test','https://example.invalid','',repeat('x',3000),'society',jsonb_build_object('offer',repeat('x',3000)));
  perform pg_temp.expect_limit_error(format('select public.submit_acknowledgement(%L,%L,%L,%L,%L,%L::jsonb,%L,%L)','Boundary test','https://example.invalid','',repeat('x',3001),'society',args,'Test','test@example.invalid'));
  foreach k in array array['offer','create','echo','momentum','legacy'] loop
    perform pg_temp.expect_limit_error(format('select public.submit_acknowledgement(%L,%L,%L,%L,%L,%L::jsonb,%L,%L)','Boundary test','https://example.invalid','',paragraph,'society',jsonb_build_object(k,repeat('x',3001)),'Test','test@example.invalid'));
  end loop;
  perform pg_temp.expect_limit_error(format('update public.acknowledgement_nominations set principles=%L::jsonb where id=%L',jsonb_build_object('offer',repeat('x',3001)),nid));
  perform pg_temp.expect_limit_error(format('select public.update_my_acknowledgement(%L,%L,%L,%L,%L,%L,%L::jsonb)',nid,'Boundary test','https://example.invalid','',paragraph,'society',jsonb_build_object('echo',repeat('x',3001))));
  update public.nomination_settings set mode='award' where id;
  args:=jsonb_build_object('offer',repeat('x',3000),'create',repeat('x',3000),'echo',repeat('x',3000),'momentum',repeat('x',3000),'legacy',repeat('x',3000));
  perform public.submit_award_nomination('Boundary test','test@example.invalid','society','The World',args,'','en');
  perform pg_temp.expect_limit_error(format('select public.submit_award_nomination(%L,%L,%L,%L,%L::jsonb,%L,%L)','Boundary test','test@example.invalid','society','The World',jsonb_build_object('offer',repeat('x',3001)),'','en'));
end $test$;
rollback;
select 'Database rollback boundary tests passed; no test data retained' as result;
