// src/pages/admin/identity/IdentityOverview.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, RefreshCw, Telescope } from 'lucide-react';
import {
  fetchLastScan,
  fetchOverviewCounts,
  fetchScanHistory,
  triggerScan,
} from '../../../lib/identity/identityApi';
import type { IdentityScanRun, ScanRunCounts } from '../../../lib/identity/types';
import { ErrorBanner, PageHeader, Spinner, StatCard } from './identityUi';
import { ScanHistory, SchedulingNote, formatDate } from './overviewParts';
import ScanFunnel from './ScanFunnel';

export default function IdentityOverview() {
  const [counts, setCounts] = useState<ScanRunCounts | null>(null);
  const [lastScan, setLastScan] = useState<IdentityScanRun | null>(null);
  const [history, setHistory] = useState<IdentityScanRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, last, hist] = await Promise.all([
        fetchOverviewCounts(),
        fetchLastScan(),
        fetchScanHistory(5),
      ]);
      setCounts(c);
      setLastScan(last);
      setHistory(hist);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load overview.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleScan() {
    setScanning(true);
    setScanMessage(null);
    setError(null);
    try {
      const result = await triggerScan('manual');
      setScanMessage(result.message);
      if (!result.ok) setError(result.message);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed.');
    } finally {
      setScanning(false);
    }
  }

  if (loading) return <Spinner label="Loading identity overview…" />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="W01 · Admin only"
        title="Identity Engine"
        description="Research-first identity signal pipeline. Discovery, extraction, and human review for Fortune 50, G7, and BRICS entities."
      />

      {error && <ErrorBanner message={error} />}
      {scanMessage && !error && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-300">{scanMessage}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Running scan…' : 'Run scan'}
        </button>
        <Link
          to="/admin/identity/review"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <ListChecks className="h-4 w-4" />
          Review queue
        </Link>
        <Link
          to="/admin/identity/method"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <Telescope className="h-4 w-4" />
          Method
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Last scan" value={lastScan ? formatDate(lastScan.created_at) : '—'} />
        <StatCard label="Documents found" value={counts?.documents_found ?? 0} />
        <StatCard label="Story clusters" value={counts?.clusters ?? 0} />
        <StatCard label="Candidate signals" value={counts?.candidate_signals ?? 0} />
        <StatCard label="Pending review" value={counts?.pending_review ?? 0} accent />
        <StatCard label="Approved signals" value={counts?.approved_signals ?? 0} />
      </div>

      <ScanFunnel run={lastScan} totals={counts} />
      <ScanHistory history={history} lastScan={lastScan} />
      <SchedulingNote />
    </div>
  );
}
