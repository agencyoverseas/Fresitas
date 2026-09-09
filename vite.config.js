import {defineConfig} from 'vite';

/* Identite de la compilation.
   Sans elle, un push qui ne change pas le code compile produit un
   paquet identique : le service worker ne bouge pas et la banniere
   "Nouvelle version" ne s'affiche jamais. Avec elle, chaque mise en
   ligne est unique, donc chaque push declenche la banniere.
   Sur Vercel on prend le numero du commit, sinon l'horodatage. */
const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '';
const VERSION = sha ? sha.slice(0, 7) : 'local-' + Date.now().toString(36);
const DATE_BUILD = new Date().toISOString();
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
        name: 'Fresitas — gestion de salon',
        short_name: 'Fresitas',
        description: 'CRM Pro pour locktician - Fresitalocks',
        start_url: '.',
        scope: './',
        display: 'standalone',
        background_color: '#FBF7F2',
        theme_color: '#5A2070',
        // plus de verrou portrait : l'app tourne aussi sur PC et tablette
        orientation: 'any',
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
  define: {
    __VERSION__: JSON.stringify(VERSION),
    __DATE_BUILD__: JSON.stringify(DATE_BUILD),
  },
  build: {outDir: 'dist', sourcemap: false},
});
