import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { requireCustomer } from '@/lib/customerAuth';
import { hashPassword, verifyPassword } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const result = requireCustomer(req);
  if ('error' in result) return result.error;
  await ensureSchema();
  const rows = await sql`SELECT id, first_name, last_name, email, phone FROM customers WHERE id = ${result.payload.sub}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const c = rows[0];
  return NextResponse.json({ id: c.id, firstName: c.first_name, lastName: c.last_name, email: c.email, phone: c.phone });
}

export async function PUT(req: Request) {
  const result = requireCustomer(req);
  if ('error' in result) return result.error;
  await ensureSchema();
  const { firstName, lastName, phone, currentPassword, newPassword } = await req.json();

  if (newPassword) {
    const rows = await sql`SELECT password FROM customers WHERE id = ${result.payload.sub}`;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const valid = await verifyPassword(currentPassword ?? '', rows[0].password as string);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    const newHash = await hashPassword(newPassword);
    await sql`UPDATE customers SET password = ${newHash} WHERE id = ${result.payload.sub}`;
  }

  await sql`
    UPDATE customers SET
      first_name = COALESCE(${firstName ?? null}, first_name),
      last_name  = COALESCE(${lastName ?? null}, last_name),
      phone      = COALESCE(${phone ?? null}, phone)
    WHERE id = ${result.payload.sub}
  `;

  const rows = await sql`SELECT id, first_name, last_name, email, phone FROM customers WHERE id = ${result.payload.sub}`;
  const c = rows[0];
  return NextResponse.json({ id: c.id, firstName: c.first_name, lastName: c.last_name, email: c.email, phone: c.phone });
}
