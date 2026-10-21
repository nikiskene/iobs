// Optional private release validation: paths are supplied locally, never committed content.
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const [seedPath,bundlePath]=process.argv.slice(2);if(!seedPath||!bundlePath)throw new Error('Supply private seed and release paths.');
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const seed=readFileSync(seedPath,'utf8').replace(/create extension if not exists pgcrypto;/i,'');
const bundle=readFileSync(bundlePath,'utf8').replace(/create extension if not exists pgcrypto;/i,'');
for(const existing of [false,true]){
 const db=new PGlite();try{
 await db.exec(read('fixtures/chapters-base.sql'));
 await db.exec('create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create schema supabase_migrations;create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[])');
 await db.exec(read('../supabase/migrations/20261021100000_chapters_foundation.sql'));await db.exec(read('../supabase/migrations/20261021110000_chapters_security_and_registration.sql'));
 if(existing)await db.exec(seed);
 const before=existing?(await db.query('select slug,content,status,visibility,source_note from beau_knowledge order by slug')).rows:null;
 await db.exec(bundle);
 const after=(await db.query('select slug,content,status,visibility,source_note from beau_knowledge order by slug')).rows;
 assert.equal(after.length,12);assert.equal(after.filter(r=>r.status==='approved').length,1);assert.equal(after.filter(r=>r.visibility==='restricted').length,2);
 if(before)assert.deepEqual(after,before);
 assert.equal((await db.query('select count(*)::int n from beau_knowledge_versions')).rows[0].n>=12,true);
 console.log(`PASS private release ${existing?'over existing seed':'on empty BEAU schema'}: all 12 sources and approval states preserved`);
 }catch(e){console.error(e.message);process.exitCode=1}finally{await db.close()}
}
