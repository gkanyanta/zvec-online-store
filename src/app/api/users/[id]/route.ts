import { NextResponse } from 'next/server';
import { sql, toUser } from '@/lib/db';
import { requireOwner, getUser } from '@/lib/auth';
import { hashPassword } from '@/lib/auth-server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = getUser(req);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Changing your own password is allowed; everything else is owner-only
  const isOwnPasswordChange = caller.sub === id && body.password && Object.keys(body).length === 1;
  if (!isOwnPasswordChange) {
    const err = requireOwner(req);
    if (err) return err;
  }

  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Prevent deactivating the last owner
  if (body.active === false || body.role) {
    const current = toUser(rows[0]);
    if (current.role === 'owner') {
      const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'owner' AND active = true`;
      if (count <= 1 && (body.active === false || body.role !== 'owner')) {
        return NextResponse.json({ error: 'Cannot deactivate or demote the last owner' }, { status: 400 });
      }
    }
  }

  const updates: string[] = [];
  const values: Record<string, unknown> = {};

  if (body.name) { updates.push('name'); values.name = body.name; }
  if (body.role) { updates.push('role'); values.role = body.role; }
  if (typeof body.active === 'boolean') { updates.push('active'); values.active = body.active; }
  if (body.password) {
    updates.push('password');
    values.password = await hashPassword(body.password);
  }

  if (updates.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  // Build update dynamically
  const [row] = await sql`
    UPDATE users SET
      name     = COALESCE(${values.name ?? null}, name),
      role     = COALESCE(${values.role ?? null}, role),
      active   = COALESCE(${values.active ?? null}, active),
      password = COALESCE(${values.password ?? null}, password)
    WHERE id = ${id}
    RETURNING id, name, username, role, active, created_at
  `;

  return NextResponse.json(toUser(row));
}
