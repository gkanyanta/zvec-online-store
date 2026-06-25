import { NextResponse } from 'next/server';
import { sql, toReview, ensureSchema } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const rows = await sql`
    SELECT r.*, p.name AS product_name
    FROM reviews r
    LEFT JOIN products p ON p.id = r.product_id
    ORDER BY r.created_at DESC
    LIMIT 200
  `;
  return NextResponse.json(rows.map((row) => ({ ...toReview(row), productName: row.product_name ?? 'Unknown' })));
}
