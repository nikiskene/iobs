import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.57.4';
import { BeauError, text, uuid } from './domain.ts';
export type Database = SupabaseClient;
export type Actor = {id:string;member_id:string;role:string;is_active:boolean};
export type Chapter = {id:string;name:string};
export async function checked<T>(result: PromiseLike<{data:T|null;error:unknown}>): Promise<T> {
  const {data,error} = await result;
  if(error) {
    const code=(error as {code?:string}).code;
    if(code==='42501') throw new BeauError('forbidden','You do not have access to this action.',403);
    if(code==='54000') throw new BeauError('limit','Your BEAU request allowance or daily budget has been reached. Knowledge Engine answers remain available.',429);
    if(code==='23505' || code==='55000') throw new BeauError('in_progress','This request is already running or has already been submitted.',409);
    throw new BeauError('unavailable','BEAU could not complete this action. Please try again.',503);
  }
  return data as T;
}
export async function owned(db: Database, actor: Actor, value: unknown) {
  if(!uuid(value)) throw new BeauError('invalid_conversation','Choose a conversation.');
  const row=await checked(db.from('beau_conversations').select('id,user_id,title').eq('id',value).eq('user_id',actor.id).maybeSingle());
  if(!row) throw new BeauError('not_found','Conversation unavailable.',404);
  return row as {id:string;user_id:string;title:string};
}
export async function managedChapters(db: Database, actor: Actor): Promise<Chapter[]> {
  const result=await checked(db.from('chapters').select('id,name').eq('head_member_id',actor.member_id));
  return result as Chapter[];
}
export function isAdmin(actor: Actor) {return ['admin','super_admin'].includes(actor.role)}
export function canEdit(actor: Actor, chapters: Chapter[], row: {chapter_id?:unknown;visibility?:unknown}) {
  return isAdmin(actor) || (row.visibility==='internal' && uuid(row.chapter_id) && chapters.some(c=>c.id===row.chapter_id));
}
export async function cleanupFiles(db: Database) {
  try {
    const files=await checked(db.from('beau_file_cleanup').select('storage_path').limit(20));
    const paths=(files || []).map((f:{storage_path:string})=>f.storage_path);
    if(paths.length) {
      const {error}=await db.storage.from('beau-files').remove(paths);
      if(!error) await db.from('beau_file_cleanup').delete().in('storage_path',paths);
    }
  } catch { /* Queue remains durable; a later authenticated request retries cleanup. */ }
}
export function knowledgePayload(body: Record<string,unknown>, actor: Actor, chapters: Chapter[]) {
  const visibility=body.visibility==='restricted'?'restricted':body.visibility==='internal'?'internal':null;
  if(!visibility || !['approved','working_draft','superseded','archived'].includes(String(body.status))) throw new BeauError('invalid_knowledge','Choose a status and visibility.');
  const chapter_id=body.chapter_id || null;
  if(chapter_id!==null && !uuid(chapter_id)) throw new BeauError('invalid_chapter','Choose a chapter.');
  if(!canEdit(actor,chapters,{chapter_id,visibility})) throw new BeauError('forbidden','You can maintain only your own chapter’s internal knowledge.',403);
  const slug=text(body.slug,100);
  if(!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new BeauError('invalid_slug','Use lowercase letters, numbers and hyphens for the reference name.');
  if(!Array.isArray(body.faq_questions) || body.faq_questions.length>30) throw new BeauError('invalid_faq','Use up to 30 approved question variants.');
  const faq_questions=body.faq_questions.filter(q=>typeof q!=='string'||q.trim()).map(q=>text(q,300));
  return {slug,title:text(body.title,200),category:text(body.category,100),content:text(body.content,60000),status:body.status as string,visibility,chapter_id,source_note:text(body.source_note,1000,false),faq_questions,faq_answer:text(body.faq_answer,12000,false),updated_by:actor.id};
}
