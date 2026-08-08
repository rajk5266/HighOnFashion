/**
 * src/pages/api/snipcart-webhook.ts
 *
 * Snipcart → Shiprocket bridge (full fulfillment).
 *
 * Snipcart Dashboard → Store Configurations → Webhooks:
 *   https://your-domain/api/snipcart-webhook
 *
 * On order.completed:
 *   create order → assign AWB → pickup → label → invoice → manifest
 * Set SHIPROCKET_AUTO_FULFILL=false to only create the order.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { fulfillSnipcartOrder, type SnipcartOrder } from '../../lib/shiprocket';

async function validateSnipcartRequest(requestToken: string | null): Promise<boolean> {
  if (!requestToken) return false;

  const secret = import.meta.env.SNIPCART_SECRET_API_KEY;
  if (!secret) {
    console.warn('[snipcart-webhook] No SNIPCART_SECRET_API_KEY — skipping request token validation');
    return true;
  }

  const auth = Buffer.from(`${secret}:`).toString('base64');
  const res = await fetch(
    `https://app.snipcart.com/api/requestvalidation/${encodeURIComponent(requestToken)}`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    }
  );

  return res.ok;
}

export const POST: APIRoute = async ({ request }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Snipcart-RequestToken',
    'Content-Type': 'application/json',
  };

  const requestToken = request.headers.get('X-Snipcart-RequestToken');
  try {
    const valid = await validateSnipcartRequest(requestToken);
    if (!valid) {
      console.error('[snipcart-webhook] invalid X-Snipcart-RequestToken');
      return new Response(JSON.stringify({ error: 'Invalid request token' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
  } catch (err) {
    console.error('[snipcart-webhook] token validation error', err);
    return new Response(JSON.stringify({ error: 'Token validation failed' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  let body: { eventName?: string; mode?: string; content?: SnipcartOrder } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const eventName = body.eventName || '';
  console.log('[snipcart-webhook] event', eventName, 'mode', body.mode);

  if (eventName !== 'order.completed') {
    return new Response(JSON.stringify({ ok: true, ignored: eventName }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  const order = body.content;
  if (!order) {
    return new Response(JSON.stringify({ error: 'Missing content' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    console.log(
      '[snipcart-webhook] fulfilling',
      order.invoiceNumber || order.token,
      order.email
    );

    const result = await fulfillSnipcartOrder(order);

    console.log('[snipcart-webhook] done', JSON.stringify(result));

    return new Response(
      JSON.stringify({
        ok: result.errors.length === 0,
        ...result,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[snipcart-webhook] failed', err?.message || err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: err?.message || 'Shiprocket fulfillment failed',
      }),
      { status: 200, headers: corsHeaders }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Snipcart-RequestToken',
    },
  });
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      endpoint: '/api/snipcart-webhook',
      flow: [
        'order.completed',
        'create adhoc order',
        'assign AWB',
        'generate pickup',
        'generate label',
        'print invoice',
        'generate manifest',
      ],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
