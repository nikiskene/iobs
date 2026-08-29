import { Download, FileText } from 'lucide-react';
import { formatFileSize, openMomentumDocument } from '../../lib/momentumDocuments';
import type { MomentumDocument, MomentumItem } from '../../lib/momentumTypes';

export default function DocumentRepository({ documents, items }: { documents: MomentumDocument[]; items: MomentumItem[] }) {
  const itemTitles = new Map(items.map((item) => [item.id, item.title]));
  async function open(document: MomentumDocument) {
    try { await openMomentumDocument(document); } catch { /* The next click can retry a transient signing error. */ }
  }

  return <section className="mt-12">
    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500"><FileText className="h-4 w-4" />Documents</div>
    <h2 className="mt-1 font-serif text-2xl text-stone-100">Work repository</h2>
    {documents.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center text-sm text-stone-600">Documents uploaded to work items will appear here automatically.</div> : <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{documents.map((document) => <button key={document.id} onClick={() => void open(document)} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-amber-300/20 hover:bg-white/[0.05]">
      <div className="flex items-start gap-3"><span className="rounded-xl bg-amber-400/10 p-2 text-amber-300"><FileText className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-stone-200">{document.title}</strong><span className="mt-1 block truncate text-xs text-stone-600">{itemTitles.get(document.momentum_item_id) || 'Work item'}</span><span className="mt-2 block text-[10px] uppercase tracking-wider text-stone-600">{formatFileSize(document.file_size)}{document.file_size != null ? ' · ' : ''}{new Date(document.created_at).toLocaleDateString()}</span></span><Download className="h-4 w-4 text-stone-700 group-hover:text-amber-300" /></div>
    </button>)}</div>}
  </section>;
}
