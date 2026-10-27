import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['/assets/aistudio/Logo_Humas_H-04_0242de0b.png'],
        manifest: {
          id: '/',
          name: 'KPI Monitoring Humas & IT - Pesantren Parabek',
          short_name: 'KPI Parabek',
          description: 'Aplikasi monitoring KPI dan catatan pekerjaan harian Bagian Humas dan IT Pondok Pesantren Sumatera Thawalib Parabek.',
          theme_color: '#1b4332',
          background_color: '#f8f9fa',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/assets/aistudio/Logo_Humas_H-04_0242de0b.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/assets/aistudio/Logo_Humas_H-04_0242de0b.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/assets/aistudio/Logo_Humas_H-04_0242de0b.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
