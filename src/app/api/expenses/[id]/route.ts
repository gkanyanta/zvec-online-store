import { NextResponse } from 'next/server';
import { sql, toExpense } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  const { category, amount, date, description } = await req.json();

  const [row] = await sql`
    UPDATE expenses
    SET category = ${category}, amount = ${amount}, date = ${date}, description = ${description ?? null}
    WHERE id = ${id}
    RETURNING *
  `;

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(toExpense(row));
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  await sql`DELETE FROM expenses WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
