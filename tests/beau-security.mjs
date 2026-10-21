import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
try {
await db.exec(read('./fixtures/chapters-base.sql'));
await db.exec('create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[])');
await db.exec(read('../supabase/migrations/20261021100000_chapters_foundation.sql'));
await db.exec(read('../supabase/migrations/20261021110000_chapters_security_and_registration.sql'));
await db.exec(read('../supabase/migrations/20261021190000_beau_foundation.sql'));
const ids=Array.from({length:5},(_,i)=>`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`);
const [admin,alice,bob,head,otherHead]=ids;
await db.exec('alter table profiles disable trigger protect_profile_access_fields');
for(const [i,id] of ids.entries()) {
 await db.query('insert into team_people(id,full_name) values($1,$2)',[id,'Fixture '+i]);
 await db.query('insert into profiles(id,member_id,profile_name,role,is_active) values($1,$1,$2,$3,true)',[id,'fixture'+i,i===0?'admin':'explorer']);
}
await db.exec('alter table profiles enable trigger protect_profile_access_fields');
const chapter=(await db.query("update chapters set head_member_id=$1,status='active' where city='Vienna' returning id",[head])).rows[0].id;
await db.query('insert into chapter_members(chapter_id,member_id) values($1,$2)',[chapter,alice]);
await db.query("insert into beau_knowledge(slug,title,category,content,status,visibility,faq_questions) values('approved','Approved fact','Fixture','A reliable fixture answer.','approved','internal',array['What is the fixture?']),('draft','Draft plan','Fixture','Unconfirmed secret plan.','working_draft','internal','{}'),('restricted','Restricted approved','Fixture','Private strategic fixture.','approved','restricted','{}')");
await db.query("insert into beau_knowledge(slug,title,category,content,status,visibility,chapter_id) values('chapter','Chapter fact','Fixture','Chapter private fixture.','approved','internal',$1)",[chapter]);
const convo=(await db.query("insert into beau_conversations(user_id,title) values($1,'Alice private chat') returning id",[alice])).rows[0].id;
await db.query("insert into beau_messages(conversation_id,role,content) values($1,'user','private transcript text')",[convo]);
let n=0;const check=(v,label)=>{assert.ok(v,label);n++;console.log('PASS',label)};
async function as(id,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role '+role)}
async function denied(sql,args=[]){try{await db.query(sql,args);return false}catch{return true}}
await as(alice);
check((await db.query('select * from beau_conversations')).rows.length===1,'owner reads own conversation');
check((await db.query('select * from beau_messages')).rows.length===1,'owner reads own messages');
check(await denied("insert into beau_messages(conversation_id,role,content) values($1,'assistant','forged')",[convo]),'browser cannot forge assistant messages');
check(await denied('select beau_retrieve($1,$2)',[alice,'fixture']),'browser cannot invoke service retrieval for another identity');
check(await denied("update beau_settings set daily_user_budget=100"),'member cannot alter spending limits');
check(await denied('select * from beau_knowledge'),'raw knowledge is not exposed directly to client roles');
for(const person of [admin,bob,head]){await as(person);check((await db.query('select * from beau_messages')).rows.length===0,'another identity including Admin cannot read private chat '+person)}
await as(null,'service_role');
const retrieve=async(actor,q)=>(await db.query('select beau_retrieve($1,$2) data',[actor,q])).rows[0].data;
check((await retrieve(alice,'fixture')).every(k=>k.slug!=='draft'&&k.slug!=='restricted'),'draft and restricted entries excluded from member retrieval');
check((await retrieve(admin,'fixture')).some(k=>k.slug==='restricted'),'Admin may retrieve approved restricted knowledge');
check((await retrieve(admin,'fixture')).every(k=>k.slug!=='draft'),'even Admin chat excludes working drafts');
check((await retrieve(alice,'chapter')).some(k=>k.slug==='chapter'),'chapter member reads own approved chapter knowledge');
check(!(await retrieve(bob,'chapter')).some(k=>k.slug==='chapter'),'unrelated member cannot read chapter knowledge');
check((await retrieve(head,'chapter')).some(k=>k.slug==='chapter'),'assigned Head can read chapter knowledge');
check(!(await retrieve(otherHead,'chapter')).some(k=>k.slug==='chapter'),'other Head cannot read unrelated chapter knowledge');
check((await retrieve(alice,'What is the fixture?')).some(k=>k.exact_faq),'approved exact FAQ metadata is recognized');
const rev=(await db.query('select revision from beau_revision')).rows[0].revision;
await db.query('select beau_cache_store($1,$2,$3,$4)',[alice,'fixture-key',{answer:'safe approved fact'},rev]);
check((await db.query('select beau_cache_lookup($1,$2) answer',[alice,'fixture-key'])).rows[0].answer.answer==='safe approved fact','own factual cache works');
check((await db.query('select beau_cache_lookup($1,$2) answer',[bob,'fixture-key'])).rows[0].answer===null,'factual cache is isolated between members');
await db.query("update beau_knowledge set content='Changed reliable fixture.' where slug='approved'");
check((await db.query('select beau_cache_lookup($1,$2) answer',[alice,'fixture-key'])).rows[0].answer===null,'knowledge changes invalidate prior factual cache');
check((await db.query("select count(*)::int n from beau_knowledge_versions v join beau_knowledge k on k.id=v.knowledge_id where k.slug='approved'")).rows[0].n===2,'knowledge edits preserve previous versions');
const turn='10000000-0000-4000-8000-000000000001';
check(await denied('select beau_begin_turn($1,$2,$3,$4)',[bob,convo,turn,'break privacy']),'backend turn RPC independently enforces ownership');
const started=(await db.query('select beau_begin_turn($1,$2,$3,$4) result',[alice,convo,turn,'What is the fixture?'])).rows[0].result;
check(!!started.assistant_id,'valid owner can start a turn');
check(await denied('select beau_begin_turn($1,$2,$3,$4)',[alice,convo,'10000000-0000-4000-8000-000000000002','concurrent']),'concurrent conversation generations are blocked');
await db.query('select beau_reserve($1,$2,1,null,0,true)',[alice,turn]);
await db.query('select beau_finish($1,$2,$3,$4,$5,0,0,0,0)',[alice,turn,'Approved fixture answer.','complete',{level:1}]);
check((await db.query('select content from beau_messages where id=$1',[started.assistant_id])).rows[0].content==='Approved fixture answer.','completed answer persists privately');
check(await denied('select beau_reserve($1,$2,3,$3,1000,false)',[alice,'10000000-0000-4000-8000-000000000003','fixture-model']),'reservation blocks requests exceeding the daily budget');
check(await denied('select beau_usage_report($1)',[alice]),'members cannot view administrator usage analytics');
const analytics=(await db.query('select beau_usage_report($1) report',[admin])).rows[0].report;
check(!JSON.stringify(analytics).includes('private transcript'),'analytics contain no conversation text');
const memory=(await db.query('select beau_private_memory($1,$2,$3) data',[alice,'private transcript', '99999999-0000-4000-8000-000000000001'])).rows[0].data;
check(memory.some(m=>m.content.includes('private transcript')),'owner can retrieve relevant private memory');
check((await db.query('select beau_private_memory($1,$2,$3) data',[admin,'private transcript','99999999-0000-4000-8000-000000000001'])).rows[0].data.length===0,'Admin cannot retrieve another member private memory');
check((await db.query('select * from beau_history_search($1,$2)',[bob,'private transcript'])).rows.length===0,'history search cannot expose another member transcript');
check((await db.query('select * from beau_history_search($1,$2)',[alice,'private transcript'])).rows.length===1,'history searches message contents for their owner');
check(await denied('select beau_begin_turn($1,$2,$3,$4)',[alice,convo,turn,'replay']),'completed request identifiers cannot be replayed');
for(const [label,sql,args] of [
 ['chapter edits',"update chapters set headline='Revised fixture' where id=$1",[chapter]],
 ['member identity edits',"update team_people set full_name='Updated fixture' where id=$1",[head]],
 ['membership removal','delete from chapter_members where chapter_id=$1 and member_id=$2',[chapter,alice]],
]) {
 const epoch=(await db.query('select revision from beau_revision')).rows[0].revision;
 await db.query('select beau_cache_store($1,$2,$3,$4)',[alice,'invalidation',{answer:'fixture'},epoch]);
 await db.exec('reset role');await db.query(sql,args);await as(null,'service_role');
 check((await db.query('select beau_cache_lookup($1,$2) data',[alice,'invalidation'])).rows[0].data===null,label+' invalidate factual cache');
 await db.query('select beau_cache_store($1,$2,$3,$4)',[alice,'stale',{answer:'stale'},epoch]);
 check((await db.query('select beau_cache_lookup($1,$2) data',[alice,'stale'])).rows[0].data===null,'stale response cannot repopulate cache after '+label);
}
check(!(await retrieve(alice,'chapter')).some(k=>k.slug==='chapter'),'membership revocation immediately removes chapter retrieval');
await db.query("insert into beau_files(user_id,conversation_id,file_name,storage_path,content_hash,file_size,extracted_text) values($1,$2,'fixture.txt','fixture/private.txt','fixturehash',3,'abc')",[alice,convo]);
await db.query('delete from beau_conversations where id=$1',[convo]);
check((await db.query('select count(*)::int n from beau_messages where conversation_id=$1',[convo])).rows[0].n===0,'conversation deletion removes private messages');
check((await db.query("select count(*)::int n from beau_file_cleanup where storage_path='fixture/private.txt'")).rows[0].n===1,'conversation deletion durably queues private storage cleanup');
await as(null,'anon');check(await denied('select * from beau_conversations'),'anonymous conversation access denied');
check(await denied('select beau_cache_lookup($1,$2)',[alice,'fixture-key']),'anonymous cache retrieval denied');
console.log(`${n} BEAU database security checks passed`);
} catch(error) { console.error(error.message);process.exitCode=1; } finally {await db.close()}
