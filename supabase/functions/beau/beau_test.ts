import { chooseLevel, exactAnswer, estimateCost, sseData, type Knowledge } from './domain.ts';
import { generate } from './provider.ts';
import { canEdit, knowledgePayload } from './store.ts';
import { createHandler } from './handler.ts';
const assert=(v:unknown)=>{if(!v)throw new Error('Assertion failed')};
const equal=(a:unknown,b:unknown)=>assert(JSON.stringify(a)===JSON.stringify(b));
const knowledge={id:'fixture',title:'Fixture',content:'Approved fixture.',source_note:'Test source',version:1,exact_faq:false} as Knowledge;
Deno.test('FTS relevance cannot manufacture a direct factual answer',()=>{equal(exactAnswer([knowledge],false),null);equal(exactAnswer([{...knowledge,exact_faq:true}],false)?.answer,knowledge.content);equal(exactAnswer([{...knowledge,exact_faq:true}],true),null);equal(exactAnswer([{...knowledge,exact_faq:true},{...knowledge,exact_faq:true}],false),null)});
Deno.test('routing respects explicit choice and complex multi-document requests',()=>{equal(chooseLevel('Hello','auto',0),2);equal(chooseLevel('A strategy','auto',0),3);equal(chooseLevel('Summarize','auto',2),3);equal(chooseLevel('A strategy','mini',3),2);equal(chooseLevel('Hello','intelligence',0),3)});
Deno.test('costs account for discounted cached input',()=>{equal(estimateCost(1000,200,100,{input:1,cached:.1,output:2}),.00102)});
Deno.test('SSE handles fragmented UTF8 and CRLF',async()=>{const bytes=new TextEncoder().encode('data: {"text":"héllo"}\r\n\r\ndata: [DONE]\r\n\r\n');const stream=new ReadableStream<Uint8Array>({start(c){for(const n of bytes)c.enqueue(new Uint8Array([n]));c.close()}});const events=[];for await(const e of sseData(stream))events.push(e);equal(events,[{text:'héllo'}])});
Deno.test('provider uses private server key, no persistence and actual usage',async()=>{
 const fetcher:typeof fetch=async(url,init)=>{equal(String(url),'https://api.openai.com/v1/responses');equal((init?.headers as Record<string,string>).Authorization,'Bearer private-fixture');const body=JSON.parse(String(init?.body));equal(body.store,false);equal(body.model,'gpt-5.4-mini');return new Response('data: {"type":"response.output_text.delta","delta":"Hello"}\n\ndata: {"type":"response.completed","response":{"usage":{"input_tokens":10,"output_tokens":2,"input_tokens_details":{"cached_tokens":3}}}}\n\n')};
 const deltas:string[]=[];const result=await generate({key:'private-fixture',model:'gpt-5.4-mini',instructions:'Fixture',input:[],maxOutput:256,intelligence:false,signal:new AbortController().signal,onDelta:t=>deltas.push(t),fetcher});equal(result,{text:'Hello',input:10,cached:3,output:2});equal(deltas,['Hello']);
});
Deno.test('upstream errors never expose credentials or private error body',async()=>{try{await generate({key:'private-fixture',model:'fixture',instructions:'',input:[],maxOutput:256,intelligence:false,signal:new AbortController().signal,onDelta:()=>{},fetcher:async()=>new Response('secret-error-body',{status:401})});throw new Error('Expected failure')}catch(e){assert(e instanceof Error&&!e.message.includes('secret-error-body')&&!e.message.includes('private-fixture'))}});
Deno.test('unauthenticated calls and unsupported origins fail before secret access',async()=>{const handler=createHandler({env:()=>{throw new Error('Must not read secrets')}});equal((await handler(new Request('https://example.com',{method:'POST'}))).status,401);equal((await handler(new Request('https://example.com',{method:'POST',headers:{Origin:'https://untrusted.example'}}))).status,403)});
Deno.test('spoofed browser role cannot bypass verified Auth identity',async()=>{const handler=createHandler({env:n=>n==='SUPABASE_URL'?'https://fixture.supabase.co':'fixture-service',fetcher:async()=>new Response('{"message":"invalid token"}',{status:401,headers:{'Content-Type':'application/json'}})});const response=await handler(new Request('https://example.com',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify({action:'settings',role:'admin'})}));equal(response.status,401)});

Deno.test('Head knowledge writes cannot cross chapters, become restricted or gain global scope',()=>{const actor={id:'fixture',member_id:'fixture',role:'explorer',is_active:true};const chapter={id:'00000000-0000-4000-8000-000000000001',name:'Fixture'};assert(canEdit(actor,[chapter],{chapter_id:chapter.id,visibility:'internal'}));assert(!canEdit(actor,[chapter],{chapter_id:null,visibility:'internal'}));assert(!canEdit(actor,[chapter],{chapter_id:chapter.id,visibility:'restricted'}));assert(!canEdit(actor,[chapter],{chapter_id:'00000000-0000-4000-8000-000000000002',visibility:'internal'}));const payload=knowledgePayload({slug:'fixture',title:'Fixture',category:'Fixture',content:'Reviewed content',status:'approved',visibility:'internal',chapter_id:chapter.id,faq_questions:['','  ','Question?'],faq_answer:'',source_note:'',role:'admin',updated_by:'spoofed'},actor,[chapter]);equal(payload.faq_questions,['Question?']);equal(payload.updated_by,'fixture');assert(!('role' in payload))});
Deno.test('real handler serves approved FAQ without reading OpenAI key and streams Mini privately',async()=>{
 for(const factual of [true,false]){
  const id='00000000-0000-4000-8000-000000000001';const requestId='10000000-0000-4000-8000-000000000001';let providerCalls=0,keyReads=0,finished=false,reserved=false;
  const fetcher:typeof fetch=async(url,init)=>{
   const path=new URL(String(url)).pathname;let data:unknown=[];
   if(String(url).startsWith('https://api.openai.com/')){
    providerCalls++;equal((init?.headers as Record<string,string>).Authorization,'Bearer beau-only-fixture');
    return new Response('data: {"type":"response.output_text.delta","delta":"Helpful fixture answer"}\n\ndata: {"type":"response.completed","response":{"usage":{"input_tokens":20,"output_tokens":4}}}\n\n');
   }
   if(path==='/auth/v1/user')data={id,email:'fixture@example.com'};
   else if(path==='/rest/v1/profiles')data={id,member_id:id,role:'explorer',is_active:true};
   else if(path==='/rest/v1/chapters')data=[];
   else if(path==='/rest/v1/rpc/beau_active_member')data=true;
   else if(path==='/rest/v1/beau_conversations')data={id,user_id:id};
   else if(path==='/rest/v1/beau_settings')data={enabled:true,mini_model:'gpt-5.4-mini',intelligence_model:'gpt-5.4',mini_input_price:.75,mini_cached_price:.075,mini_output_price:4.5,intelligence_input_price:2.5,intelligence_cached_price:.25,intelligence_output_price:15,max_output_tokens:256,system_instructions:'Be concise.'};
   else if(path==='/rest/v1/beau_revision')data={revision:1};
   else if(path==='/rest/v1/rpc/beau_begin_turn')data={user_message:{id,seq:1,role:'user',content:factual?'What is the fixture?':'Help me write an invitation.',attachment_ids:[]},assistant_id:id};
   else if(path==='/rest/v1/rpc/beau_cache_lookup')data=null;
   else if(path==='/rest/v1/rpc/beau_retrieve')data=factual?[{...knowledge,id,exact_faq:true}]:[];
   else if(path==='/rest/v1/rpc/beau_private_memory')data=[];
   else if(path==='/rest/v1/beau_messages')data=[{id,seq:1,role:'user',content:'Help me write an invitation.',status:'complete'}];
   else if(path==='/rest/v1/rpc/beau_reserve'){reserved=true;data=null;const b=JSON.parse(String(init?.body));equal(b.actor,id);equal(b.tier,factual?1:2)}
   else if(path==='/rest/v1/rpc/beau_finish'){finished=true;data=null;const b=JSON.parse(String(init?.body));equal(b.actor,id);equal(b.result_status,'complete');equal(b.cost===0,factual)}
   else if(path==='/rest/v1/rpc/beau_cache_store'){assert(factual);data=null}
   return Response.json(data);
  };
  const handler=createHandler({env:name=>{if(name==='SUPABASE_URL')return 'https://fixture.supabase.co';if(name==='SUPABASE_SERVICE_ROLE_KEY')return 'service-fixture';if(name==='OPENAI_API_KEY_BEAU'){keyReads++;return 'beau-only-fixture'}throw new Error('Unexpected secret access')},fetcher});
  const response=await handler(new Request('https://fixture.supabase.co/functions/v1/beau',{method:'POST',headers:{Authorization:'Bearer member-fixture','Content-Type':'application/json'},body:JSON.stringify({action:'chat',conversation_id:id,request_id:requestId,prompt:factual?'What is the fixture?':'Help me write an invitation.',mode:'auto'})}));
  equal(response.status,200);const stream=await response.text();assert(stream.includes('event: done'));assert(!stream.includes('beau-only-fixture'));equal(keyReads,factual?0:1);equal(providerCalls,factual?0:1);assert(reserved&&finished);
 }
});

Deno.test('unapproved members cannot bootstrap, chat or spoof an approval flag',async()=>{
 const id='00000000-0000-4000-8000-000000000001';let paid=false;
 const handler=createHandler({env:n=>n==='SUPABASE_URL'?'https://fixture.supabase.co':'fixture',fetcher:async(url)=>{
 const p=new URL(String(url)).pathname;if(String(url).startsWith('https://api.openai.com'))paid=true;
 return Response.json(p==='/auth/v1/user'?{id}:p==='/rest/v1/profiles'?{id,member_id:id,role:'explorer',is_active:true}:false);
 }});
 for(const action of ['bootstrap','chat','create_conversation','messages','download_file','knowledge_save']){const r=await handler(new Request('https://fixture.supabase.co',{method:'POST',headers:{Authorization:'Bearer fixture','Content-Type':'application/json'},body:JSON.stringify({action,approved:true,has_beau_access:true})}));equal(r.status,403);equal((await r.json()).code,'approval_required')}
 assert(!paid);
});

Deno.test('Admin retains approval management but cannot chat without explicit approval',async()=>{
 const id='00000000-0000-4000-8000-000000000001';
 const handler=createHandler({env:n=>n==='SUPABASE_URL'?'https://fixture.supabase.co':'fixture',fetcher:async(url)=>{const p=new URL(String(url)).pathname;return Response.json(p==='/auth/v1/user'?{id}:p==='/rest/v1/profiles'?{id,member_id:id,role:'admin',is_active:true}:p==='/rest/v1/rpc/beau_active_member'?false:p==='/rest/v1/beau_settings'?{enabled:true}:[])}});
 for(const [action,status] of [['settings',200],['usage',200],['knowledge_list',200],['chat',403],['messages',403],['create_conversation',403]]){const r=await handler(new Request('https://fixture.supabase.co',{method:'POST',headers:{Authorization:'Bearer fixture','Content-Type':'application/json'},body:JSON.stringify({action})}));equal(r.status,status)}
});

Deno.test('economy models avoid extra reasoning in both paid tiers',async()=>{
 for(const [model,effort] of [['gpt-5-nano','minimal'],['gpt-5-nano-2025-08-07','minimal'],['gpt-5.6-luna','none']])for(const intelligence of [false,true]){
  await generate({key:'private-fixture',model,instructions:'Only approved references.',input:[],maxOutput:256,intelligence,signal:new AbortController().signal,onDelta:()=>{},fetcher:async(_url,init)=>{const body=JSON.parse(String(init?.body));equal(body.reasoning,{effort});equal(body.store,false);return new Response('data: {"type":"response.output_text.delta","delta":"Fixture answer"}\n\ndata: {"type":"response.completed","response":{"usage":{"input_tokens":20,"output_tokens":3}}}\n\n')}});
 }
});
