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
        includeAssets: ['/assets/aistudio/Logo_Humas_H-04_d71e1614.png'],
        manifest: {
          id: '/',
          name: 'KPI Staff Humas dan IT',
          short_name: 'KPI Humas & IT',
          description: 'Aplikasi monitoring KPI dan catatan pekerjaan harian Bagian Humas dan IT.',
          theme_color: '#1b4332',
          background_color: '#f8f9fa',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/assets/aistudio/Logo_Humas_H-04_d71e1614.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/assets/aistudio/Logo_Humas_H-04_d71e1614.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/assets/aistudio/Logo_Humas_H-04_d71e1614.png',
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
