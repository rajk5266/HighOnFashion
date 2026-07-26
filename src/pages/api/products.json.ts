import type { APIRoute } from 'astro';
import { products } from '../../data/products';

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '8', 10);

  // Optional: Read filters from query params if you want client-side filtering support
  const category = url.searchParams.get('category');
  const size = url.searchParams.get('size');
  const brand = url.searchParams.get('brand');

  let filtered = [...products];

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (size) {
    filtered = filtered.filter((p) => p.taggedSize === size);
  }
  if (brand) {
    filtered = filtered.filter((p) => p.brand === brand);
  }

  const start = (page - 1) * limit;
  const paginatedProducts = filtered.slice(start, start + limit);
  const hasMore = start + limit < filtered.length;

  return new Response(
    JSON.stringify({
      products: paginatedProducts,
      hasMore,
      total: filtered.length,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};