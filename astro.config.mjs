// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    partytown({
      config: {
        debug: false,
        logCalls: false,
        logGetters: false,
        logSetters: false,
        logImageRequests: false,
        logScriptExecution: false,
        logStackTraces: false,
        forward: [
          ["dataLayer.push"],
        ],
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
    }),
  ],
});