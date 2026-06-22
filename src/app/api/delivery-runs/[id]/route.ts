import { NextResponse } from 'next/server';
import { sql, ensureSchema, toDeliveryRun, toOrder } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = requireAdmin(req);
  if (err) return err;
  await ensureSchema();
  const { id } = await params;

  const runs = await sql`SELECT * FROM delivery_runs WHERE id = ${id}`;
  if (!runs.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const orderRows = await sql`
    SELECT o.* FROM orders o
    JOIN delivery_run_orders dro ON dro.order_id = o.id
    WHERE dro.run_id = ${id}
    ORDER BY o.created_at ASC
  `;
  return NextResponse.json(toDeliveryRun(runs[0], orderRows.map(toOrder)));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = requireAdmin(req);
  if (err) return err;
  await ensureSchema();
  const { id } = await params;
  const { label, date, driverName, driverId, status, notes } = await req.json();

  const [row] = await sql`
    UPDATE delivery_runs SET
      label       = COALESCE(${label ?? null}, label),
      date        = COALESCE(${date ?? null}, date),
      driver_name = COALESCE(${driverName ?? null}, driver_name),
      driver_id   = COALESCE(${driverId ?? null}, driver_id),
      status      = COALESCE(${status ?? null}, status),
      notes       = COALESCE(${notes ?? null}, notes),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(toDeliveryRun(row));
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = requireAdmin(req);
  if (err) return err;
  await ensureSchema();
  const { id } = await params;
  await sql`DELETE FROM delivery_run_orders WHERE run_id = ${id}`;
  await sql`DELETE FROM delivery_runs WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
