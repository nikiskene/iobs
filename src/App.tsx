// src/App.tsx

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ImpactScaleProvider } from './providers/ImpactScaleProvider';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './routes/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ImpactScaleProvider>
          <AppRoutes />
        </ImpactScaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
