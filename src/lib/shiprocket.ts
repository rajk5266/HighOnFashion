/**
 * Shiprocket API — full fulfillment flow:
 * auth → create order → assign AWB → pickup → label → invoice → manifest
 *
 * Docs: https://apidocs.shiprocket.in
 */

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

type TokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

function env(name: string, required = true): string {
  const value = import.meta.env[name];
  if ((!value || typeof value !== 'string') && required) {
    throw new Error(`Missing required env: ${name}`);
  }
  return typeof value === 'string' ? value : '';
}

function envFlag(name: string, defaultValue = true): boolean {
  const raw = import.meta.env[name];
  if (raw === undefined || raw === null || raw === '') return defaultValue;
  return !['0', 'false', 'no', 'off'].includes(String(raw).toLowerCase());
}

/** Login and cache bearer token (~10 days; refresh 1 day early). */
export async function getShiprocketToken(force = false): Promise<string> {
  const now = Date.now();
  if (!force && tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const email = env('SHIPROCKET_EMAIL');
  const password = env('SHIPROCKET_PASSWORD');

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Shiprocket auth failed (${res.status}): ${text.slice(0, 300)}`);
  }

  let data: { token?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Shiprocket auth returned invalid JSON');
  }

  if (!data.token) {
    throw new Error('Shiprocket auth response missing token');
  }

  tokenCache = {
    token: data.token,
    expiresAt: now + 9 * 24 * 60 * 60 * 1000,
  };

  return data.token;
}

async function shiprocketFetch(path: string, init: RequestInit = {}, retried = false): Promise<any> {
  const token = await getShiprocketToken(retried);
  const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (res.status === 401 && !retried) {
    return shiprocketFetch(path, init, true);
  }

  if (!res.ok) {
    throw new Error(`Shiprocket ${path} failed (${res.status}): ${text.slice(0, 500)}`);
  }

  return data;
}

export type ShiprocketAddress = {
  name?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
};

export type SnipcartOrderItem = {
  id?: string;
  name?: string;
  price?: number;
  unitPrice?: number;
  quantity?: number;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
};

export type SnipcartOrder = {
  token?: string;
  invoiceNumber?: string;
  email?: string;
  completionDate?: string;
  creationDate?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal?: number;
  grandTotal?: number;
  total?: number;
  shippingFees?: number;
  billingAddress?: ShiprocketAddress | null;
  shippingAddress?: ShiprocketAddress | null;
  billingAddressPhone?: string | null;
  shippingAddressPhone?: string | null;
  shipToBillingAddress?: boolean;
  items?: SnipcartOrderItem[];
  customFields?: Array<{ name?: string; value?: string; displayValue?: string }>;
  user?: {
    billingAddress?: ShiprocketAddress | null;
    shippingAddress?: ShiprocketAddress | null;
    billingAddressPhone?: string | null;
    shippingAddressPhone?: string | null;
  } | null;
};

export type ShiprocketAdhocPayload = ReturnType<typeof mapSnipcartToShiprocket>;

export type FulfillmentResult = {
  order_id: string;
  shiprocket_order_id: number | string | null;
  shipment_id: number | string | null;
  awb_code: string | null;
  courier_name: string | null;
  label_url: string | null;
  invoice_url: string | null;
  manifest_url: string | null;
  pickup: any;
  steps: Record<string, 'ok' | 'skipped' | 'failed'>;
  errors: string[];
};

function splitName(fullName?: string | null): { first: string; last: string } {
  const cleaned = (fullName || 'Customer').trim() || 'Customer';
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function digitsOnly(value?: string | null): string {
  return (value || '').replace(/\D/g, '');
}

function toPhone(value?: string | null, label = 'phone'): number {
  const digits = digitsOnly(value);
  const phone = digits.length > 10 ? digits.slice(-10) : digits;
  const n = parseInt(phone || '0', 10);
  if (!n || phone.length < 10) {
    throw new Error(
      `Invalid ${label} for Shiprocket: "${value || ''}". Snipcart order must include a 10-digit phone.`
    );
  }
  return n;
}

/** Resolve phone from order addresses, flat fields, custom fields, or env fallback. */
function resolvePhone(order: SnipcartOrder, billing: ShiprocketAddress, shipping: ShiprocketAddress): string {
  const customPhone = (order.customFields || []).find((f) =>
    /phone|mobile|contact/i.test(f.name || '')
  );

  const candidates = [
    billing.phone,
    shipping.phone,
    order.billingAddressPhone,
    order.shippingAddressPhone,
    order.user?.billingAddress?.phone,
    order.user?.shippingAddress?.phone,
    order.user?.billingAddressPhone,
    order.user?.shippingAddressPhone,
    customPhone?.value,
    customPhone?.displayValue,
    env('SHIPROCKET_FALLBACK_PHONE', false),
  ];

  for (const c of candidates) {
    if (c && digitsOnly(c).length >= 10) return String(c);
  }
  return '';
}

function toPincode(value?: string | null): number {
  const digits = digitsOnly(value);
  const n = parseInt(digits || '0', 10);
  if (!n || digits.length < 6) {
    throw new Error(`Invalid pincode for Shiprocket: "${value || ''}"`);
  }
  return n;
}

function countryName(codeOrName?: string | null): string {
  const v = (codeOrName || 'India').trim();
  if (/^in$/i.test(v)) return 'India';
  return v;
}

const STATE_MAP: Record<string, string> = {
  MH: 'Maharashtra',
  DL: 'Delhi',
  KA: 'Karnataka',
  TN: 'Tamil Nadu',
  GJ: 'Gujarat',
  RJ: 'Rajasthan',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
  TG: 'Telangana',
  AP: 'Andhra Pradesh',
  KL: 'Kerala',
  PB: 'Punjab',
  HR: 'Haryana',
  MP: 'Madhya Pradesh',
  BR: 'Bihar',
  OR: 'Odisha',
  OD: 'Odisha',
  AS: 'Assam',
  JH: 'Jharkhand',
  CT: 'Chhattisgarh',
  CG: 'Chhattisgarh',
  UK: 'Uttarakhand',
  UA: 'Uttarakhand',
  HP: 'Himachal Pradesh',
  GA: 'Goa',
};

function stateName(codeOrName?: string | null): string {
  const v = (codeOrName || '').trim();
  if (!v) return '';
  return STATE_MAP[v.toUpperCase()] || v;
}

function cleanAddress(value?: string | null, fallback = 'Address not provided'): string {
  const v = (value || '').trim();
  return v || fallback;
}

function formatOrderDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) {
    const now = new Date();
    return now.toISOString().slice(0, 16).replace('T', ' ');
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isCod(order: SnipcartOrder): boolean {
  const method = (order.paymentMethod || '').toLowerCase();
  return (
    method.includes('later') ||
    method.includes('deferred') ||
    method === 'cod' ||
    method.includes('cash')
  );
}

/** Map Snipcart order.content → Shiprocket create/adhoc body. */
export function mapSnipcartToShiprocket(order: SnipcartOrder) {
  const pickup = env('SHIPROCKET_PICKUP_LOCATION');
  const billing = order.billingAddress;
  if (!billing) {
    throw new Error('Snipcart order missing billingAddress');
  }

  const shipToBilling =
    order.shipToBillingAddress !== false &&
    (!order.shippingAddress || !order.shippingAddress.address1);
  const shipping = shipToBilling ? billing : order.shippingAddress || billing;

  const { first: billingFirst, last: billingLast } = splitName(billing.name);
  const { first: shippingFirst, last: shippingLast } = splitName(shipping.name);

  const items = (order.items || []).filter((i) => (i.quantity || 0) > 0);
  if (items.length === 0) {
    throw new Error('Snipcart order has no items');
  }

  const orderItems = items.map((item) => {
    const units = item.quantity || 1;
    const sellingPrice = Math.round(Number(item.unitPrice ?? item.price ?? 0));
    return {
      name: item.name || item.id || 'Item',
      sku: String(item.id || item.name || 'SKU').slice(0, 50),
      units,
      selling_price: sellingPrice,
    };
  });

  let weightKg = 0;
  let length = 0;
  let breadth = 0;
  let height = 0;

  for (const item of items) {
    const qty = item.quantity || 1;
    const itemGrams = item.weight && item.weight > 0 ? item.weight : 500;
    weightKg += (itemGrams / 1000) * qty;
    length = Math.max(length, item.length && item.length > 0 ? item.length : 10);
    breadth = Math.max(breadth, item.width && item.width > 0 ? item.width : 10);
    height += (item.height && item.height > 0 ? item.height : 5) * qty;
  }

  weightKg = Math.max(0.5, Math.round(weightKg * 1000) / 1000);
  length = Math.max(0.5, length);
  breadth = Math.max(0.5, breadth);
  height = Math.max(0.5, height);

  const phone = resolvePhone(order, billing, shipping);
  const billingPhone = toPhone(phone, 'billing phone');
  const shippingPhone = billingPhone;

  const subTotal = Math.round(
    typeof order.subtotal === 'number'
      ? order.subtotal
      : orderItems.reduce((sum, i) => sum + i.selling_price * i.units, 0)
  );

  const orderId = String(order.invoiceNumber || order.token || `HOFA-${Date.now()}`).slice(0, 50);

  return {
    order_id: orderId,
    order_date: formatOrderDate(order.completionDate || order.creationDate),
    pickup_location: pickup,
    billing_customer_name: billingFirst,
    billing_last_name: billingLast,
    billing_address: cleanAddress(billing.address1),
    billing_address_2: cleanAddress(billing.address2, ''),
    billing_city: cleanAddress(billing.city, 'Unknown'),
    billing_pincode: toPincode(billing.postalCode),
    billing_state: stateName(billing.province) || cleanAddress(billing.city, 'Maharashtra'),
    billing_country: countryName(billing.country),
    billing_email: order.email || 'orders@highonfashion.in',
    billing_phone: billingPhone,
    shipping_is_billing: shipToBilling,
    shipping_customer_name: shippingFirst,
    shipping_last_name: shippingLast,
    shipping_address: cleanAddress(shipping.address1 || billing.address1),
    shipping_address_2: cleanAddress(shipping.address2, ''),
    shipping_city: cleanAddress(shipping.city || billing.city, 'Unknown'),
    shipping_pincode: toPincode(shipping.postalCode || billing.postalCode),
    shipping_state:
      stateName(shipping.province || billing.province) ||
      cleanAddress(shipping.city || billing.city, 'Maharashtra'),
    shipping_country: countryName(shipping.country || billing.country),
    shipping_email: order.email || 'orders@highonfashion.in',
    shipping_phone: shippingPhone,
    order_items: orderItems,
    payment_method: isCod(order) ? 'COD' : 'Prepaid',
    shipping_charges: Math.round(Number(order.shippingFees || 0)),
    sub_total: subTotal,
    length,
    breadth,
    height,
    weight: weightKg,
  };
}

export async function createShiprocketOrder(payload: ShiprocketAdhocPayload) {
  const created = await shiprocketFetch('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // Shiprocket often returns HTTP 200 with an error message and no ids
  // e.g. wrong pickup location, duplicate order_id, validation issues.
  const orderId = created?.order_id ?? created?.payload?.order_id;
  const shipmentId = created?.shipment_id ?? created?.payload?.shipment_id;
  if (!orderId && !shipmentId) {
    const msg =
      created?.message ||
      created?.error ||
      (typeof created === 'string' ? created : JSON.stringify(created).slice(0, 400));
    throw new Error(`Shiprocket create order rejected: ${msg}`);
  }

  return {
    ...created,
    order_id: orderId,
    shipment_id: shipmentId,
  };
}

/** Assign courier + AWB. Uses default courier if SHIPROCKET_COURIER_ID is unset. */
export async function assignAwb(shipmentId: number | string, courierId?: number) {
  const body: Record<string, unknown> = {
    shipment_id: shipmentId,
  };
  if (courierId) body.courier_id = courierId;

  return shiprocketFetch('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Schedule courier pickup for shipment(s). */
export async function generatePickup(shipmentIds: Array<number | string>) {
  return shiprocketFetch('/courier/generate/pickup', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

/** Generate shipping label PDF URL(s). */
export async function generateLabel(shipmentIds: Array<number | string>) {
  return shiprocketFetch('/courier/generate/label', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

/** Generate invoice PDF URL(s). */
export async function generateInvoice(orderIds: Array<number | string>) {
  return shiprocketFetch('/orders/print/invoice', {
    method: 'POST',
    body: JSON.stringify({ ids: orderIds }),
  });
}

/** Generate manifest PDF URL. */
export async function generateManifest(shipmentIds: Array<number | string>) {
  return shiprocketFetch('/manifests/generate', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

/**
 * Full fulfillment pipeline for one Snipcart order.
 * Set SHIPROCKET_AUTO_FULFILL=false to only create the order (no AWB/pickup/label).
 */
export async function fulfillSnipcartOrder(order: SnipcartOrder): Promise<FulfillmentResult> {
  const payload = mapSnipcartToShiprocket(order);
  const autoFulfill = envFlag('SHIPROCKET_AUTO_FULFILL', true);

  const result: FulfillmentResult = {
    order_id: payload.order_id,
    shiprocket_order_id: null,
    shipment_id: null,
    awb_code: null,
    courier_name: null,
    label_url: null,
    invoice_url: null,
    manifest_url: null,
    pickup: null,
    steps: {
      create: 'failed',
      awb: 'skipped',
      pickup: 'skipped',
      label: 'skipped',
      invoice: 'skipped',
      manifest: 'skipped',
    },
    errors: [],
  };

  // 1. Create order
  const created = await createShiprocketOrder(payload);
  result.shiprocket_order_id = created?.order_id ?? null;
  result.shipment_id = created?.shipment_id ?? null;
  result.steps.create = 'ok';

  if (!autoFulfill) {
    return result;
  }

  if (!result.shipment_id) {
    result.errors.push('Create succeeded but no shipment_id returned — cannot assign AWB');
    return result;
  }

  const shipmentId = result.shipment_id;
  const courierRaw = env('SHIPROCKET_COURIER_ID', false);
  const courierId = courierRaw ? parseInt(courierRaw, 10) : undefined;

  // 2. Assign AWB
  try {
    const awb = await assignAwb(shipmentId, Number.isFinite(courierId) ? courierId : undefined);
    // Response shapes vary slightly across Shiprocket versions
    const response = awb?.response || awb?.data || awb;
    result.awb_code =
      response?.data?.awb_code ||
      response?.awb_code ||
      awb?.awb_code ||
      null;
    result.courier_name =
      response?.data?.courier_name ||
      response?.courier_name ||
      awb?.courier_name ||
      null;
    result.steps.awb = 'ok';
  } catch (err: any) {
    result.steps.awb = 'failed';
    result.errors.push(`AWB: ${err?.message || err}`);
    return result; // pickup/label need AWB
  }

  // 3. Request pickup
  try {
    result.pickup = await generatePickup([shipmentId]);
    result.steps.pickup = 'ok';
  } catch (err: any) {
    result.steps.pickup = 'failed';
    result.errors.push(`Pickup: ${err?.message || err}`);
  }

  // 4. Generate label
  try {
    const label = await generateLabel([shipmentId]);
    result.label_url =
      label?.label_url ||
      label?.label_url?.[0] ||
      (Array.isArray(label?.label_url) ? label.label_url[0] : null) ||
      label?.not_created?.[0] ||
      null;
    // Some responses nest under `label_url` as string, others under payload
    if (!result.label_url && typeof label === 'object') {
      const nested = label?.response?.label_url || label?.data?.label_url;
      result.label_url = Array.isArray(nested) ? nested[0] : nested || null;
    }
    result.steps.label = 'ok';
  } catch (err: any) {
    result.steps.label = 'failed';
    result.errors.push(`Label: ${err?.message || err}`);
  }

  // 5. Invoice (uses Shiprocket order id, not merchant order_id)
  if (result.shiprocket_order_id) {
    try {
      const invoice = await generateInvoice([result.shiprocket_order_id]);
      result.invoice_url = invoice?.invoice_url || null;
      result.steps.invoice = 'ok';
    } catch (err: any) {
      result.steps.invoice = 'failed';
      result.errors.push(`Invoice: ${err?.message || err}`);
    }
  }

  // 6. Manifest
  try {
    const manifest = await generateManifest([shipmentId]);
    result.manifest_url = manifest?.manifest_url || null;
    result.steps.manifest = 'ok';
  } catch (err: any) {
    result.steps.manifest = 'failed';
    result.errors.push(`Manifest: ${err?.message || err}`);
  }

  return result;
}
