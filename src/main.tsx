import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker only in production environment to avoid Vite dev HMR SW errors
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  try {
    registerSW({ immediate: true });
  } catch (err) {
    console.info('PWA Service Worker registration notice:', err);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
