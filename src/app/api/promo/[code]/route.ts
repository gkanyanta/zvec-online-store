import { NextResponse } from 'next/server';
import { sql, toPromoCode, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await ensureSchema();
  const rows = await sql`
    SELECT * FROM promo_codes
    WHERE code = ${code.toUpperCase()} AND active = true
  `;
  if (!rows.length) return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });

  const promo = toPromoCode(rows[0]);
  if (promo.maxUses !== null && promo.usesCount >= promo.maxUses) {
    return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 410 });
  }
  return NextResponse.json(promo);
}
