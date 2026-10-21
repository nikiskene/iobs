import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import ts from 'typescript';
import vm from 'node:vm';
const catalog=JSON.parse(fs.readFileSync('src/content/arabicCmsCatalog.json'));
const publicCopy=JSON.parse(fs.readFileSync('src/content/arabicPublicCopy.json'));
assert.equal(catalog.length,231);assert.equal(new Set(catalog.map(r=>r.key)).size,231);
for(const row of catalog){assert.match(row.translation,/[\u0600-\u06ff]/);assert.notEqual(row.source,row.translation);}
// Exercise the real exact-match implementation and recursively translated views.
let source=fs.readFileSync('src/content/localizedCms.ts','utf8').replace(/^import .*;\n/gm,'');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};vm.runInNewContext(compiled,{exports,catalog,publicCopy,Map,Set,Object});
const {translateArabicCms:tr,localizeCmsRecord:localize}=exports;
assert.equal(tr('Amsterdam'),'أمستردام');assert.equal(tr('  Amsterdam\r\n'),'أمستردام');assert.equal(tr('New Amsterdam event'),'New Amsterdam event');
const original={id:'Amsterdam',slug:'Amsterdam',category:'Amsterdam',name:'Amsterdam',full_name:'Amsterdam',email:'head@example.com',ticket_price_cents:500,description:'Hoi!',photo_url:'Amsterdam',nested:[{headline:'Hoi!'}]};
const localized=localize(original,tr);
assert.equal(localized.name,'أمستردام');assert.equal(localized.description,'مرحباً!');assert.equal(localized.nested[0].headline,'مرحباً!');assert.equal(original.name,'Amsterdam');
for(const key of ['id','slug','category','full_name','email','ticket_price_cents','photo_url'])assert.equal(localized[key],original[key]);
const db=new PGlite();
await db.exec(`CREATE TABLE award_site_content(content_key text,locale text NOT NULL DEFAULT 'en' CHECK(locale IN ('en','de','fr','ar','zh','es')),section text,label text,headline text,subheadline text,body text,media_url text,media_path text,display_order int,is_active bool,UNIQUE(content_key,locale)); INSERT INTO award_site_content(content_key,locale,headline,media_url) VALUES('v3_hero','en','English untouched','https://example.com/image.webp'),('v3_hero__ar','ar','تحرير محفوظ',NULL);`);
const sql=fs.readFileSync('docs/releases/2026-10-21-arabic-cms.sql','utf8');
await db.exec(sql);await db.exec(sql);
const {rows:[counts]}=await db.query("select count(*)::int as total,count(*) filter(where locale='ar')::int as arabic from award_site_content");
assert.equal(counts.arabic,256);assert.equal(counts.total,257);
const {rows}=await db.query("select headline,media_url from award_site_content where content_key in ('v3_hero','v3_hero__ar')");
assert(rows.some(r=>r.headline==='تحرير محفوظ'));assert(rows.some(r=>r.headline==='English untouched'&&r.media_url==='https://example.com/image.webp'));await db.close();
console.log('Arabic checks passed: 231 complete translations; exact matching, record identity and source immutability; SQL idempotency, 256 entries and editorial preservation.');
