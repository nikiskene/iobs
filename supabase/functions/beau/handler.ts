import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { BeauError, hash, text, uuid } from './domain.ts';
import { chat } from './chat.ts';
import { canEdit, checked, cleanupFiles, isAdmin, knowledgePayload, managedChapters, owned, type Actor, type Chapter, type Database } from './store.ts';
const origins=new Set(['https://iobs.cc','https://www.iobs.cc','http://localhost:5173','http://127.0.0.1:4178','http://127.0.0.1:5173']);
async function bytes(request:Request, max:number) {
  if(!request.body) throw new BeauError('invalid_request','Request body required.');
  const reader=request.body.getReader();let size=0;const chunks:Uint8Array[]=[];
  try {for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new BeauError('too_large','This request is too large.',413)}chunks.push(value)}}finally{reader.releaseLock()}
  const data=new Uint8Array(size);let offset=0;for(const c of chunks){data.set(c,offset);offset+=c.length}return data;
}
async function upload(db:Database, actor:Actor, chapters:Chapter[], form:FormData) {
  const file=form.get('file');if(!(file instanceof File)||file.size<1||file.size>5242880)throw new BeauError('invalid_file','Choose a text, PDF or DOCX file up to 5 MB.');
  const extracted=text(form.get('extracted_text'),60000);
  const suffix=file.name.toLowerCase().split('.').pop();
  const mime:Record<string,string>={pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',txt:'text/plain',md:'text/markdown'};
  if(!suffix||!mime[suffix])throw new BeauError('invalid_file','Choose a text, PDF or DOCX document.');
  const raw=new Uint8Array(await file.arrayBuffer());
  if((suffix==='pdf'&&new TextDecoder().decode(raw.slice(0,5))!=='%PDF-')||(suffix==='docx'&&(raw[0]!==80||raw[1]!==75))||(['txt','md'].includes(suffix)&&raw.slice(0,4096).includes(0)))throw new BeauError('invalid_file','The file does not match its document type.');
  const digest=await hash(raw);let conversation_id:string|null=null;let knowledge_id:string|null=null;
  const importing=form.get('action')==='import';
  if(importing) {
    const chapter_id=form.get('chapter_id')||null; const visibility=form.get('visibility')==='restricted'?'restricted':'internal';
    if(!canEdit(actor,chapters,{chapter_id,visibility}))throw new BeauError('forbidden','Knowledge import requires the appropriate chapter or Admin access.',403);
    const candidates=await checked(db.from('beau_files').select('knowledge_id').eq('content_hash',digest).not('knowledge_id','is',null)) as {knowledge_id:string}[];
    for(const candidate of candidates){const k=await checked(db.from('beau_knowledge').select('chapter_id,visibility').eq('id',candidate.knowledge_id).maybeSingle());if(k&&canEdit(actor,chapters,k))throw new BeauError('duplicate','A matching document has already been imported.',409)}
    const row=await checked<{id:string}>(db.from('beau_knowledge').insert({slug:'import-'+crypto.randomUUID(),title:file.name.slice(0,200),category:'Imported documents',content:extracted,status:'working_draft',visibility,chapter_id,source_note:'Uploaded document: '+file.name.slice(0,200)+' (unverified extraction; review before approval)',created_by:actor.id,updated_by:actor.id}).select('id').single());
    knowledge_id=(row as {id:string}).id;
  } else {conversation_id=(await owned(db,actor,form.get('conversation_id'))).id}
  const id=crypto.randomUUID();const path=`${actor.id}/${conversation_id||knowledge_id}/${id}.${suffix}`;
  const {error}=await db.storage.from('beau-files').upload(path,raw,{contentType:mime[suffix],upsert:false});
  if(error){if(knowledge_id)await db.from('beau_knowledge').update({status:'archived'}).eq('id',knowledge_id);throw new BeauError('upload_failed','The document could not be uploaded. Please try again.',503)}
  try {
    const data=await checked(db.from('beau_files').insert({id,user_id:actor.id,conversation_id,knowledge_id,file_name:file.name.slice(0,200),file_size:file.size,storage_path:path,content_hash:digest,extracted_text:extracted}).select('id,file_name,knowledge_id').single());
    return data;
  }catch(e){await db.storage.from('beau-files').remove([path]);if(knowledge_id)await db.from('beau_knowledge').update({status:'archived'}).eq('id',knowledge_id);throw e}
}
export function createHandler(deps:{env:(name:string)=>string|undefined;fetcher?:typeof fetch}) {
 const fetcher=deps.fetcher||fetch;
 return async(request:Request)=>{
  const origin=request.headers.get('origin');
  const headers:Record<string,string>={'Access-Control-Allow-Origin':origin&&origins.has(origin)?origin:'https://www.iobs.cc','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
  const respond=(data:unknown,status=200)=>Response.json(data,{status,headers});
  try {
   if(origin&&!origins.has(origin))throw new BeauError('origin','Origin not allowed.',403);
   if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
   if(request.method!=='POST')return respond({error:'Method not allowed'},405);
   const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
   if(!token)throw new BeauError('unauthorized','Please sign in to use BEAU.',401);
   const url=deps.env('SUPABASE_URL'),service=deps.env('SUPABASE_SERVICE_ROLE_KEY');
   if(!url||!service)throw new BeauError('not_configured','BEAU is not configured.',503);
   const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:fetcher}});
   const {data:auth,error:authError}=await db.auth.getUser(token);
   if(authError||!auth.user)throw new BeauError('unauthorized','Please sign in again to use BEAU.',401);
   const actor=await checked(db.from('profiles').select('id,member_id,role,is_active').eq('id',auth.user.id).maybeSingle()) as Actor|null;
   if(!actor?.is_active)throw new BeauError('forbidden','Active membership is required.',403);
   const chapters=await managedChapters(db,actor);
   if(request.headers.get('content-type')?.includes('multipart/form-data')) {
     const form=await new Response(await bytes(request,6*1024*1024),{headers:{'Content-Type':request.headers.get('content-type')!}}).formData();
     if(!['upload','import'].includes(String(form.get('action'))))throw new BeauError('action','Unsupported action.');
     return respond(await upload(db,actor,chapters,form));
   }
   let body:Record<string,unknown>;
   try{body=JSON.parse(new TextDecoder().decode(await bytes(request,300000)))}catch(e){if(e instanceof BeauError)throw e;throw new BeauError('invalid_json','Please check the request.');}
   if(!body||Array.isArray(body)||typeof body!=='object')throw new BeauError('invalid_request','Please check the request.');
   const action=body.action;
   if(action==='chat')return await chat(db,actor,body,headers,()=>deps.env('OPENAI_API_KEY_BEAU'),fetcher);
   if(action==='bootstrap') {
    await cleanupFiles(db);
    const settings=await checked<{enabled:boolean}>(db.from('beau_settings').select('enabled').eq('id',true).single());
    return respond({is_admin:isAdmin(actor),can_manage_knowledge:isAdmin(actor)||chapters.length>0,chapters:isAdmin(actor)?await checked(db.from('chapters').select('id,name,city').order('name')):chapters,enabled:(settings as {enabled:boolean}).enabled});
   }
   if(action==='conversations')return respond(await checked(db.rpc('beau_history_search',{actor:actor.id,phrase:body.search===undefined?'':text(body.search,200,false)})));
   if(action==='create_conversation')return respond(await checked(db.from('beau_conversations').insert({user_id:actor.id,title:'New conversation'}).select('id,title,updated_at').single()));
   if(['messages','rename_conversation','delete_conversation','files'].includes(String(action))) {
    const c=await owned(db,actor,body.conversation_id);
    if(action==='messages') {
      let q=db.from('beau_messages').select('id,seq,role,content,status,reply_to,attachment_ids,metadata,created_at').eq('conversation_id',c.id).order('seq',{ascending:false}).limit(100);
      if(body.before!==undefined){if(!Number.isSafeInteger(body.before)||Number(body.before)<1)throw new BeauError('cursor','Invalid message position.');q=q.lt('seq',Number(body.before))}
      return respond(await checked(q));
    }
    if(action==='files')return respond(await checked(db.from('beau_files').select('id,file_name').eq('conversation_id',c.id).eq('user_id',actor.id)));
    if(action==='rename_conversation')return respond(await checked(db.from('beau_conversations').update({title:text(body.title,160),updated_at:new Date().toISOString()}).eq('id',c.id).eq('user_id',actor.id).select('id,title,updated_at').single()));
    await checked(db.from('beau_conversations').delete().eq('id',c.id).eq('user_id',actor.id));await cleanupFiles(db);return respond({deleted:true});
   }
   if(action==='download_file') {
    if(!uuid(body.file_id))throw new BeauError('invalid_file','Choose a document.');
    const row=await checked(db.from('beau_files').select('storage_path').eq('id',body.file_id).eq('user_id',actor.id).maybeSingle()) as {storage_path:string}|null;
    if(!row)throw new BeauError('not_found','Document unavailable.',404);
    return respond(await checked(db.storage.from('beau-files').createSignedUrl(row.storage_path,60)));
   }
   if(['knowledge_list','knowledge_save','knowledge_versions'].includes(String(action))) {
    if(!isAdmin(actor)&&!chapters.length)throw new BeauError('forbidden','Knowledge management requires chapter or Admin access.',403);
    if(action==='knowledge_list') {
      let q=db.from('beau_knowledge').select('id,slug,title,category,content,status,visibility,chapter_id,source_note,faq_questions,faq_answer,version,updated_at').order('updated_at',{ascending:false});
      if(!isAdmin(actor))q=q.eq('visibility','internal').in('chapter_id',chapters.map(c=>c.id));
      return respond(await checked(q.limit(500)));
    }
    if(action==='knowledge_versions') {
      if(!uuid(body.knowledge_id))throw new BeauError('invalid_knowledge','Choose an entry.');
      const row=await checked(db.from('beau_knowledge').select('chapter_id,visibility').eq('id',body.knowledge_id).maybeSingle());
      if(!row||!canEdit(actor,chapters,row))throw new BeauError('forbidden','Knowledge access required.',403);
      const versions=await checked<{version:number;snapshot:{chapter_id:string|null;visibility:string};created_at:string;changed_by:string|null}[]>(db.from('beau_knowledge_versions').select('version,snapshot,created_at,changed_by').eq('knowledge_id',body.knowledge_id).order('version',{ascending:false}).limit(100));
      return respond(versions.filter(v=>canEdit(actor,chapters,v.snapshot)));
    }
    const payload=knowledgePayload(body,actor,chapters);
    let result;
    if(body.id) {
      if(!uuid(body.id)||!Number.isInteger(body.version))throw new BeauError('invalid_knowledge','Reload this entry before saving.');
      const old=await checked(db.from('beau_knowledge').select('chapter_id,visibility').eq('id',body.id).maybeSingle());
      if(!old||!canEdit(actor,chapters,old))throw new BeauError('forbidden','Knowledge access required.',403);
      result=await checked<{id:string;version:number}>(db.from('beau_knowledge').update(payload).eq('id',body.id).eq('version',body.version).select('id,version').maybeSingle());
      if(!result)throw new BeauError('conflict','Someone updated this entry. Reload it before saving.',409);
    }else result=await checked<{id:string;version:number}>(db.from('beau_knowledge').insert({...payload,created_by:actor.id}).select('id,version').single());
    await checked(db.from('beau_audit').insert({actor_id:actor.id,action:body.id?'knowledge.update':'knowledge.create',entity_id:(result as {id:string}).id}));
    return respond(result);
   }
   if(['settings','settings_save','usage'].includes(String(action))) {
    if(!isAdmin(actor))throw new BeauError('forbidden','Admin access required.',403);
    if(action==='usage')return respond(await checked(db.rpc('beau_usage_report',{actor:actor.id})));
    if(action==='settings')return respond(await checked(db.from('beau_settings').select('*').eq('id',true).single()));
    const updates:Record<string,unknown>={updated_at:new Date().toISOString()};
    if(typeof body.enabled!=='boolean')throw new BeauError('settings','Choose whether BEAU is enabled.');updates.enabled=body.enabled;
    for(const key of ['mini_model','intelligence_model']){const model=text(body[key],100);if(!/^[a-z0-9][a-z0-9_.:-]*$/i.test(model))throw new BeauError('model','Enter a valid model identifier.');updates[key]=model}
    updates.system_instructions=text(body.system_instructions,8000);
    for(const [key,min,max,integer] of [['max_output_tokens',256,8192,true],['daily_user_limit',1,1000,true],['daily_user_budget',0.01,100,false],['daily_global_budget',0.01,10000,false],['mini_input_price',0.001,1000,false],['mini_cached_price',0,1000,false],['mini_output_price',0.001,1000,false],['intelligence_input_price',0.001,1000,false],['intelligence_cached_price',0,1000,false],['intelligence_output_price',0.001,1000,false]] as const) {
      const value=body[key];if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))throw new BeauError('settings','Check the model prices and usage limits.');updates[key]=value;
    }
    if(Number(updates.mini_cached_price)>Number(updates.mini_input_price)||Number(updates.intelligence_cached_price)>Number(updates.intelligence_input_price))throw new BeauError('pricing','Cached input prices cannot exceed input prices.');
    return respond(await checked(db.from('beau_settings').update(updates).eq('id',true).select('*').single()));
   }
   throw new BeauError('action','Unsupported BEAU action.');
  } catch(error) {
   const known=error instanceof BeauError;
   return respond({error:known?error.message:'BEAU is temporarily unavailable. Please try again.',code:known?error.code:'unavailable'},known?error.status:503);
  }
 };
}
