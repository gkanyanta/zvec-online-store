import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  const body = await req.json();
  await sql`
    UPDATE flash_sales SET
      label      = COALESCE(${body.label ?? null}, label),
      sale_price = COALESCE(${body.salePrice ?? null}, sale_price),
      ends_at    = COALESCE(${body.endsAt ?? null}, ends_at),
      active     = COALESCE(${body.active ?? null}, active)
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  await sql`DELETE FROM flash_sales WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
