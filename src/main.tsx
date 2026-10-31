import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker only in production environment via dynamic import
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const pwaModule = 'virtual:pwa-register';
  import(/* @vite-ignore */ pwaModule)
    .then((mod: any) => {
      if (mod && mod.registerSW) {
        mod.registerSW({ immediate: true });
      }
    })
    .catch((err) => {
      console.info('PWA Service Worker registration notice:', err);
    });
}

createRoot(document.getElementById('root')!).render(<App />);
