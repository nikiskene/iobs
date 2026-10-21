import {zipSync,strToU8} from 'fflate';
import {test,expect} from '@playwright/test';
const uid='00000000-0000-4000-8000-000000000001';
async function mock(page,{admin=false,signedIn=true,head=false,approved=true}={}){
 if(signedIn)await page.addInitScript(({uid})=>localStorage.setItem('sb-bunfdlazirfheomhvjdz-auth-token',JSON.stringify({access_token:'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEifQ.fixture',refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:uid,email:'fixture@example.com',aud:'authenticated',role:'authenticated'}})),{uid});
 let conversations=[],messages=[],files=[],knowledge=[{id:uid,slug:'fixture',title:'Fixture identity',category:'Fixture',content:'Approved factual fixture.',status:'approved',visibility:'internal',chapter_id:null,source_note:'Fixture source',faq_questions:['What is IOBS?'],faq_answer:'',version:1}];const calls=[];let memberApproval=false;
 const settings={enabled:true,mini_model:'gpt-5.4-mini',intelligence_model:'gpt-5.4',mini_input_price:.75,mini_cached_price:.075,mini_output_price:4.5,intelligence_input_price:2.5,intelligence_cached_price:.25,intelligence_output_price:15,max_output_tokens:2048,daily_user_limit:100,daily_user_budget:2,daily_global_budget:20,system_instructions:'Be clear.'};
 await page.route('**/*.supabase.co/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;let data=[];
  if(path.includes('/functions/v1/beau')){
   if(req.headers()['content-type']?.includes('multipart/form-data')){calls.push({action:'multipart',body:req.postData()});data={id:crypto.randomUUID(),file_name:'fixture.txt'};files.push(data)}
   else{const b=req.postDataJSON();calls.push(b);
   switch(b.action){
    case 'bootstrap':data={is_admin:admin,can_manage_knowledge:admin||head,enabled:true,chapters:admin||head?[{id:uid,name:'Vienna'}]:[]};break;
    case 'conversations':data=conversations.filter(c=>!b.search||c.title.includes(b.search));break;
    case 'create_conversation':data={id:crypto.randomUUID(),title:'New conversation',updated_at:new Date().toISOString()};conversations.unshift(data);break;
    case 'messages':data=messages.filter(m=>m.conversation_id===b.conversation_id).slice().reverse();break;
    case 'files':data=files;break;
    case 'rename_conversation':conversations=conversations.map(c=>c.id===b.conversation_id?{...c,title:b.title}:c);data={};break;
    case 'delete_conversation':conversations=conversations.filter(c=>c.id!==b.conversation_id);data={deleted:true};break;
    case 'chat':{
     let a;if(b.regenerate_id){a=messages.find(m=>m.id===b.regenerate_id)}else{messages.push({id:crypto.randomUUID(),seq:messages.length+1,conversation_id:b.conversation_id,role:'user',content:b.prompt,status:'complete',attachment_ids:b.file_ids,metadata:{}});a={id:crypto.randomUUID(),seq:messages.length+1,conversation_id:b.conversation_id,role:'assistant',content:'',status:'complete',attachment_ids:[],metadata:{level:1,sources:[]}};messages.push(a)}
     a.content='A **reliable fixture** response.\n\n<img src="https://tracker.invalid/x" onerror="alert(1)">\n\n[unsafe](javascript:alert(1))';
     await route.fulfill({status:200,contentType:'text/event-stream',body:`event: meta\ndata: ${JSON.stringify({message_id:a.id,level:1,sources:[]})}\n\nevent: delta\ndata: ${JSON.stringify({text:a.content})}\n\nevent: done\ndata: {}\n\n`});return;
    }
    case 'knowledge_list':data=knowledge;break;
    case 'knowledge_save':knowledge=knowledge.map(k=>k.id===b.id?{...b,version:b.version+1}:k);data={id:uid};break;
    case 'knowledge_versions':data=[];break;
    case 'settings':data=settings;break;
    case 'settings_save':Object.assign(settings,b);data=settings;break;
    case 'usage':data={active_users:2,days:[{day:'2026-10-21',level:2,model:'fixture-mini',requests:2,api_requests:2,cache_hits:0,input_tokens:100,output_tokens:20,cached_tokens:0,estimated_cost:.001,pending_requests:0}]};break;
   }}
  }else if(path.includes('/auth/v1/user'))data={id:uid,email:'fixture@example.com'};
  else if(path.includes('/profiles')){const p={id:uid,member_id:uid,full_name:'Fixture Member',profile_name:'fixture',role:admin?'admin':'explorer',is_team_member:false,is_active:true};data=new URL(req.url()).searchParams.has('id')?p:[p]}
  else if(path.includes('/nomination_settings'))data={id:true,mode:'acknowledgement'};
  else if(path.includes('/rpc/admin_list_members'))data=[{id:uid,full_name:'Fixture Member',category:'user',status:'draft',title:'',description:'',photo_url:'',linkedin_url:'',substack_url:'',sort_order:0,location:'',directory_public:false,primary_profile_id:uid,updated_at:'2026-10-21',accounts:[{id:uid,email:'fixture@example.com',profile_name:'fixture',role:'explorer',is_team_member:false,is_active:true}]}];
  else if(path.includes('/rpc/admin_get_beau_access'))data=memberApproval;
  else if(path.includes('/rpc/admin_set_beau_access')){const b=req.postDataJSON();calls.push({action:'set_access',...b});memberApproval=b.p_enabled;data=memberApproval;}
  else if(path.includes('/rpc/has_beau_access'))data=approved;
  else if(path.includes('/rpc/my_managed_chapters'))data=head?[{id:uid,name:'Vienna'}]:[];
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });return calls;
}
for(const width of [320,390,768,1440])test(`chat, regeneration, private history and attachments at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});const calls=await mock(page);await page.goto('/beau');await expect(page.getByRole('heading',{name:'Hello, I’m BEAU.'})).toBeVisible();
 await page.getByLabel('Message BEAU',{exact:true}).fill('What is IOBS?');await page.getByRole('button',{name:'Send',exact:true}).click();await expect(page.locator('.beau-message-assistant strong')).toHaveText('reliable fixture');
 await expect(page.locator('.beau-answer-level')).toContainText('No AI request');await expect(page.locator('.beau-markdown img')).toHaveCount(0);await expect(page.locator('.beau-markdown a[href^="javascript:"]')).toHaveCount(0);
 await page.getByRole('button',{name:'Regenerate',exact:true}).click();await expect.poll(()=>calls.filter(c=>c.action==='chat').length).toBe(2);
 await expect(page.getByRole('button',{name:'Send',exact:true})).toBeVisible();
 await page.getByLabel('Attach document',{exact:true}).setInputFiles({name:'fixture.txt',mimeType:'text/plain',buffer:Buffer.from('Untrusted private fixture text.')});await expect(page.locator('.beau-attachments').last()).toContainText('fixture.txt');
 if(width<768)await page.getByRole('button',{name:'Conversations',exact:true}).click();
 page.once('dialog',d=>d.accept('Renamed private fixture'));await page.getByRole('button',{name:'Rename New conversation',exact:true}).click();await expect(page.getByRole('button',{name:'Renamed private fixture',exact:true})).toBeVisible();
 await page.getByLabel('Search private history').fill('Renamed');await page.getByRole('button',{name:'Search',exact:true}).click();await expect.poll(()=>calls.some(c=>c.action==='conversations'&&c.search==='Renamed')).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`/tmp/iobs-beau-chat-${width}.png`,fullPage:true});
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Delete Renamed private fixture',exact:true}).click();await expect(page.getByRole('button',{name:'Renamed private fixture',exact:true})).toHaveCount(0);
});
test('Admin can review knowledge, usage and model settings on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:900});const calls=await mock(page,{admin:true});await page.goto('/admin/beau');await page.getByRole('button',{name:'Edit',exact:true}).first().click();await page.getByLabel('Title',{exact:true}).fill('Reviewed fixture identity');await page.getByRole('button',{name:'Save knowledge',exact:true}).click();await expect.poll(()=>calls.some(c=>c.action==='knowledge_save')).toBe(true);
 await page.getByRole('button',{name:'Usage & costs',exact:true}).click();await expect(page.getByText('fixture-mini',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByLabel('BEAU Mini model',{exact:true}).fill('configured-mini');await page.getByRole('button',{name:'Save BEAU settings',exact:true}).click();await expect.poll(()=>calls.some(c=>c.action==='settings_save'&&c.mini_model==='configured-mini')).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Chapter Head has knowledge controls without global settings',async({page})=>{await mock(page,{head:true});await page.goto('/beau/knowledge');await expect(page.getByRole('heading',{name:'BEAU knowledge',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Settings',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Usage & costs',exact:true})).toHaveCount(0)});
test('BEAU is hidden from anonymous navigation and protected by login',async({page})=>{await mock(page,{signedIn:false});await page.goto('/chapters');await expect(page.getByRole('link',{name:'BEAU',exact:true})).toHaveCount(0);await page.goto('/beau');await expect(page).toHaveURL(/\/login/) });

test('DOCX extraction imports text without executing embedded markup',async({page})=>{
 const calls=await mock(page);await page.goto('/beau');await expect(page.getByLabel('Message BEAU',{exact:true})).toBeEnabled();
 const file=zipSync({'word/document.xml':strToU8('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>DOCX extraction fixture</w:t></w:r></w:p></w:body></w:document>')});
 await page.getByLabel('Attach document',{exact:true}).setInputFiles({name:'fixture.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:Buffer.from(file)});
 await expect.poll(()=>calls.some(c=>c.action==='multipart'&&c.body.includes('DOCX extraction fixture'))).toBe(true);
});
test('unsafe DOCX XML is rejected before any upload',async({page})=>{
 const calls=await mock(page);await page.goto('/beau');await expect(page.getByLabel('Message BEAU',{exact:true})).toBeEnabled();
 const file=zipSync({'word/document.xml':strToU8('<!DOCTYPE document [<!ENTITY test SYSTEM "https://untrusted.invalid/">]><document>&test;</document>')});
 await page.getByLabel('Attach document',{exact:true}).setInputFiles({name:'unsafe.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:Buffer.from(file)});
 await expect(page.getByRole('alert')).toContainText('unsupported XML');expect(calls.filter(c=>c.action==='multipart')).toHaveLength(0);
});
test('text PDF extraction uses the bundled worker',async({page})=>{
 const calls=await mock(page);await page.goto('/beau');await expect(page.getByLabel('Message BEAU',{exact:true})).toBeEnabled();
 const stream='BT /F1 18 Tf 72 720 Td (PDF extraction fixture) Tj ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
 let pdf='%PDF-1.4\n';const offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`}const start=Buffer.byteLength(pdf);pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
 await page.getByLabel('Attach document',{exact:true}).setInputFiles({name:'fixture.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf)});await expect.poll(()=>calls.some(c=>c.action==='multipart'&&c.body.includes('PDF extraction fixture'))).toBe(true);
});

test('unapproved member cannot open BEAU and has no navigation link',async({page})=>{const calls=await mock(page,{approved:false});await page.goto('/beau');await expect(page.getByText('An Admin needs to approve your BEAU access before you can use it. Please contact an Admin.')).toBeVisible();await expect(page.getByRole('link',{name:'BEAU',exact:true})).toHaveCount(0);await expect(page.getByLabel('Message BEAU',{exact:true})).toHaveCount(0);expect(calls.filter(c=>c.action==='bootstrap')).toHaveLength(0)});

for(const width of [320,1440])test(`Admin approves and revokes BEAU in member setup at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});const calls=await mock(page,{admin:true});await page.goto('/admin/members/team');await page.getByRole('button',{name:'Edit',exact:true}).click();const permission=page.getByRole('switch',{name:'Allow this member to use BEAU',exact:true});await expect(permission).toBeEnabled();await expect(permission).not.toBeChecked();await permission.click();await expect(permission).toBeChecked();expect(calls.filter(c=>c.action==='set_access')).toEqual([{action:'set_access',p_member_id:uid,p_enabled:true}]);await permission.click();await expect(permission).not.toBeChecked();expect(calls.filter(c=>c.action==='set_access')).toHaveLength(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`/tmp/iobs-beau-member-approval-${width}.png`,fullPage:true});
});
