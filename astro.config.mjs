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

  integrations: [partytown({
    config: {
      debug: false,
      logCalls: false,
      logGetters: false,
      logSetters: false,
      logImageRequests: false,
      logScriptExecution: false,
      logStackTraces: false,
      forward: [["dataLayer.push"]],
      resolveUrl: (url) => {
        const siteUrl = "https://your-proxy.url/";
        const proxyUrl = new URL(siteUrl);
        if (
          url.hostname === "googleads.g.doubleclick.net" ||
          url.hostname === "www.googleadservices.com" ||
          url.hostname === "googletagmanager.com" ||
          url.hostname === "www.googletagmanager.com" ||
          url.hostname === "region1.google-analytics.com" ||
          url.hostname === "google.com"
        ) {
          proxyUrl.searchParams.append("apiurl", url.href);
          return proxyUrl;
        }
        return url;
      },
    },
  }), sitemap()],
});