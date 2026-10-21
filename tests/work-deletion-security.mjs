import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
await db.exec(read('./fixtures/chapters-base.sql'));
await db.exec(`create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); alter table storage.objects add column owner_id text;`);
for (const file of ['20260829120000_team_momentum_mvp.sql','20260829190000_momentum_documents_and_deliverables.sql','20260829220000_momentum_fact_archive_and_document_categories.sql','20261021180000_work_item_deletion.sql'])
  await db.exec(read('../supabase/migrations/' + file));
const ids = Array.from({length: 4}, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12,'0')}`);
const [superadmin, admin, team, inactive] = ids;
await db.exec('alter table profiles disable trigger protect_profile_access_fields');
for (let i = 0; i < ids.length; i++) {
  await db.query('insert into team_people(id,full_name) values($1,$2)', [ids[i], 'Fixture '+i]);
  await db.query('insert into profiles(id,member_id,profile_name,role,is_team_member,is_active) values($1,$1,$2,$3,true,$4)', [ids[i], 'fixture'+i, i===2?'explorer':'admin', i!==3]);
}
await db.exec('alter table profiles enable trigger protect_profile_access_fields');
await db.query('insert into work_item_deletion_admins(user_id) values($1),($2)',[superadmin,inactive]);
await db.query("insert into momentum_items(id,title,owner_user_id) values($1,'Fixture item',$2)",[ids[0],team]);
await db.query("insert into storage.objects(bucket_id,name) values('momentum-documents',$1)",[ids[0]+'/fixture.pdf']);
await db.query("insert into momentum_documents(momentum_item_id,title,file_name,storage_path) values($1,'Keep this file','fixture.pdf',$2)",[ids[0],ids[0]+'/fixture.pdf']);
const before = (await db.query('select count(*)::int n from momentum_activity')).rows[0].n;
let count = 0;
const check = (v, label) => { assert.ok(v,label); count++; console.log('PASS',label); };
async function as(id, role='authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);
  await db.exec('set role '+role);
}
async function denied(sql, values=[]) { try { await db.query(sql,values); return false; } catch { return true; } }
for (const id of [admin,team,inactive]) {
  await as(id);
  check(!(await db.query('select can_delete_work_items() allowed')).rows[0].allowed,'unprivileged or inactive identity has no deletion capability '+id);
  check(await denied('select delete_work_item($1)',[ids[0]]),'unprivileged RPC deletion denied '+id);
}
await as(team);
check(await denied('insert into work_item_deletion_admins(user_id) values($1)',[team]),'member cannot grant deletion to self');
check(await denied('insert into momentum_items(title,deleted_at) values($1,now())',['Forged']),'member cannot create pre-deleted records');
check(await denied('update momentum_items set deleted_at=now() where id=$1',[ids[0]]),'member cannot bypass RPC with direct update');
await db.query('update momentum_items set next_move=$1 where id=$2',['Existing editing still works',ids[0]]);
check((await db.query('select next_move from momentum_items where id=$1',[ids[0]])).rows[0].next_move==='Existing editing still works','regular team editing remains available');
await as(admin);
check(await denied('insert into work_item_deletion_admins(user_id) values($1)',[admin]),'ordinary admin cannot grant deletion to self');
await db.query('delete from momentum_items where id=$1',[ids[0]]);
check((await db.query('select id from momentum_items where id=$1',[ids[0]])).rows.length===1,'old admin DELETE policy cannot physically remove item');
await as(superadmin);
check((await db.query('select can_delete_work_items() allowed')).rows[0].allowed,'granted active admin can delete');
await db.query('select delete_work_item($1)',[ids[0]]);
check((await db.query('select id from momentum_items where id=$1',[ids[0]])).rows.length===0,'deleted item disappears for deleting admin');
check((await db.query('select id from momentum_documents where momentum_item_id=$1',[ids[0]])).rows.length===1,'linked document remains available');
check(await denied('select delete_work_item($1)',[ids[0]]),'duplicate delete fails clearly');
await as(team);
check((await db.query('select id from momentum_items')).rows.length===0,'team cannot see deleted item');
check((await db.query('select id from momentum_documents')).rows.length===1,'team retains repository document access');
await db.query('update momentum_items set deleted_at=null where id=$1',[ids[0]]);
await as(null,'anon');
check(await denied('select delete_work_item($1)',[ids[0]]),'anonymous deletion denied');
await db.exec('reset role');
const row=(await db.query('select deleted_at,deleted_by from momentum_items where id=$1',[ids[0]])).rows[0];
check(row.deleted_at && row.deleted_by===superadmin,'retained record attributes deletion and cannot be restored by team');
check((await db.query('select count(*)::int n from momentum_activity')).rows[0].n>=before,'activity history is retained');
await db.exec("create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[])");
const release = read('../docs/work-item-deletion-supabase-release.sql');
const source = read('../supabase/migrations/20261021180000_work_item_deletion.sql');
assert.ok(release.includes(source.replace(/commit;\s*$/, '').trim()));
await db.exec(release);
check((await db.query('select count(*)::int n from work_item_deletion_admins a join profiles p on p.id=a.user_id where p.is_active')).rows[0].n===2,'manual release enables both existing active Admin accounts');
check((await db.query("select count(*)::int n from supabase_migrations.schema_migrations where version='20261021180000'")).rows[0].n===1,'manual release records migration');
check((await db.query('select deleted_at from momentum_items where id=$1',[ids[0]])).rows[0].deleted_at,'installing release does not remove existing data');
await db.close();
console.log(`${count} Work deletion checks passed`);
