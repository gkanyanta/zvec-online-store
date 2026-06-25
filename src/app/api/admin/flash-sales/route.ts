import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const rows = await sql`
    SELECT f.*, p.name AS product_name
    FROM flash_sales f
    LEFT JOIN products p ON p.id = f.product_id
    ORDER BY f.created_at DESC
  `;
  return NextResponse.json(rows.map((r) => ({
    id: r.id, label: r.label, productId: r.product_id,
    productName: r.product_name ?? 'Unknown',
    salePrice: Number(r.sale_price), endsAt: r.ends_at,
    active: r.active, createdAt: r.created_at,
  })));
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const { productId, label, salePrice, endsAt } = await req.json();
  const id = `fs_${Date.now()}`;
  const [row] = await sql`
    INSERT INTO flash_sales (id, product_id, label, sale_price, ends_at)
    VALUES (${id}, ${productId}, ${label ?? 'Flash Sale'}, ${salePrice}, ${endsAt})
    RETURNING *
  `;
  return NextResponse.json({ id: row.id, ok: true }, { status: 201 });
}
