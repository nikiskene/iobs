// src/App.tsx

import { BrowserRouter } from 'react-router-dom';
import { ImpactScaleProvider } from './providers/ImpactScaleProvider';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ImpactScaleProvider>
        <AppRoutes />
      </ImpactScaleProvider>
    </BrowserRouter>
  );
}