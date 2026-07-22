// src/pages/admin/identity/overviewParts.tsx
import { Activity } from 'lucide-react';
import type { IdentityScanRun } from '../../../lib/identity/types';
import { Badge } from './identityUi';

export function ScanHistory({
  history,
  lastScan,
}: {
  history: IdentityScanRun[];
  lastScan: IdentityScanRun | null;
}) {
  if (history.length === 0 && !lastScan) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Recent scans
        </h2>
        <p className="text-sm text-zinc-500">No scans have been run yet.</p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Recent scans
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Mode</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Documents</th>
              <th className="py-2 pr-4 font-medium">Candidates</th>
              <th className="py-2 font-medium">Approved</th>
            </tr>
          </thead>
          <tbody>
            {history.map((run) => (
              <tr key={run.id} className="border-b border-white/5">
                <td className="py-3 pr-4 text-zinc-300">{formatDate(run.created_at)}</td>
                <td className="py-3 pr-4 text-zinc-400">{run.mode}</td>
                <td className="py-3 pr-4">
                  <StatusBadge status={run.status} />
                </td>
                <td className="py-3 pr-4 text-zinc-400">{run.counts?.documents_found ?? '—'}</td>
                <td className="py-3 pr-4 text-zinc-400">{run.counts?.candidate_signals ?? '—'}</td>
                <td className="py-3 text-zinc-400">{run.counts?.approved_signals ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    completed: 'success',
    running: 'info',
    pending: 'warning',
    failed: 'error',
  };
  return <Badge tone={map[status] ?? 'neutral'}>{status}</Badge>;
}

export function SchedulingNote() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-zinc-400" />
        <h2 className="text-sm font-semibold text-white">Scheduling</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Scans are currently <span className="text-white">manual until scheduled</span>. The target
        is a daily run at 06:00 Europe/Vienna via Supabase cron. To activate, set the
        <code className="mx-1 rounded bg-white/5 px-1 text-zinc-300">OPENAI_API_KEY</code>
        secret and enable the scheduled invocation. No automation is active yet.
      </p>
    </div>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
