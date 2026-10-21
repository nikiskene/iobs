import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Paperclip, Plus, RefreshCw, Send, Square, Trash2, Pencil, X } from 'lucide-react';
import { beauAction, beauStream, beauUpload, type BeauBoot, type BeauConversation, type BeauFile, type BeauMessage } from '../../lib/beau';
import { extractBeauDocument } from '../../lib/beauDocuments';
import '../../components/beau/beau.css';
const errorMessage=(e:unknown)=>e instanceof Error?e.message:'Please try again.';
export default function BeauPage() {
  const [boot,setBoot]=useState<BeauBoot|null>(null),[conversations,setConversations]=useState<BeauConversation[]>([]),[active,setActive]=useState<string|null>(null),[messages,setMessages]=useState<BeauMessage[]>([]),[files,setFiles]=useState<BeauFile[]>([]),[attached,setAttached]=useState<string[]>([]),[draft,setDraft]=useState(''),[search,setSearch]=useState(''),[mode,setMode]=useState('auto'),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState<string|null>(null),[older,setOlder]=useState(false),[historyOpen,setHistoryOpen]=useState(false);
  const skipLoad=useRef<string|null>(null);
  const controller=useRef<AbortController|null>(null),activeRef=useRef<string|null>(null),bottom=useRef<HTMLDivElement>(null);
  useEffect(()=>{activeRef.current=active},[active]);
  const list=useCallback(async(q='')=>{const result=await beauAction<BeauConversation[]>('conversations',{search:q});setConversations(result);return result},[]);
  const load=useCallback(async(id:string,before?:number)=>{
    const [rows,attachments]=await Promise.all([beauAction<BeauMessage[]>('messages',{conversation_id:id,...(before?{before}:{})}),beauAction<BeauFile[]>('files',{conversation_id:id})]);
    if(activeRef.current!==id)return;
    const chronological=rows.slice().reverse();setMessages(current=>before?[...chronological,...current]:chronological);setOlder(rows.length===100);setFiles(attachments);
  },[]);
  useEffect(()=>{
    let mounted=true;
    Promise.all([beauAction<BeauBoot>('bootstrap'),list()]).then(([b,rows])=>{if(!mounted)return;setBoot(b);if(rows.length){activeRef.current=rows[0].id;setActive(rows[0].id)}}).catch(e=>{if(mounted)setError(errorMessage(e))});
    return()=>{mounted=false;controller.current?.abort();activeRef.current=null};
  },[list]);
  useEffect(()=>{if(!active)return;if(skipLoad.current===active){skipLoad.current=null;return;}setMessages([]);setFiles([]);setAttached([]);void load(active).catch(e=>setError(errorMessage(e)))},[active,load]);
  useEffect(()=>{if(busy)bottom.current?.scrollIntoView({block:'end'})},[busy,messages]);
  async function create(){setError('');try{const c=await beauAction<BeauConversation>('create_conversation');skipLoad.current=c.id;activeRef.current=c.id;setMessages([]);setFiles([]);setAttached([]);setActive(c.id);setHistoryOpen(false);await list(search);return c.id}catch(e){setError(errorMessage(e));return null}}
  async function send(event?:FormEvent,regenerate?:string){
    event?.preventDefault();if(busy||uploading||(!regenerate&&!draft.trim()))return;
    setError('');setBusy(true);let id=activeRef.current;const prompt=draft.trim();let assistantId='pending-'+crypto.randomUUID();
    try{
      if(!id)id=await create();if(!id)return;
      const currentId=id;const fileIds=attached.slice();
      if(!regenerate){setMessages(current=>[...current,{id:crypto.randomUUID(),seq:0,role:'user',content:prompt,status:'complete',attachment_ids:fileIds,metadata:{}},{id:assistantId,seq:0,role:'assistant',content:'',status:'streaming',attachment_ids:[],metadata:{}}]);setDraft('');setAttached([])}
      else {assistantId=regenerate;setMessages(current=>current.map(m=>m.id===regenerate?{...m,content:'',status:'streaming'}:m))}
      const abort=new AbortController();controller.current=abort;
      await beauStream({conversation_id:id,request_id:crypto.randomUUID(),prompt,mode,file_ids:fileIds,...(regenerate?{regenerate_id:regenerate}:{})},abort.signal,(type,data)=>{
        if(activeRef.current!==currentId)return;
        if(type==='meta'){const previous=assistantId;assistantId=String(data.message_id);setMessages(current=>current.map(m=>m.id===previous?{...m,id:assistantId,metadata:{level:Number(data.level),model:typeof data.model==='string'?data.model:undefined,sources:data.sources as BeauMessage['metadata']['sources'],cache_hit:!!data.cache_hit}}:m))}
        if(type==='delta')setMessages(current=>current.map(m=>m.id===assistantId?{...m,content:m.content+String(data.text||'')}:m));
      });
    }catch(e){if(!(e instanceof DOMException&&e.name==='AbortError')){setError(errorMessage(e));if(!regenerate)setDraft(prompt)}}
    finally{controller.current=null;setBusy(false);if(id&&activeRef.current===id){await load(id).catch(e=>setError(errorMessage(e)));await list(search).catch(e=>setError(errorMessage(e)))}}
  }
  async function upload(file:File){setUploading(true);setError('');try{const id=activeRef.current||await create();if(!id)return;const extracted=await extractBeauDocument(file);const result=await beauUpload(file,extracted,{action:'upload',conversation_id:id});setFiles(current=>[...current,result]);setAttached(current=>[...current,result.id])}catch(e){setError(errorMessage(e))}finally{setUploading(false)}}
  async function rename(c:BeauConversation){const title=window.prompt('Conversation title',c.title);if(!title?.trim())return;try{await beauAction('rename_conversation',{conversation_id:c.id,title});await list(search)}catch(e){setError(errorMessage(e))}}
  async function remove(c:BeauConversation){if(!window.confirm('Delete this private conversation and its attached files?'))return;try{await beauAction('delete_conversation',{conversation_id:c.id});if(active===c.id){activeRef.current=null;setActive(null);setMessages([]);setFiles([]);setAttached([])}await list(search)}catch(e){setError(errorMessage(e))}}
  async function download(id:string){const popup=window.open('','_blank');if(popup)popup.opener=null;try{const data=await beauAction<{signedUrl:string}>('download_file',{file_id:id});if(popup)popup.location.href=data.signedUrl;else setError('Your browser blocked the document window. Allow it and try again.')}catch(e){popup?.close();setError(errorMessage(e))}}
  async function copy(m:BeauMessage){try{await navigator.clipboard.writeText(m.content);setCopied(m.id)}catch{setError('Copy is unavailable in this browser. You can select the response text.')}}
  return <main className="beau-page">
    <header className="beau-title"><div><p className="beau-eyebrow">The IOBS Intelligence</p><h1>BEAU</h1></div><div className="beau-toolbar">{boot?.can_manage_knowledge&&<Link to={boot.is_admin?'/admin/beau':'/beau/knowledge'}>Knowledge & settings</Link>}<button type="button" disabled={busy||uploading} onClick={()=>void create()}><Plus size={18}/>New conversation</button></div></header>
    {error&&<p role="alert" className="beau-error">{error}</p>}
    {!boot&&!error&&<p role="status">Getting BEAU ready…</p>}
    {boot&&!boot.enabled&&<p role="status">BEAU is temporarily paused.</p>}
    <div className="beau-layout">
      <aside className={`beau-history ${historyOpen?'is-open':''}`}><button type="button" className="beau-history-toggle" aria-expanded={historyOpen} onClick={()=>setHistoryOpen(v=>!v)}>Conversations</button><div className="beau-history-content"><form onSubmit={e=>{e.preventDefault();void list(search).catch(e=>setError(errorMessage(e)))}}><label className="sr-only" htmlFor="beau-history-search">Search private history</label><input id="beau-history-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search private history"/><button type="submit">Search</button></form><p className="beau-private-note">Your conversations are private.</p><ul>{conversations.map(c=><li key={c.id} className={active===c.id?'is-active':''}><button disabled={busy||uploading} onClick={()=>{activeRef.current=c.id;setActive(c.id);setHistoryOpen(false)}} className="beau-conversation-title">{c.title}</button><button disabled={busy||uploading} aria-label={`Rename ${c.title}`} onClick={()=>void rename(c)}><Pencil size={15}/></button><button disabled={busy||uploading} aria-label={`Delete ${c.title}`} onClick={()=>void remove(c)}><Trash2 size={15}/></button></li>)}</ul></div></aside>
      <section className="beau-chat" aria-label="Conversation with BEAU">
        <div className="beau-messages" role="log" aria-live="polite" aria-relevant="additions text">
          {older&&messages.length>0&&<button type="button" disabled={busy} onClick={()=>active&&void load(active,messages[0].seq).catch(e=>setError(errorMessage(e)))}>Load older messages</button>}
          {!messages.length&&<div className="beau-welcome"><h2>Hello, I’m BEAU.</h2><p>I know quite a bit about Beautiful Success. And I’m learning more every day.</p><p>What can I help you with?</p><div>{['What is IOBS?','Who leads the Amsterdam chapter?','Help me write an invitation.'].map(q=><button key={q} disabled={busy} onClick={()=>setDraft(q)}>{q}</button>)}</div></div>}
          {messages.map(m=><article key={m.id} className={`beau-message beau-message-${m.role}`}><p className="beau-speaker">{m.role==='user'?'You':'BEAU'}</p><div className="beau-markdown"><ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} disallowedElements={['img','iframe','script','style','object']} components={{a:props=><a href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>}}>{m.content||'Thinking…'}</ReactMarkdown></div>{m.attachment_ids?.length>0&&<div className="beau-attachments">{m.attachment_ids.map(id=><button key={id} onClick={()=>void download(id)}><Paperclip size={14}/>{files.find(f=>f.id===id)?.file_name||'Attached document'}</button>)}</div>}{m.role==='assistant'&&m.content&&<><p className="beau-answer-level">{m.metadata?.level===1?'Knowledge Engine · No AI request':m.metadata?.level===3?'BEAU Intelligence':m.metadata?.level===2?'BEAU Mini':'Response not completed'}{m.metadata?.cache_hit?' · Cached answer':''}{m.status==='interrupted'?' · Interrupted':''}</p>{m.metadata?.sources?.map(s=><details key={s.id} className="beau-source"><summary>{s.title}</summary><p>{s.source}{s.version?` · Version ${s.version}`:''}</p><blockquote>{s.excerpt}</blockquote></details>)}<div className="beau-message-actions"><button disabled={busy} onClick={()=>void copy(m)}><Copy size={15}/>{copied===m.id?'Copied':'Copy'}</button><button disabled={busy} onClick={()=>void send(undefined,m.id)}><RefreshCw size={15}/>Regenerate</button></div></>}</article>)}
          <div ref={bottom}/>
        </div>
        <form onSubmit={e=>void send(e)} className="beau-composer"><label htmlFor="beau-prompt" className="sr-only">Message BEAU</label><textarea id="beau-prompt" rows={3} maxLength={12000} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ask BEAU…" disabled={!boot||!boot.enabled||busy||uploading}/>{attached.length>0&&<div className="beau-attachments">{attached.map(id=><span key={id}>{files.find(f=>f.id===id)?.file_name}<button type="button" aria-label={`Remove ${files.find(f=>f.id===id)?.file_name}`} onClick={()=>setAttached(current=>current.filter(f=>f!==id))}><X size={14}/></button></span>)}</div>}<div className="beau-composer-actions"><label className="beau-upload"><Paperclip size={18}/>{uploading?'Reading document…':'Attach'}<input aria-label="Attach document" type="file" accept=".txt,.md,.pdf,.docx" disabled={!boot||busy||uploading||attached.length>=4} onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value=''}}/></label><label className="sr-only" htmlFor="beau-mode">Intelligence level</label><select id="beau-mode" value={mode} disabled={busy} onChange={e=>setMode(e.target.value)}><option value="auto">Auto</option><option value="mini">BEAU Mini</option><option value="intelligence">BEAU Intelligence</option></select>{busy?<button type="button" onClick={()=>controller.current?.abort()}><Square size={16}/>Stop</button>:<button type="submit" disabled={!boot||!boot.enabled||uploading||!draft.trim()}><Send size={17}/>Send</button>}</div><p className="beau-private-note">Auto starts with approved knowledge, then chooses an AI level when needed. Check important decisions against the cited sources.</p></form>
      </section>
    </div>
  </main>;
}
