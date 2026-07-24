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