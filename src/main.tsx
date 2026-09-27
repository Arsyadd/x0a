import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DynamicAuthProvider } from './auth/dynamicAuth.tsx';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DynamicAuthProvider>
      <App />
    </DynamicAuthProvider>
  </StrictMode>,
);

