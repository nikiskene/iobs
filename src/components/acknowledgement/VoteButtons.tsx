import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { Heart, ThumbsDown } from 'lucide-react';
import type { AcknowledgementNomination } from '../../lib/acknowledgements';

export default function VoteButtons({ item, busy, onVote }: {
  item: AcknowledgementNomination; busy: string | null; onVote: (direction: number) => void;
}) {
  const { translate: tr } = useAwardSiteContent();
  const showTotals = Number(item.upvotes) + Number(item.downvotes) >= 50;
  return <div className="ack-votes" aria-label={`Votes for ${item.company_name}`}>
    <span className="ack-vote-label">{tr("Community vote")}</span>
    <button aria-label={`Upvote ${item.company_name}${showTotals ? `: ${item.upvotes} votes` : ''}`} aria-pressed={item.my_vote === 1} disabled={!!busy} onClick={() => onVote(1)}>
      <Heart size={18} fill={item.my_vote === 1 ? 'currentColor' : 'none'} /><span>{tr("Support")}</span>{showTotals && <span>{item.upvotes}</span>}
    </button>
    <button aria-label={`Downvote ${item.company_name}${showTotals ? `: ${item.downvotes} votes` : ''}`} aria-pressed={item.my_vote === -1} disabled={!!busy} onClick={() => onVote(-1)}>
      <ThumbsDown size={18} fill={item.my_vote === -1 ? 'currentColor' : 'none'} /><span>{tr("Not yet")}</span>{showTotals && <span>{item.downvotes}</span>}
    </button>
    {busy === item.id && <span role="status">{tr("Saving…")}</span>}
  </div>;
}
