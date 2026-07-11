/**
 * src/pages/api/payment-methods.ts
 *
 * Astro server endpoint — works with `npm run dev` AND Vercel production.
 *
 * Snipcart calls this (POST) to discover available custom payment methods.
 * We validate the publicToken then return Razorpay as the payment option.
 *
 * Snipcart Dashboard → Payment Gateway → Custom Gateway
 * → Payment Methods URL: https://your-domain.com/api/payment-methods
 */

export const prerender = false; // Server-rendered (not static)

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, url: astroUrl }) => {
  // ── CORS headers ─────────────────────────────────────────────────────────
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { publicToken?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { publicToken } = body;

  if (!publicToken) {
    return new Response(JSON.stringify({ error: 'Missing publicToken' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // ── Validate token with Snipcart ──────────────────────────────────────────
  try {
    const validationRes = await fetch(
      `https://payment.snipcart.com/api/public/custom-payment-gateway/validate?publicToken=${encodeURIComponent(publicToken)}`
    );

    if (!validationRes.ok) {
      console.error('Snipcart token validation failed:', validationRes.status);
      return new Response(JSON.stringify({ error: 'Invalid or expired publicToken' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
  } catch (err) {
    console.error('Snipcart validation network error:', err);
    return new Response(JSON.stringify({ error: 'Failed to validate with Snipcart' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // ── Build checkout URL ────────────────────────────────────────────────────
  // Use SITE_URL env var if set (production/custom domain), otherwise derive from request
  const siteUrl =
    import.meta.env.SITE_URL ||
    `${astroUrl.protocol}//${astroUrl.host}`;

  return new Response(
    JSON.stringify([
      {
        id: 'razorpay',
        name: 'Razorpay',
        checkoutUrl: `${siteUrl}/checkout`,
        iconUrl: `${siteUrl}/razorpay-icon.svg`,
      },
    ]),
    { status: 200, headers: corsHeaders }
  );
};

// Handle OPTIONS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
