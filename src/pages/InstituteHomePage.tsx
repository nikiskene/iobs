// src/pages/InstituteHomePage.tsx

import EntranceHero from '../components/institute/EntranceHero';
import ImpactDial from '../components/institute/ImpactDial';
import InstituteShell from '../components/institute/InstituteShell';

export default function InstituteHomePage() {
  return (
    <InstituteShell>
      <EntranceHero />

      <div
        style={{
          marginTop: 72,
          marginBottom: 96,
        }}
      >
        <ImpactDial />
      </div>
    </InstituteShell>
  );
}