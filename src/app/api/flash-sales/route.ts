import { NextResponse } from 'next/server';
import { sql, toProduct, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const rows = await sql`
    SELECT f.*, p.name, p.slug, p.image, p.price AS original_price, p.description, p.category,
           p.in_stock, p.badge, p.features, p.images, p.original_price AS list_price,
           p.cost_price, p.stock_quantity, p.low_stock_threshold
    FROM flash_sales f
    JOIN products p ON p.id = f.product_id
    WHERE f.active = true AND f.ends_at > NOW()
    ORDER BY f.ends_at ASC
  `;
  return NextResponse.json(rows.map((row) => ({
    id: row.id as string,
    label: row.label as string,
    salePrice: Number(row.sale_price),
    endsAt: row.ends_at as string,
    product: {
      ...toProduct({ ...row, price: row.original_price, original_price: row.list_price }),
    },
  })));
}
