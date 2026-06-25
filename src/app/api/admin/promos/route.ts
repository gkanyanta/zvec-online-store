import { NextResponse } from 'next/server';
import { sql, toPromoCode, ensureSchema } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const rows = await sql`SELECT * FROM promo_codes ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(toPromoCode));
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const { id, code, discountType, discountValue, minOrder, maxUses } = await req.json();
  const [row] = await sql`
    INSERT INTO promo_codes (id, code, discount_type, discount_value, min_order, max_uses)
    VALUES (${id}, ${code.toUpperCase()}, ${discountType}, ${discountValue}, ${minOrder ?? 0}, ${maxUses ?? null})
    RETURNING *
  `;
  return NextResponse.json(toPromoCode(row), { status: 201 });
}
