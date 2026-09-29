import { Link, Navigate } from 'react-router-dom';
import { useNominationMode } from '../../providers/NominationModeProvider';
import NominatePage from './NominatePage';
export default function NominationEntry({ awardOnly = false }: { awardOnly?: boolean }) {
  const { mode, error, refresh } = useNominationMode();
  if (error) return <section className="ibs-section"><p role="alert">{error}</p><button onClick={() => void refresh()}>Try again</button></section>;
  if (!mode) return <div className="route-loader" aria-label="Loading nomination settings" />;
  if (mode === 'award') return <NominatePage />;
  if (!awardOnly) return <Navigate to="/acknowledgement/nominate" replace />;
  return <section className="ibs-section"><h1>Award nominations are closed.</h1><p>You can currently nominate a company for Beautiful Success acknowledgement.</p><Link className="award-button" to="/acknowledgement/nominate">Nominate a company</Link></section>;
}
