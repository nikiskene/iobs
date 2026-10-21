import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './hooks/useAuth';
import './index.css';
import { LocaleProvider } from './providers/LocaleProvider';
import { AwardSiteContentProvider } from './providers/AwardSiteContentProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LocaleProvider><AwardSiteContentProvider><App /></AwardSiteContentProvider></LocaleProvider>
    </AuthProvider>
  </StrictMode>
);
