import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import App from './App.tsx';
import { AppUiProvider } from './context/AppUiContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { convex } from './lib/convex.ts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <ToastProvider>
        <AuthProvider>
          <AppUiProvider>
            <App />
          </AppUiProvider>
        </AuthProvider>
      </ToastProvider>
    </ConvexProvider>
  </StrictMode>
);
