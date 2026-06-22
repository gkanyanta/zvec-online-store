import { NextResponse } from 'next/server';
import { sql, ensureSchema, toDeliveryRun } from '@/lib/db';
import { requireAdmin, getUser } from '@/lib/auth';
import { nanoid } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;
  await ensureSchema();

  const caller = getUser(req)!;
  // Delivery staff only see runs assigned to them
  const isDelivery = caller.role === 'delivery';

  const rows = isDelivery
    ? await sql`
        SELECT dr.*,
               COUNT(dro.order_id)::int AS order_count
        FROM delivery_runs dr
        LEFT JOIN delivery_run_orders dro ON dro.run_id = dr.id
        WHERE dr.driver_id = ${caller.sub}
        GROUP BY dr.id
        ORDER BY dr.date DESC, dr.created_at DESC
      `
    : await sql`
        SELECT dr.*,
               COUNT(dro.order_id)::int AS order_count
        FROM delivery_runs dr
        LEFT JOIN delivery_run_orders dro ON dro.run_id = dr.id
        GROUP BY dr.id
        ORDER BY dr.date DESC, dr.created_at DESC
      `;

  return NextResponse.json(rows.map((r) => toDeliveryRun(r)));
}

export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;
  await ensureSchema();

  const { label, date, driverName, driverId, notes } = await req.json();
  if (!label || !date || !driverName) {
    return NextResponse.json({ error: 'label, date and driverName are required' }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO delivery_runs (id, label, date, driver_id, driver_name, notes)
    VALUES (${nanoid()}, ${label}, ${date}, ${driverId ?? null}, ${driverName}, ${notes ?? null})
    RETURNING *
  `;
  return NextResponse.json(toDeliveryRun(row), { status: 201 });
}
