import { ChevronDown, Download, FileText } from 'lucide-react';
import { formatFileSize, openMomentumDocument } from '../../lib/momentumDocuments';
import { momentumDocumentCategories, type MomentumDocument, type MomentumItem } from '../../lib/momentumTypes';

export default function DocumentRepository({ documents, items }: { documents: MomentumDocument[]; items: MomentumItem[] }) {
  const itemTitles = new Map(items.map((item) => [item.id, item.title]));
  const groups = momentumDocumentCategories.map((category) => ({
    ...category,
    documents: documents.filter((document) => document.category === category.value || (category.value === 'other' && !document.category)),
  })).filter((group) => group.documents.length > 0);
  async function open(document: MomentumDocument) {
    try { await openMomentumDocument(document); } catch { /* The next click can retry a transient signing error. */ }
  }

  return <section className="mt-12">
    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500"><FileText className="h-4 w-4" />Documents</div>
    <h2 className="mt-1 font-serif text-2xl text-stone-100">Work repository</h2>
    {documents.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center text-sm text-stone-600">Documents uploaded to work items will appear here automatically.</div> : <div className="mt-4 space-y-3">{groups.map((group) => <details key={group.value} open className="group/category rounded-2xl border border-white/[0.07] bg-white/[0.02]"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-stone-200"><span>{group.label} <span className="ml-1 text-xs font-normal text-stone-600">{group.documents.length}</span></span><ChevronDown className="h-4 w-4 text-stone-600 transition group-open/category:rotate-180" /></summary><div className="grid gap-3 border-t border-white/[0.06] p-3 md:grid-cols-2 xl:grid-cols-3">{group.documents.map((document) => <button key={document.id} onClick={() => void open(document)} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-amber-300/20 hover:bg-white/[0.05]">
      <div className="flex items-start gap-3"><span className="rounded-xl bg-amber-400/10 p-2 text-amber-300"><FileText className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-stone-200">{document.title}</strong><span className="mt-1 block truncate text-xs text-stone-600">{itemTitles.get(document.momentum_item_id) || 'Work item'}</span><span className="mt-2 block text-[10px] uppercase tracking-wider text-stone-600">{formatFileSize(document.file_size)}{document.file_size != null ? ' · ' : ''}{new Date(document.created_at).toLocaleDateString()}</span></span><Download className="h-4 w-4 text-stone-700 group-hover:text-amber-300" /></div>
    </button>)}</div></details>)}</div>}
  </section>;
}
