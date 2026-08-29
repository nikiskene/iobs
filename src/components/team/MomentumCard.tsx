import { ArrowRight, Calendar, Clock3, Paperclip } from 'lucide-react';
import type { MomentumItem, MomentumOwner } from '../../lib/momentumTypes';

const statusStyle = {
  pushing: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  waiting: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  stuck: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  fact: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
};

export default function MomentumCard({ item, owner, onClick, compact = false }: {
  item: MomentumItem; owner?: MomentumOwner; onClick: () => void; compact?: boolean;
}) {
  const waitingDays = item.waiting_since
    ? Math.max(0, Math.floor((Date.now() - new Date(item.waiting_since).getTime()) / 86400000))
    : 0;
  return <button onClick={onClick} className="group w-full rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:-translate-y-0.5 hover:border-amber-300/20 hover:bg-white/[0.045] sm:rounded-2xl sm:p-4">
    <div className="flex items-start justify-between gap-2 sm:gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5 sm:gap-2"><span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:px-2 sm:text-[10px] ${statusStyle[item.status]}`}>{item.status}</span>{item.category && <span className="text-[9px] uppercase tracking-wider text-stone-600 sm:text-[10px]">{item.category}</span>}</div><h3 className="mt-1.5 text-sm font-medium leading-snug text-stone-100 sm:mt-2 sm:text-base">{item.status === 'fact' && item.fact_summary ? item.fact_summary : item.title}</h3></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-stone-700 transition group-hover:translate-x-0.5 group-hover:text-amber-300" /></div>
    {!compact && item.next_move && <p className="mt-3 hidden text-sm leading-relaxed text-stone-400 sm:block"><span className="text-stone-600">Next:</span> {item.next_move}</p>}
    {!compact && item.status === 'waiting' && item.waiting_on && <p className="mt-2 hidden text-sm text-sky-200/75 sm:block">Waiting on {item.waiting_on}</p>}
    {!compact && item.status === 'stuck' && item.stuck_reason && <p className="mt-2 hidden text-sm text-rose-200/75 sm:block">{item.stuck_reason}</p>}
    <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-600 sm:mt-3 sm:flex-wrap sm:gap-3 sm:text-xs"><span className="truncate">{owner?.full_name || 'Unassigned'}</span>{item.target_date && <span className="inline-flex shrink-0 items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(item.target_date)}</span>}<span className="hidden sm:contents">{item.target_period && !item.target_date && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{item.target_period}</span>}{item.requires_document && <span className="inline-flex items-center gap-1 text-amber-300/60"><Paperclip className="h-3 w-3" />Document required</span>}{item.status === 'waiting' && <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{waitingDays === 0 ? 'Today' : `${waitingDays}d waiting`}</span>}</span></div>
  </button>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
}
