/**
 * src/pages/api/payment-methods.ts
 *
 * Snipcart calls this (POST) to discover available custom payment methods.
 * We validate the publicToken then return Razorpay as the payment option.
 *
 * Snipcart Dashboard → Payment Gateway → Custom Gateway
 * → Payment Methods URL: https://your-public-host/api/payment-methods
 */

export const prerender = false;

import type { APIRoute } from 'astro';

function publicOrigin(request: Request, astroUrl: URL): string {
  const envSite = (import.meta.env.SITE_URL || import.meta.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  if (envSite) return envSite;

  const headers = request.headers;
  const forwardedProto =
    headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    (astroUrl.protocol === 'https:' ? 'https' : 'http');
  const forwardedHost =
    headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    headers.get('host') ||
    astroUrl.host;

  let origin = `${forwardedProto}://${forwardedHost}`;
  if (origin.startsWith('http://') && !origin.includes('localhost')) {
    origin = origin.replace(/^http:\/\//, 'https://');
  }
  return origin;
}

export const POST: APIRoute = async ({ request, url: astroUrl }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  let body: { publicToken?: string; PublicToken?: string } = {};
  try {
    body = await request.json();
  } catch {
    console.error('[payment-methods] invalid JSON body');
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const publicToken = body.publicToken || body.PublicToken;

  if (!publicToken) {
    console.error('[payment-methods] missing publicToken', Object.keys(body));
    return new Response(JSON.stringify({ error: 'Missing publicToken' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const validationRes = await fetch(
      `https://payment.snipcart.com/api/public/custom-payment-gateway/validate?publicToken=${encodeURIComponent(publicToken)}`
    );

    if (!validationRes.ok) {
      const text = await validationRes.text().catch(() => '');
      console.error('[payment-methods] Snipcart validate failed', validationRes.status, text.slice(0, 200));
      return new Response(JSON.stringify({ error: 'Invalid or expired publicToken' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
  } catch (err) {
    console.error('[payment-methods] validate network error', err);
    return new Response(JSON.stringify({ error: 'Failed to validate with Snipcart' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const siteUrl = publicOrigin(request, astroUrl);
  console.log('[payment-methods] ok, checkout via', siteUrl);

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
