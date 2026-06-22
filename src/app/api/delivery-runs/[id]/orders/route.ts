import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = requireAdmin(req);
  if (err) return err;
  await ensureSchema();
  const { id: runId } = await params;
  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  // Remove from any existing run first
  await sql`DELETE FROM delivery_run_orders WHERE order_id = ${orderId}`;
  await sql`
    INSERT INTO delivery_run_orders (run_id, order_id)
    VALUES (${runId}, ${orderId})
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = requireAdmin(req);
  if (err) return err;
  await ensureSchema();
  const { id: runId } = await params;
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  await sql`DELETE FROM delivery_run_orders WHERE run_id = ${runId} AND order_id = ${orderId}`;
  return NextResponse.json({ ok: true });
}
