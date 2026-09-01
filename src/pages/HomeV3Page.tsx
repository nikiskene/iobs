import HomeV3 from '../components/home-v3/HomeV3';
import InstituteShell from '../components/institute/InstituteShell';
import { ScaleWorldsProvider } from '../providers/ScaleWorldsProvider';

export default function HomeV3Page() {
  return <ScaleWorldsProvider><InstituteShell><HomeV3 /></InstituteShell></ScaleWorldsProvider>;
}
