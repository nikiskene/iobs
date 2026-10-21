import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');let n=0;const check=(v,l)=>{assert.ok(v,l);n++;console.log('PASS',l)};
const [admin,alice,bob]=[1,2,3].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
async function as(id,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role '+role)}
async function denied(q,args=[]){try{await db.query(q,args);return false}catch{return true}}
try{
 await db.exec(read('fixtures/chapters-base.sql'));await db.exec('create schema supabase_migrations;create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[]);create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[])');
 for(const migration of ['20261021100000_chapters_foundation','20261021110000_chapters_security_and_registration','20261021190000_beau_foundation','20261021200000_beau_member_approval'])await db.exec(read(migration==='20261021200000_beau_member_approval'?'../docs/beau-access-supabase-release.sql':'../supabase/migrations/'+migration+'.sql'));
 await db.exec('alter table profiles disable trigger protect_profile_access_fields');
 for(const [i,id] of [admin,alice,bob].entries()){await db.query('insert into team_people(id,full_name) values($1,$2)',[id,'Fixture '+i]);await db.query('insert into profiles(id,member_id,profile_name,role,is_active) values($1,$1,$2,$3,true)',[id,'fixture'+i,i===0?'admin':'explorer'])}
 await db.exec('alter table profiles enable trigger protect_profile_access_fields');
 await as(admin);check((await db.query('select has_beau_access() allowed')).rows[0].allowed===false,'Admin chat also starts OFF until explicitly approved');
 check((await db.query('select admin_get_beau_access($1) allowed',[alice])).rows[0].allowed===false,'new member starts OFF');
 await db.query('select admin_set_beau_access($1,true)',[alice]);check((await db.query('select admin_get_beau_access($1) allowed',[alice])).rows[0].allowed===true,'Admin can approve a member while own chat remains OFF');
 await as(alice);check((await db.query('select has_beau_access() allowed')).rows[0].allowed===true,'approved member can use BEAU');
 check(await denied('select admin_set_beau_access($1,true)',[bob]),'approved member cannot grant another member access');check(await denied('select admin_set_beau_access($1,true)',[alice]),'member cannot approve themselves');check(await denied('select admin_get_beau_access($1)',[bob]),'member cannot inspect another approval');
 check(await denied('insert into beau_member_access(member_id,enabled) values($1,true)',[bob]),'browser cannot insert approval rows');check(await denied('update beau_member_access set enabled=false'),'browser cannot edit approval rows');
 await as(bob);check((await db.query('select has_beau_access() allowed')).rows[0].allowed===false,'approving one member leaves other members OFF');
 await as(null,'service_role');const convo=(await db.query('insert into beau_conversations(user_id,title) values($1,$2) returning id',[alice,'Private fixture'])).rows[0].id;
 await db.query("insert into beau_messages(conversation_id,role,content) values($1,'user','private fixture')",[convo]);const epoch=(await db.query('select revision from beau_revision')).rows[0].revision;await db.query('select beau_cache_store($1,$2,$3,$4)',[alice,'fixture',{answer:'approved fact'},epoch]);
 await as(alice);check((await db.query('select * from beau_messages')).rows.length===1,'approved member can read own history');
 await as(admin);await db.query('select admin_set_beau_access($1,false)',[alice]);await as(alice);check((await db.query('select has_beau_access() allowed')).rows[0].allowed===false,'revocation immediately disables access');check((await db.query('select * from beau_messages')).rows.length===0,'revocation blocks direct private-history reads');
 await as(null,'service_role');check((await db.query('select beau_cache_lookup($1,$2) data',[alice,'fixture'])).rows[0].data===null,'revocation invalidates cached answers');check(await denied('select beau_begin_turn($1,$2,$3,$4)',[alice,convo,crypto.randomUUID(),'Try after revocation']),'revocation blocks server-side turn creation');check(await denied('select beau_reserve($1,$2,1,null,0,false)',[alice,crypto.randomUUID()]),'revocation blocks even free Knowledge Engine reservations');
 await as(admin);await db.query('select admin_set_beau_access($1,true)',[alice]);await as(alice);check((await db.query('select * from beau_messages')).rows.length===1,'reapproval preserves private history');
 await as(null,'anon');check(await denied('select has_beau_access()'),'anonymous users cannot probe approval');check(await denied('select admin_set_beau_access($1,true)',[bob]),'anonymous users cannot approve members');
 await db.exec('reset role');check((await db.query("select count(*)::int n from beau_audit where action in ('access.approve','access.revoke')")).rows[0].n===3,'approval and revocation are audited');
 console.log(n+' BEAU approval security checks passed');
}catch(e){console.error(e.message);process.exitCode=1}finally{await db.close()}
