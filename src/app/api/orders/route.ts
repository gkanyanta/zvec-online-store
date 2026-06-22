import { NextResponse } from 'next/server';
import { sql, ensureSchema, toOrder } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(toOrder));
}

export async function POST(req: Request) {
  await ensureSchema();
  const order = await req.json();
  const { id, customer, items, subtotal, deliveryFee, total, paymentMethod, status, deliveryDate, createdAt, updatedAt } = order;

  const [row] = await sql`
    INSERT INTO orders
      (id, customer, items, subtotal, delivery_fee, total, payment_method, status, delivery_date, created_at, updated_at)
    VALUES
      (${id}, ${JSON.stringify(customer)}, ${JSON.stringify(items)},
       ${subtotal}, ${deliveryFee}, ${total}, ${paymentMethod ?? 'cod'},
       ${status ?? 'pending'}, ${deliveryDate ?? null}, ${createdAt}, ${updatedAt})
    RETURNING *
  `;

  // Deduct stock server-side for tracked products
  for (const item of items as { productId: string; quantity: number }[]) {
    await sql`
      UPDATE products
      SET
        stock_quantity = GREATEST(0, stock_quantity - ${item.quantity}),
        in_stock       = GREATEST(0, stock_quantity - ${item.quantity}) > 0
      WHERE id = ${item.productId}
        AND stock_quantity IS NOT NULL
    `.catch(() => null);
  }

  return NextResponse.json(toOrder(row), { status: 201 });
}
