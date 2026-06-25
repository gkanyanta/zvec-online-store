import { NextResponse } from 'next/server';
import { sql, toPromoCode } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  const body = await req.json();
  const [row] = await sql`
    UPDATE promo_codes SET
      code           = COALESCE(${body.code?.toUpperCase() ?? null}, code),
      discount_type  = COALESCE(${body.discountType ?? null}, discount_type),
      discount_value = COALESCE(${body.discountValue ?? null}, discount_value),
      min_order      = COALESCE(${body.minOrder ?? null}, min_order),
      max_uses       = COALESCE(${body.maxUses ?? null}, max_uses),
      active         = COALESCE(${body.active ?? null}, active)
    WHERE id = ${id}
    RETURNING *
  `;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(toPromoCode(row));
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  await sql`DELETE FROM promo_codes WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
