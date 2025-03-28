import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx'
import './index.css'
import './firebaseConfig.ts'

const updateSW = registerSW({
  onNeedRefresh() {
    // Optional: prompt user to update app
    console.log('New content is available; please refresh.');
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
