import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const rows = await sql`
    SELECT r.*, p.name AS product_name
    FROM restock_requests r
    LEFT JOIN products p ON p.id = r.product_id
    ORDER BY r.created_at DESC
  `;
  return NextResponse.json(rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name ?? 'Unknown',
    contact: row.contact,
    type: row.type,
    notified: row.notified,
    createdAt: row.created_at,
  })));
}
