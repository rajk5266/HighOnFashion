// src/utils/image.js

export function imageUrl(path) {
  if (!path) {
    return "/placeholder.jpg";
  }

  // Allow external URLs
  if (path.startsWith("http")) {
    return path;
  }

  const base = import.meta.env.PUBLIC_IMAGE_BASE_URL || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalizedPath}`;
}

/**
 * Absolute URL for images that live on this site (e.g. /images/...).
 * Used as the source for the wsrv.nl optimizer.
 */
function absoluteSiteUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const site =
    (typeof import.meta.env.SITE === "string" && import.meta.env.SITE) ||
    "https://highonfashion.in";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${site.replace(/\/$/, "")}${normalizedPath}`;
}

/**
 * Optimized WebP via wsrv.nl — resize to display width instead of shipping
 * multi‑MB originals (homepage collection cards were 1–3MB each).
 */
export function optimizedImage(path, { w = 800, q = 75 } = {}) {
  if (!path) return "/placeholder.jpg";

  // Already an optimizer URL
  if (path.includes("wsrv.nl")) return path;

  // Prefer CDN base when set; fall back to site origin for /images in public/
  let source = path.startsWith("http") ? path : imageUrl(path);
  if (!source.startsWith("http")) {
    source = absoluteSiteUrl(source);
  }
  // Local /images/* live on the main site, not always on the product CDN
  if (
    path.startsWith("/images/") &&
    import.meta.env.PUBLIC_IMAGE_BASE_URL &&
    source.includes("static.")
  ) {
    source = absoluteSiteUrl(path);
  }

  return `https://wsrv.nl/?url=${encodeURIComponent(source)}&w=${w}&q=${q}&output=webp`;
}
