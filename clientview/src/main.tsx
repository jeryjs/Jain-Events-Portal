import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx'
import './index.css'
import './firebaseConfig.ts'

const updateSW = registerSW({
  onRegisterError(error) {
    console.error('SW registration failed: ', error);
  },
  onRegisteredSW(swUrl, r) {
    console.log(`Service worker registered at ${swUrl}`);
  },
  onNeedRefresh() {
    const shouldReload = window.confirm('A new version is available. Reload now?');
    if (shouldReload) {
      void updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
