/**
 * Build an absolute public URL that Snipcart (and other external services) can crawl.
 * Behind ngrok/proxies Astro.url.origin is often http://localhost or http://ngrok-host —
 * Snipcart domains are configured as https, so we must force the public origin.
 */
export function publicUrl(path: string, astroUrl: URL, request?: Request): string {
  const envSite = (import.meta.env.SITE_URL || import.meta.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');

  let origin = envSite;
  if (!origin && request) {
    const proto =
      request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
      astroUrl.protocol.replace(':', '');
    const host =
      request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
      request.headers.get('host') ||
      astroUrl.host;
    origin = `${proto}://${host}`;
  }
  if (!origin) {
    origin = astroUrl.origin;
  }

  // Snipcart store domains are HTTPS; never hand them an http product URL.
  if (origin.startsWith('http://') && !origin.includes('localhost')) {
    origin = origin.replace(/^http:\/\//, 'https://');
  }

  return new URL(path.startsWith('/') ? path : `/${path}`, `${origin}/`).href;
}
