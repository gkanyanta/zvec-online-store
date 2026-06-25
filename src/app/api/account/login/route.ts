import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { verifyPassword } from '@/lib/auth-server';
import { signCustomerToken } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await ensureSchema();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const rows = await sql`SELECT * FROM customers WHERE email = ${email.trim().toLowerCase()}`;
  if (!rows.length) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const cust = rows[0];
  const valid = await verifyPassword(password, cust.password as string);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = signCustomerToken({
    sub: cust.id as string,
    email: cust.email as string,
    firstName: cust.first_name as string,
    lastName: cust.last_name as string,
  });

  return NextResponse.json({
    token,
    customer: {
      id: cust.id, firstName: cust.first_name, lastName: cust.last_name,
      email: cust.email, phone: cust.phone,
    },
  });
}
