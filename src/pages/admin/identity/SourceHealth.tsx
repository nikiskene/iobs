// src/pages/admin/identity/SourceHealth.tsx
import type { IdentitySource } from '../../../lib/identity/types';
import { Badge } from './identityUi';

export function SourceHealth({ source }: { source: IdentitySource }) {
  if (!source.automation_allowed) return <Badge tone="neutral">Not automated</Badge>;
  if (!source.last_checked_at) return <Badge tone="warning">Awaiting first run</Badge>;
  if (source.consecutive_failures > 0) {
    return (
      <span title={source.last_error ?? 'The latest source check failed.'}>
        <Badge tone="warning">{source.consecutive_failures} failed</Badge>
      </span>
    );
  }
  return (
    <span title={`Latest fetch returned ${source.last_item_count} items.`}>
      <Badge tone="success">Healthy</Badge>
    </span>
  );
}

export function RightsBadge({ status }: { status: IdentitySource['rights_status'] }) {
  if (status === 'allowed' || status === 'licensed') {
    return <Badge tone="success">{status}</Badge>;
  }
  if (status === 'metadata_only') return <Badge tone="info">metadata only</Badge>;
  return <Badge tone="warning">review</Badge>;
}
