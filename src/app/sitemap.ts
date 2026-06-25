import { MetadataRoute } from 'next';
import { sql, ensureSchema } from '@/lib/db';

const BASE = 'https://store-five-kohl.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Record<string, unknown>[] = [];
  try {
    await ensureSchema();
    products = await sql`SELECT slug, updated_at FROM products ORDER BY name`;
  } catch {
    // DB unavailable at build time — return static pages only
  }

  const staticPages: MetadataRoute.Sitemap = [
    '/', '/products', '/packages', '/wishlist',
    '/faq', '/about', '/contact', '/returns', '/privacy', '/terms', '/track-order',
    '/account', '/account/login', '/account/register',
  ].map((path) => ({ url: `${BASE}${path}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: path === '/' ? 1 : 0.7 }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at as string) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...productPages];
}
