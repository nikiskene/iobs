import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync('supabase/migrations/20261021140000_member_email_accounts.sql','utf8').trim();
const history="-- Record this manual application so Supabase's GitHub integration does not replay it.\ninsert into supabase_migrations.schema_migrations(version,name,statements) values('20261021140000','member_email_accounts',array[]::text[]) on conflict(version) do nothing;\ncommit;";
const bundle='-- IOBS member email accounts. Run ONCE in the IOBS SQL Editor after review.\n-- No mailbox is created, linked, deleted, or modified by this SQL.\n'+source.replace(/commit;$/i,history)+'\n';
if(process.argv.includes('--check')){if(readFileSync('docs/email-supabase-release.sql','utf8')!==bundle)throw new Error('Email release SQL differs from the migration. Regenerate it.');}
else writeFileSync('docs/email-supabase-release.sql',bundle);
