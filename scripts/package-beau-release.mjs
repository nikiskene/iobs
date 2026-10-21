// Keep institutional source material outside this PUBLIC repository.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const [seedPath,outputPath]=process.argv.slice(2);
if(!seedPath||!outputPath)throw new Error('Supply the private seed path and a destination outside the repository.');
const root=realpathSync(new URL('..',import.meta.url));
const output=resolve(realpathSync(dirname(resolve(outputPath))),resolve(outputPath).split('/').pop());
if(!relative(root,output).startsWith('..'))throw new Error('Private SQL must be written outside the public repository.');
const seed=readFileSync(seedPath,'utf8');
if(!seed.includes('insert into public.beau_knowledge'))throw new Error('Expected institutional seed SQL.');
// Existing reviewed entries must survive a repeated import unchanged.
const insertOnly=seed.replace(/on conflict \(slug\) do update set[^;]+;/,'on conflict (slug) do nothing;');
const digest=createHash('sha256').update(seed).digest('hex');
const migration=readFileSync(new URL('../supabase/migrations/20261021190000_beau_foundation.sql',import.meta.url),'utf8').replace(/^begin;$/m,'').replace(/^commit;$/m,'');
const history=`insert into supabase_migrations.schema_migrations(version,name,statements) values('20261021190000','beau_foundation',array['Manually installed BEAU foundation']) on conflict(version) do nothing;`;
writeFileSync(output,`-- PRIVATE institutional release: do not commit or publish.\nbegin;\n${migration}\n${insertOnly}\nupdate public.beau_knowledge set faq_questions=array['What is IOBS?','What does IOBS stand for?','What is the Institute of Beautiful Success?'] where slug='identity' and status='approved' and cardinality(faq_questions)=0;\ninsert into public.beau_seed_imports(digest) values('${digest}') on conflict do nothing;\n${history}\ncommit;\n`,{mode:0o600});
console.log('Private BEAU release prepared outside the repository.');
