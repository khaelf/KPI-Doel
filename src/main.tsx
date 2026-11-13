import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register PWA service worker for both development preview and production
registerSW({
  immediate: true,
  onRegisterError(error) {
    console.info('PWA Service Worker registration notice:', error);
  },
});

createRoot(document.getElementById('root')!).render(<App />);
