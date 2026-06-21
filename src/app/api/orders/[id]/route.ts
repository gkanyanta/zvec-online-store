import { NextResponse } from 'next/server';
import { sql, toOrder } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  const { status } = await req.json();
  const now = new Date().toISOString();

  const [row] = await sql`
    UPDATE orders
    SET status = ${status}, updated_at = ${now}
    WHERE id = ${id}
    RETURNING *
  `;

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(toOrder(row));
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  await sql`DELETE FROM orders WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
