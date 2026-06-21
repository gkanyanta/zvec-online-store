import { NextResponse } from 'next/server';
import { sql, toDocument, ensureSchema, insertDocumentAtomic } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { nanoid } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const rows = await sql`SELECT * FROM documents ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(toDocument));
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const { type, customer, items, subtotal, tax, discount, total, notes, dueDate } = await req.json();

  const doc = await insertDocumentAtomic({
    id: nanoid(),
    type,
    status: 'draft',
    customer,
    items,
    subtotal,
    tax: tax ?? 0,
    discount: discount ?? 0,
    total,
    notes: notes ?? null,
    dueDate: dueDate ?? null,
    linkedDocId: null,
    now: new Date().toISOString(),
  });

  return NextResponse.json(doc, { status: 201 });
}
