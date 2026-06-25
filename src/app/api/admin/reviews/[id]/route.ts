import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  await sql`DELETE FROM reviews WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
