import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const rows = await sql`
    SELECT product_id, ROUND(AVG(rating)::numeric, 1) AS avg, COUNT(*)::int AS count
    FROM reviews
    GROUP BY product_id
  `;
  const result: Record<string, { avg: number; count: number }> = {};
  for (const row of rows) {
    result[row.product_id as string] = { avg: Number(row.avg), count: row.count as number };
  }
  return NextResponse.json(result);
}
