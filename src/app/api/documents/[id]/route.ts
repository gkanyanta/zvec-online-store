import { NextResponse } from 'next/server';
import { sql, toDocument, insertDocumentAtomic } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { nanoid } from '@/lib/utils';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  const rows = await sql`SELECT * FROM documents WHERE id = ${id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(toDocument(rows[0]));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  const body = await req.json();

  const rows = await sql`SELECT * FROM documents WHERE id = ${id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const current = toDocument(rows[0]);
  const merged = { ...current, ...body };
  const now = new Date().toISOString();

  // Convert quote → invoice (atomic: sequence increment + insert in one CTE)
  if (body.convertTo === 'invoice') {
    const dueDate = new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0];
    const inv = await insertDocumentAtomic({
      id: nanoid(),
      type: 'invoice',
      status: 'draft',
      customer: current.customer,
      items: current.items,
      subtotal: current.subtotal,
      tax: current.tax,
      discount: current.discount,
      total: current.total,
      notes: current.notes ?? null,
      dueDate,
      linkedDocId: id,
      now,
    });
    await sql`UPDATE documents SET status = 'accepted', updated_at = ${now} WHERE id = ${id}`;
    return NextResponse.json(inv);
  }

  // Mark invoice as paid → create receipt (atomic)
  if (body.convertTo === 'receipt') {
    const rec = await insertDocumentAtomic({
      id: nanoid(),
      type: 'receipt',
      status: 'issued',
      customer: current.customer,
      items: current.items,
      subtotal: current.subtotal,
      tax: current.tax,
      discount: current.discount,
      total: current.total,
      notes: current.notes ?? null,
      dueDate: null,
      linkedDocId: id,
      now,
    });
    await sql`UPDATE documents SET status = 'paid', updated_at = ${now} WHERE id = ${id}`;
    return NextResponse.json(rec);
  }

  const [row] = await sql`
    UPDATE documents SET
      status       = ${merged.status},
      customer     = ${JSON.stringify(merged.customer)},
      items        = ${JSON.stringify(merged.items)},
      subtotal     = ${merged.subtotal},
      tax          = ${merged.tax},
      discount     = ${merged.discount},
      total        = ${merged.total},
      notes        = ${merged.notes ?? null},
      due_date     = ${merged.dueDate ?? null},
      updated_at   = ${now}
    WHERE id = ${id}
    RETURNING *
  `;

  return NextResponse.json(toDocument(row));
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  await sql`DELETE FROM documents WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
