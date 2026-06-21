import { NextResponse } from 'next/server';
import { sql, toProduct, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const rows = await sql`SELECT * FROM products ORDER BY name ASC`;
  return NextResponse.json(rows.map(toProduct));
}

export async function POST(req: Request) {
  await ensureSchema();
  const {
    id, name, slug, category, price, originalPrice, costPrice,
    image, description, features, inStock, badge, stockQuantity, lowStockThreshold,
  } = await req.json();

  const [row] = await sql`
    INSERT INTO products
      (id, name, slug, category, price, original_price, cost_price, image, description,
       features, in_stock, badge, stock_quantity, low_stock_threshold)
    VALUES
      (${id}, ${name}, ${slug}, ${category}, ${price}, ${originalPrice ?? null}, ${costPrice ?? null},
       ${image}, ${description}, ${features ?? []}, ${inStock ?? true}, ${badge ?? null},
       ${stockQuantity ?? null}, ${lowStockThreshold ?? null})
    RETURNING *
  `;

  return NextResponse.json(toProduct(row), { status: 201 });
}
