/**
 * src/pages/api/create-razorpay-order.ts
 *
 * Astro server endpoint — works with `npm run dev` AND Vercel production.
 *
 * Called from /checkout page to:
 *  1. Fetch order session from Snipcart (gets total, customer info, etc.)
 *  2. Create a Razorpay order server-side (keeps secret key off the browser)
 *  3. Return order details + public Razorpay key to the frontend
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import Razorpay from 'razorpay';

export const POST: APIRoute = async ({ request }) => {
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

  // ── Fetch Snipcart payment session ────────────────────────────────────────
  let session: any;
  try {
    const sessionRes = await fetch(
      `https://payment.snipcart.com/api/public/custom-payment-gateway/payment-session?publicToken=${encodeURIComponent(publicToken)}`
    );

    if (!sessionRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch order session from Snipcart' }),
        { status: 401, headers: corsHeaders }
      );
    }

    session = await sessionRes.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Network error fetching Snipcart session' }),
      { status: 500, headers: corsHeaders }
    );
  }

  const { invoice } = session;

  if (!invoice || typeof invoice.amount !== 'number') {
    return new Response(
      JSON.stringify({ error: 'Invalid session: missing invoice amount' }),
      { status: 422, headers: corsHeaders }
    );
  }

  // ── Convert amount to paise (₹1 = 100 paise, Razorpay smallest unit) ─────
  const amountInPaise = Math.round(invoice.amount * 100);

  // receipt must be ≤ 40 chars (Razorpay limit)
  const receipt = (invoice.token || publicToken).substring(0, 40);

  // ── Create Razorpay order ─────────────────────────────────────────────────
  let razorpayOrder: any;
  try {
    const razorpay = new Razorpay({
      key_id: import.meta.env.RAZORPAY_KEY_ID,
      key_secret: import.meta.env.RAZORPAY_KEY_SECRET,
    });

    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        snipcart_public_token: publicToken.substring(0, 512),
        customer_email: invoice.email || '',
      },
    });
  } catch (err: any) {
    const detail =
      err?.error?.description ||
      err?.error?.reason ||
      err?.message ||
      'Failed to create Razorpay order';
    console.error('[create-razorpay-order]', detail, err?.error || err);
    return new Response(
      JSON.stringify({ error: detail }),
      { status: 500, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({
      razorpay_order_id: razorpayOrder.id,
      razorpay_key_id: import.meta.env.RAZORPAY_KEY_ID, // public key — safe to expose
      amount: razorpayOrder.amount,        // in paise
      amount_display: invoice.amount,      // in rupees, for display
      currency: razorpayOrder.currency,
      customer: {
        name: invoice.billingAddress
          ? `${invoice.billingAddress.name || ''}`.trim()
          : '',
        email: invoice.email || '',
        phone: invoice.billingAddress?.phone || '',
      },
      returnUrl: session.paymentAuthorizationRedirectUrl || '',
    }),
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
