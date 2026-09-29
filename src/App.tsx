// src/App.tsx

import { Suspense } from 'react';
import { NominationModeProvider } from './providers/NominationModeProvider';
import { BrowserRouter } from 'react-router-dom';
import { ImpactScaleProvider } from './providers/ImpactScaleProvider';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './routes/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ImpactScaleProvider><NominationModeProvider>
        <Suspense fallback={<div className="route-loader" aria-label="Loading" />}>
          <AppRoutes />
        </Suspense>
      </NominationModeProvider></ImpactScaleProvider>
    </BrowserRouter>
  );
}
