import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await ensureSchema();
  const { productId, contact, type } = await req.json();
  if (!productId || !contact?.trim()) {
    return NextResponse.json({ error: 'productId and contact are required' }, { status: 400 });
  }
  if (!['email', 'phone'].includes(type)) {
    return NextResponse.json({ error: 'type must be email or phone' }, { status: 400 });
  }

  // Prevent duplicate requests for same contact+product
  const existing = await sql`
    SELECT id FROM restock_requests WHERE product_id = ${productId} AND contact = ${contact.trim()}
  `;
  if (existing.length > 0) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const id = `rs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  await sql`
    INSERT INTO restock_requests (id, product_id, contact, type)
    VALUES (${id}, ${productId}, ${contact.trim()}, ${type})
  `;
  return NextResponse.json({ ok: true });
}
