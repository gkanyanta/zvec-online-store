import { NextResponse } from 'next/server';
import { sql, toOrder, ensureSchema } from '@/lib/db';
import { requireCustomer } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const result = requireCustomer(req);
  if ('error' in result) return result.error;
  await ensureSchema();
  const rows = await sql`
    SELECT * FROM orders
    WHERE customer->>'email' = ${result.payload.email}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return NextResponse.json(rows.map(toOrder));
}
