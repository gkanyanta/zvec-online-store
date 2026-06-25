import type { Metadata } from 'next';
import { sql, toProduct, ensureSchema } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    await ensureSchema();
    const rows = await sql`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) return { title: 'Product Not Found | ZVEC Online Store' };
    const product = toProduct(rows[0]);
    const description = product.description.slice(0, 155);
    const imageUrl = product.image.startsWith('data:') ? undefined : product.image;
    return {
      title: `${product.name} | ZVEC Online Store`,
      description,
      openGraph: {
        title: product.name,
        description,
        type: 'website',
        siteName: 'ZVEC Online Store',
        ...(imageUrl ? { images: [{ url: imageUrl, width: 800, height: 800 }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    };
  } catch {
    return { title: 'ZVEC Online Store' };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
