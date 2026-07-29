import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
  // './' => l'app fonctionne aussi bien a la racine que dans un sous-dossier
  base: './',
  plugins: [
    react(),
    VitePWA({
      // 'prompt' = on demande a l'utilisateur avant de basculer sur la nouvelle version
      registerType: 'prompt',
      includeAssets: ['icon-192.png', 'icon-512.png', 'logo.png'],
      manifest: {
        name: 'Fresitalocks CRM',
        short_name: 'Fresitalocks',
        description: 'CRM Pro pour locktician - Fresitalocks',
        start_url: '.',
        scope: './',
        display: 'standalone',
        background_color: '#FBF7F2',
        theme_color: '#5A2070',
        orientation: 'portrait',
        lang: 'fr',
        icons: [
          {src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
          {src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
        ],
      },
      workbox: {
        // Tout l'app shell est precache a l'install du SW -> offline des le 1er lancement
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
  build: {outDir: 'dist', sourcemap: false},
});
