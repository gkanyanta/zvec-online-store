import crypto from 'crypto';

const SECRET = (process.env.JWT_SECRET ?? 'zvec-dev-secret-change-in-prod') + '-customer';

interface CustomerTokenPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  exp: number;
}

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function signCustomerToken(payload: Omit<CustomerTokenPayload, 'exp'>): string {
  const data: CustomerTokenPayload = { ...payload, exp: Date.now() + TTL_MS };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyCustomerToken(token: string): CustomerTokenPayload | null {
  try {
    const dot = token.lastIndexOf('.');
    const encoded = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'base64url'), Buffer.from(expected, 'base64url'))) return null;
    const payload: CustomerTokenPayload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireCustomer(req: Request): { error: Response } | { payload: CustomerTokenPayload } {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/, '') ?? null;
  if (!token) return { error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  const payload = verifyCustomerToken(token);
  if (!payload) return { error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  return { payload };
}
