/**
 * src/pages/api/verify-payment.ts
 *
 * Astro server endpoint — works with `npm run dev` AND Vercel production.
 *
 * Called after the Razorpay modal succeeds. Critical security step:
 *  1. Verifies Razorpay HMAC-SHA256 signature (prevents payment tampering)
 *  2. Notifies Snipcart's private API that the order is paid
 *  3. Returns Snipcart's redirect URL for the frontend to navigate back
 *
 * RAZORPAY_KEY_SECRET and SNIPCART_SECRET_API_KEY stay server-side only.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    publicToken?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, publicToken } = body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !publicToken) {
    return new Response(
      JSON.stringify({
        error: 'Missing required fields: razorpay_payment_id, razorpay_order_id, razorpay_signature, publicToken',
      }),
      { status: 400, headers: corsHeaders }
    );
  }

  // ── Step 1: Verify Razorpay Signature ─────────────────────────────────────
  // Razorpay computes: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  // We independently compute the same value and compare. Match = authentic payment.
  const expectedSignature = crypto
    .createHmac('sha256', import.meta.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return new Response(
      JSON.stringify({ error: 'Payment signature verification failed' }),
      { status: 400, headers: corsHeaders }
    );
  }


  // ── Step 2: Notify Snipcart that order is paid ───────────────────────────
  //
  // ⚠️  API KEY: Must be the Payment Gateway API key from:
  //    Snipcart Dashboard → Store configuration → Payment gateway → Custom gateway → API keys
  //    This is NOT the same as Account → API Keys (general secret key).
  //
  const paymentApiKey = import.meta.env.SNIPCART_PAYMENT_API_KEY || import.meta.env.SNIPCART_SECRET_API_KEY;

  if (!paymentApiKey) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: missing Snipcart payment API key' }),
      { status: 500, headers: corsHeaders }
    );
  }

  // ── Extract paymentSessionId UUID from the JWT publicToken ────────────────
  // The Snipcart docs show paymentSessionId should be a UUID like:
  //   "5e921d3b-8756-4fd0-87e9-c72f946535ed"
  // NOT the full JWT string. The UUID lives in the JWT payload's paymentSessionId field.
  let paymentSessionId: string;
  try {
    const jwtPayload = JSON.parse(
      Buffer.from(publicToken.split('.')[1], 'base64url').toString('utf-8')
    );
    paymentSessionId = jwtPayload.paymentSessionId || publicToken;
  } catch {
    // Fallback: use full token if JWT decode fails
    paymentSessionId = publicToken;
  }

  const snipcartAuthHeader = `Bearer ${paymentApiKey}`;

  const snipcartPayload = {
    paymentSessionId,
    state: 'processed',
    transactionId: razorpay_payment_id,
    instructionsData: null,
  };

  let snipcartData: any;
  try {
    const snipcartRes = await fetch(
      'https://payment.snipcart.com/api/private/custom-payment-gateway/payment',
      {
        method: 'POST',
        headers: {
          Authorization: snipcartAuthHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(snipcartPayload),
      }
    );

    const responseText = await snipcartRes.text();

    if (!snipcartRes.ok) {
      return new Response(
        JSON.stringify({
          error: 'Payment captured by Razorpay but Snipcart could not be notified.',
          snipcart_status: snipcartRes.status,
          snipcart_error: responseText,
          razorpay_payment_id,
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    try {
      snipcartData = JSON.parse(responseText);
    } catch {
      snipcartData = {};
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Network error notifying Snipcart' }),
      { status: 500, headers: corsHeaders }
    );
  }


  // ── Step 3: Return redirect URL to the frontend ───────────────────────────
  return new Response(
    JSON.stringify({
      success: true,
      transactionId: razorpay_payment_id,
      returnUrl: snipcartData.returnUrl || snipcartData.redirectUrl || '',
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
