import { neon } from '@neondatabase/serverless';
import { products as seedProducts } from './data';
import type { Product } from '@/types';

export const sql = neon(process.env.DATABASE_URL!);

export function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    category: row.category as string,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    image: row.image as string,
    description: row.description as string,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    inStock: row.in_stock as boolean,
    badge: row.badge ? (row.badge as string) : undefined,
  };
}

let ready = false;

export async function ensureSchema(): Promise<void> {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id             TEXT    PRIMARY KEY,
      name           TEXT    NOT NULL,
      slug           TEXT    NOT NULL UNIQUE,
      category       TEXT    NOT NULL,
      price          NUMERIC NOT NULL,
      original_price NUMERIC,
      image          TEXT    NOT NULL,
      description    TEXT    NOT NULL,
      features       TEXT[]  DEFAULT '{}',
      in_stock       BOOLEAN NOT NULL DEFAULT true,
      badge          TEXT
    )
  `;
  for (const p of seedProducts) {
    await sql`
      INSERT INTO products
        (id, name, slug, category, price, original_price, image, description, features, in_stock, badge)
      VALUES
        (${p.id}, ${p.name}, ${p.slug}, ${p.category}, ${p.price}, ${p.originalPrice ?? null},
         ${p.image}, ${p.description}, ${p.features ?? []}, ${p.inStock}, ${p.badge ?? null})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  ready = true;
}
