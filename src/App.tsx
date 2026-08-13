// src/App.tsx

import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ImpactScaleProvider } from './providers/ImpactScaleProvider';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ImpactScaleProvider>
        <Suspense fallback={<div className="route-loader" aria-label="Loading" />}>
          <AppRoutes />
        </Suspense>
      </ImpactScaleProvider>
    </BrowserRouter>
  );
}
