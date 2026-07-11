// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import partytown from '@astrojs/partytown';
import node from '@astrojs/node';


// https://astro.build/config
export default defineConfig({
  // API routes in src/pages/api/ use `export const prerender = false` to opt into
  // server-side rendering, while all other pages remain statically generated.
  // The node adapter enables this in both local dev and Vercel deployment.
  adapter: node({ mode: 'middleware' }),

  vite: {
    plugins: [tailwindcss()]
  },

  server: {
    allowedHosts: [
      'vessel-tricky-brunette.ngrok-free.dev', // Your specific ngrok domain
      '.ngrok-free.dev'                        // Allows any future ngrok domains you generate
    ]
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