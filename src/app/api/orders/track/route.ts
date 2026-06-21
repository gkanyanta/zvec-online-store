import { NextResponse } from 'next/server';
import { sql, toOrder } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  const qUpper = q.toUpperCase();
  const qDigits = q.replace(/\D/g, '');

  const rows = await sql`
    SELECT * FROM orders
    WHERE id = ${qUpper}
       OR (${qDigits} <> '' AND regexp_replace(customer->>'phone', '[^0-9]', '', 'g') LIKE '%' || ${qDigits})
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(toOrder(rows[0]));
}
