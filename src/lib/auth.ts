import { NextResponse } from 'next/server';
import { verifyToken, type TokenPayload, type UserRole } from './auth-server';

export type { UserRole, TokenPayload };

function extractToken(req: Request): string | null {
  return req.headers.get('Authorization')?.replace(/^Bearer\s+/, '') ?? null;
}

export function requireAdmin(req: Request): NextResponse | null {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}

export function requireOwner(req: Request): NextResponse | null {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

export function getUser(req: Request): TokenPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireRoles(req: Request, ...roles: UserRole[]): NextResponse | null {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!roles.includes(payload.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}
