import { NextResponse } from 'next/server';
import { sql, toUser, ensureSchema } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth-server';

export async function POST(req: Request) {
  await ensureSchema();
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  const rows = await sql`SELECT * FROM users WHERE username = ${username.toLowerCase()} AND active = true`;
  if (!rows.length) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const user = toUser(rows[0]);
  const valid = await verifyPassword(password, rows[0].password as string);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ sub: user.id, name: user.name, role: user.role });
  return NextResponse.json({ token, user: { id: user.id, name: user.name, role: user.role } });
}
