import {readFileSync,writeFileSync} from 'node:fs';
const files=['20261021100000_chapters_foundation.sql','20261021110000_chapters_security_and_registration.sql'];
let sql='-- IOBS Chapters: reviewed release migration. Run ONCE in the IOBS SQL Editor.\n-- This file combines both chapter migrations into one atomic transaction.\nBEGIN;\n';
for(const name of files){const source=readFileSync(`supabase/migrations/${name}`,'utf8').trim().replace(/^begin;/i,'').replace(/commit;$/i,'');sql+=`\n-- Source: ${name}\n${source}\n`;}
sql+='\nCOMMIT;\n';
if(process.argv.includes('--check')){if(readFileSync('docs/chapters-supabase-release.sql','utf8')!==sql)throw new Error('Release SQL is out of date. Run node scripts/package-chapters-migration.mjs.');}
else writeFileSync('docs/chapters-supabase-release.sql',sql);
