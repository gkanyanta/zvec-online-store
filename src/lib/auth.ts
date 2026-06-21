import { NextResponse } from 'next/server';

export function requireAdmin(req: Request): NextResponse | null {
  const key = process.env.ADMIN_API_KEY;
  if (!key) return null; // auth disabled when env var is not set
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${key}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
