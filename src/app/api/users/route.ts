import { NextResponse } from 'next/server';
import { sql, toUser, ensureSchema } from '@/lib/db';
import { requireOwner } from '@/lib/auth';
import { hashPassword } from '@/lib/auth-server';
import { nanoid } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const err = requireOwner(req);
  if (err) return err;
  await ensureSchema();
  const rows = await sql`SELECT id, name, username, role, active, created_at FROM users ORDER BY created_at ASC`;
  return NextResponse.json(rows.map(toUser));
}

export async function POST(req: Request) {
  const err = requireOwner(req);
  if (err) return err;
  await ensureSchema();
  const { name, username, password, role } = await req.json();

  if (!name || !username || !password || !role) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  if (!['owner', 'sales', 'delivery'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE username = ${username.toLowerCase()}`;
  if (existing.length) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const [row] = await sql`
    INSERT INTO users (id, name, username, password, role)
    VALUES (${nanoid()}, ${name}, ${username.toLowerCase()}, ${hashed}, ${role})
    RETURNING id, name, username, role, active, created_at
  `;
  return NextResponse.json(toUser(row), { status: 201 });
}
