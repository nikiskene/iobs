import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Archive, ArrowLeft, ArrowUpRight, CheckCircle2, ChevronDown, Hourglass, Plus, Sparkles } from 'lucide-react';
import MomentumCard from '../../components/team/MomentumCard';
import MomentumForm from '../../components/team/MomentumForm';
import DocumentRepository from '../../components/team/DocumentRepository';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { MomentumDocument, MomentumItem, MomentumOwner, MomentumStatus } from '../../lib/momentumTypes';

type DashboardView = 'factsToday' | 'factsWeek' | 'factsAll' | 'pushing' | 'waiting' | 'stuck';

export default function TeamMomentumPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MomentumItem[]>([]);
  const [owners, setOwners] = useState<MomentumOwner[]>([]);
  const [documents, setDocuments] = useState<MomentumDocument[]>([]);
  const [editing, setEditing] = useState<MomentumItem | null | undefined>(undefined);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [dashboardView, setDashboardView] = useState<DashboardView | null>(null);
  const [mobileMode, setMobileMode] = useState<'overview' | 'facts'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const [itemsResult, ownersResult, documentsResult] = await Promise.all([
      supabase.from('momentum_items').select('*').order('updated_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, photo_url, role, is_team_member').eq('is_active', true).or('is_team_member.eq.true,role.eq.admin').order('full_name'),
      supabase.from('momentum_documents').select('*').order('created_at', { ascending: false }),
    ]);
    if (itemsResult.error || ownersResult.error || documentsResult.error) setError(itemsResult.error?.message || ownersResult.error?.message || documentsResult.error?.message || 'Could not load momentum.');
    else { setItems((itemsResult.data as MomentumItem[]) || []); setOwners((ownersResult.data as MomentumOwner[]) || []); setDocuments((documentsResult.data as MomentumDocument[]) || []); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(startToday); weekStart.setDate(startToday.getDate() - ((startToday.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
  const facts = items.filter((item) => item.status === 'fact' && !item.archived_at);
  const archivedFacts = items.filter((item) => item.status === 'fact' && item.archived_at);
  const active = items.filter((item) => item.status !== 'fact' && !item.archived_at && (!ownerFilter || item.owner_user_id === ownerFilter));
  const factsThisWeek = facts.filter((item) => item.completed_at && new Date(item.completed_at) >= weekStart);
  const factsToday = facts.filter((item) => item.completed_at && new Date(item.completed_at) >= startToday);
  const thisWeek = active.filter((item) => item.target_date && dateAtNoon(item.target_date) >= weekStart && dateAtNoon(item.target_date) < weekEnd);
  const undatedActive = active.filter((item) => !item.target_date);
  const weeklyFocus = [...thisWeek, ...undatedActive];
  const ownerMap = useMemo(() => new Map(owners.map((owner) => [owner.id, owner])), [owners]);
  const dashboardLists: Record<DashboardView, { title: string; items: MomentumItem[] }> = {
    factsToday: { title: 'Facts today', items: factsToday },
    factsWeek: { title: 'Facts this week', items: factsThisWeek },
    factsAll: { title: 'All current facts', items: facts },
    pushing: { title: 'Pushing', items: items.filter((item) => item.status === 'pushing' && !item.archived_at) },
    waiting: { title: 'Waiting', items: items.filter((item) => item.status === 'waiting' && !item.archived_at) },
    stuck: { title: 'Stuck', items: items.filter((item) => item.status === 'stuck' && !item.archived_at) },
  };

  function count(status: MomentumStatus, ownerId?: string) {
    return items.filter((item) => item.status === status && (!ownerId || item.owner_user_id === ownerId)).length;
  }

  function openDashboardView(view: DashboardView) {
    setDashboardView(view);
    setMobileMode('facts');
  }

  if (loading) return <div className="py-24 text-center text-sm text-stone-500">Gathering momentum…</div>;

  return <div className="pb-20 text-stone-200">
    <div className="sticky top-2 z-30 mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#171310]/95 p-1.5 shadow-xl backdrop-blur sm:hidden"><button onClick={() => { setMobileMode('overview'); setDashboardView(null); }} className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold ${mobileMode === 'overview' ? 'bg-amber-400 text-stone-950' : 'text-stone-500'}`}>Overview</button><button onClick={() => { setMobileMode('facts'); setDashboardView(null); }} className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold ${mobileMode === 'facts' ? 'bg-amber-400 text-stone-950' : 'text-stone-500'}`}>Facts Engine</button><button onClick={() => setEditing(null)} className="rounded-xl border border-amber-300/20 p-2 text-amber-300" aria-label="Add momentum"><Plus className="h-4 w-4" /></button></div>

    <div className={mobileMode === 'overview' ? 'block' : 'hidden sm:block'}>
    <header className="relative overflow-hidden rounded-3xl border border-amber-300/10 bg-[radial-gradient(circle_at_top_right,rgba(180,123,42,0.18),transparent_42%),linear-gradient(135deg,#1b1510,#100e0c)] p-6 sm:p-9">
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-400"><Sparkles className="h-4 w-4" />Team Momentum</div><h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-stone-50 sm:text-5xl">What became real?</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-400 sm:text-base">See what is moving, make the next move, and turn momentum into facts.</p></div><button onClick={() => setEditing(null)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-950/20 hover:bg-amber-300"><Plus className="h-4 w-4" />Add momentum</button></div>
    </header>

    {error && <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</div>}

    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
      <Score label="Facts today" value={factsToday.length} accent active={dashboardView === 'factsToday'} onClick={() => openDashboardView('factsToday')} />
      <Score label="This week" value={factsThisWeek.length} note="Target 7" accent active={dashboardView === 'factsWeek'} onClick={() => openDashboardView('factsWeek')} />
      <Score label="Total facts" value={facts.length} accent active={dashboardView === 'factsAll'} onClick={() => openDashboardView('factsAll')} />
      <Score label="Pushing" value={count('pushing')} active={dashboardView === 'pushing'} onClick={() => openDashboardView('pushing')} />
      <Score label="Waiting" value={count('waiting')} active={dashboardView === 'waiting'} onClick={() => openDashboardView('waiting')} />
      <Score label="Stuck" value={count('stuck')} warning={count('stuck') > 0} active={dashboardView === 'stuck'} onClick={() => openDashboardView('stuck')} />
    </section>
    </div>

    {dashboardView ? <section className="mt-5 sm:mt-10"><button onClick={() => setDashboardView(null)} className="mb-4 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-amber-200"><ArrowLeft className="h-4 w-4" />All Facts Engine lists</button><SectionHead eyebrow="Dashboard list" title={dashboardLists[dashboardView].title} icon={<CheckCircle2 className="h-4 w-4" />} /><div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">{dashboardLists[dashboardView].items.length ? dashboardLists[dashboardView].items.map((item) => <MomentumCard key={item.id} item={item} owner={ownerMap.get(item.owner_user_id || '')} onClick={() => setEditing(item)} />) : <Empty text="Nothing in this list yet." />}</div></section> : <>
    <div className={mobileMode === 'facts' ? 'block' : 'hidden sm:block'}>
    <div className="mt-5 grid gap-7 sm:mt-10 sm:gap-10 xl:grid-cols-[1.35fr_0.85fr]">
      <section><SectionHead eyebrow="This week" title="What we are making real" icon={<ArrowUpRight className="h-4 w-4" />} /><div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3 md:grid-cols-2">{weeklyFocus.length ? weeklyFocus.map((item) => <MomentumCard key={item.id} item={item} owner={ownerMap.get(item.owner_user_id || '')} onClick={() => setEditing(item)} />) : <Empty text="No active momentum yet. Create the first move." />}</div></section>
      <section><SectionHead eyebrow="Waiting on" title="Where follow-up matters" icon={<Hourglass className="h-4 w-4" />} /><div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">{active.filter((item) => item.status === 'waiting').length ? active.filter((item) => item.status === 'waiting').map((item) => <MomentumCard key={item.id} item={item} owner={ownerMap.get(item.owner_user_id || '')} onClick={() => setEditing(item)} />) : <Empty text="Nothing is waiting externally." />}</div></section>
    </div>

    {active.some((item) => item.status === 'stuck') && <section className="mt-10 rounded-3xl border border-rose-400/15 bg-rose-950/10 p-5 sm:p-7"><SectionHead eyebrow="Intervention" title="Stuck" icon={<AlertTriangle className="h-4 w-4" />} /><div className="mt-4 grid gap-3 md:grid-cols-2">{active.filter((item) => item.status === 'stuck').map((item) => <MomentumCard key={item.id} item={item} owner={ownerMap.get(item.owner_user_id || '')} onClick={() => setEditing(item)} />)}</div></section>}

    <section className="mt-8 sm:mt-12"><SectionHead eyebrow="Scoreboard" title="Facts created" icon={<CheckCircle2 className="h-4 w-4" />} /><div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">{facts.length ? facts.slice(0, 12).map((item) => <MomentumCard key={item.id} item={item} owner={ownerMap.get(item.owner_user_id || '')} onClick={() => setEditing(item)} compact />) : <Empty text="The first fact is waiting to become real." />}</div></section>

    <details className="group/archive mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4"><span className="inline-flex items-center gap-2 text-sm font-medium text-stone-300"><Archive className="h-4 w-4 text-stone-600" />Archived Facts <span className="text-xs font-normal text-stone-600">{archivedFacts.length}</span></span><ChevronDown className="h-4 w-4 text-stone-600 transition group-open/archive:rotate-180" /></summary>{archivedFacts.length ? <div className="grid gap-3 border-t border-white/[0.06] p-4 md:grid-cols-2 xl:grid-cols-3">{archivedFacts.map((item) => <MomentumCard key={item.id} item={item} owner={ownerMap.get(item.owner_user_id || '')} onClick={() => setEditing(item)} compact />)}</div> : <div className="border-t border-white/[0.06] px-5 py-6 text-sm text-stone-600">No archived facts.</div>}</details>
    </div>

    <div className={mobileMode === 'overview' ? 'block' : 'hidden sm:block'}>
    <section className="mt-12"><SectionHead eyebrow="Who is pushing what" title="Team view" icon={<Sparkles className="h-4 w-4" />} /><div className="mt-4 flex gap-3 overflow-x-auto pb-2"><TeamChip active={!ownerFilter} name="Everyone" stats={`${items.filter((item) => item.status !== 'fact').length} active`} onClick={() => setOwnerFilter(null)} />{owners.map((owner) => <TeamChip key={owner.id} active={ownerFilter === owner.id} name={owner.full_name || 'Unnamed'} stats={`${count('pushing', owner.id)} pushing · ${count('waiting', owner.id)} waiting · ${factsThisWeek.filter((item) => item.owner_user_id === owner.id).length} facts`} onClick={() => setOwnerFilter(owner.id)} />)}</div></section>

    <DocumentRepository documents={documents} items={items} />
    </div>
    </>}

    {editing !== undefined && user && <MomentumForm item={editing} owners={owners} currentUserId={user.id} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); void load(); }} />}
  </div>;
}

function Score({ label, value, note, accent, warning, active, onClick }: { label: string; value: number; note?: string; accent?: boolean; warning?: boolean; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} aria-pressed={active} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300/30 ${active ? 'ring-2 ring-amber-300/30' : ''} ${warning ? 'border-rose-400/20 bg-rose-400/[0.07]' : accent ? 'border-amber-300/15 bg-amber-300/[0.05]' : 'border-white/[0.07] bg-white/[0.025]'}`}><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p><div className="mt-2 flex items-end justify-between gap-2"><strong className={`font-serif text-3xl ${warning ? 'text-rose-300' : accent ? 'text-amber-300' : 'text-stone-200'}`}>{value}</strong>{note && <span className="pb-1 text-[10px] text-stone-600">{note}</span>}</div></button>;
}

function SectionHead({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: React.ReactNode }) {
  return <div><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-500 sm:text-[10px] sm:tracking-[0.24em]">{icon}{eyebrow}</div><h2 className="mt-1 font-serif text-xl text-stone-100 sm:text-2xl">{title}</h2></div>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-stone-600 sm:rounded-2xl sm:px-5 sm:py-8 sm:text-sm">{text}</div>; }

function TeamChip({ active, name, stats, onClick }: { active: boolean; name: string; stats: string; onClick: () => void }) {
  return <button onClick={onClick} className={`min-w-52 rounded-2xl border p-4 text-left transition ${active ? 'border-amber-300/30 bg-amber-300/10' : 'border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05]'}`}><strong className="block text-sm text-stone-100">{name}</strong><span className="mt-1 block whitespace-nowrap text-xs text-stone-500">{stats}</span></button>;
}

function dateAtNoon(value: string) { return new Date(`${value}T12:00:00`); }
