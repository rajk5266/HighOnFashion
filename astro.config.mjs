// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel'; 

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({

    site: 'https://highonfashion.in',

  // 3. Apply the Vercel Serverless Adapter instead of the Node middleware
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),



  vite: {
    plugins: [tailwindcss()]
  },

  server: {
    allowedHosts: [
      'vessel-tricky-brunette.ngrok-free.dev',
      '.ngrok-free.dev'
    ]
  },

  integrations: [
    // Partytown kept for optional worker offloading, but do NOT proxy Google
    // through a placeholder URL — that breaks GTM/GA4.
    partytown({
      config: {
        debug: false,
        forward: ["dataLayer.push"],
      },
    }),
    sitemap(),
  ],
});