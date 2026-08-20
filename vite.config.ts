import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? (process.env.VITE_BASE_PATH ?? '/first-math-game/') : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'icon.svg',
        'collectibles/sunny-sticker.webp',
        'collectibles/moonbeam-sticker.webp',
        'collectibles/pepper-sticker.webp',
      ],
      manifest: {
        id: './',
        name: 'First Math Game',
        short_name: 'Math Game',
        description: 'Fast, friendly arithmetic practice with collectible companions.',
        theme_color: '#5c3df5',
        background_color: '#fff9f0',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/collectibles/') && /\.(?:png|webp|avif)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'number-nook-sticker-art-v1',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
}));
