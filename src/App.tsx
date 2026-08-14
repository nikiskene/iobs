// src/App.tsx

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ImpactScaleProvider } from './providers/ImpactScaleProvider';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ImpactScaleProvider>
          <AppRoutes />
        </ImpactScaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}