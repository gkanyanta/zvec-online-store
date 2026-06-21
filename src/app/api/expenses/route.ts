import { NextResponse } from 'next/server';
import { sql, toExpense, ensureSchema } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { nanoid } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const rows = await sql`SELECT * FROM expenses ORDER BY date DESC, created_at DESC`;
  return NextResponse.json(rows.map(toExpense));
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const { category, amount, date, description } = await req.json();
  const id = nanoid();

  const [row] = await sql`
    INSERT INTO expenses (id, category, amount, date, description)
    VALUES (${id}, ${category}, ${amount}, ${date}, ${description ?? null})
    RETURNING *
  `;

  return NextResponse.json(toExpense(row), { status: 201 });
}
