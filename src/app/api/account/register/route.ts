import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { hashPassword } from '@/lib/auth-server';
import { signCustomerToken } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await ensureSchema();
  const { firstName, lastName, email, phone, password } = await req.json();
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM customers WHERE email = ${email.trim().toLowerCase()}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const id = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const passwordHash = await hashPassword(password);
  const normalizedEmail = email.trim().toLowerCase();

  await sql`
    INSERT INTO customers (id, first_name, last_name, email, phone, password)
    VALUES (${id}, ${firstName.trim()}, ${lastName.trim()}, ${normalizedEmail}, ${phone?.trim() ?? ''}, ${passwordHash})
  `;

  const token = signCustomerToken({ sub: id, email: normalizedEmail, firstName: firstName.trim(), lastName: lastName.trim() });
  return NextResponse.json({
    token,
    customer: { id, firstName: firstName.trim(), lastName: lastName.trim(), email: normalizedEmail, phone: phone?.trim() ?? '' },
  }, { status: 201 });
}
