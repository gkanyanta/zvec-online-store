import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET ?? 'zvec-dev-secret-change-in-prod';

export type UserRole = 'owner' | 'sales' | 'delivery';

export interface TokenPayload {
  sub: string;   // user id
  name: string;
  role: UserRole;
  exp: number;   // ms timestamp
}

// ── passwords ────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await new Promise<string>((res, rej) =>
    crypto.scrypt(password, salt, 64, (err, key) => err ? rej(err) : res(key.toString('hex')))
  );
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  const derived = await new Promise<string>((res, rej) =>
    crypto.scrypt(password, salt, 64, (err, key) => err ? rej(err) : res(key.toString('hex')))
  );
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

// ── tokens ───────────────────────────────────────────────────────────────────

const TTL_MS = 10 * 60 * 60 * 1000; // 10 hours

export function signToken(payload: Omit<TokenPayload, 'exp'>): string {
  const data: TokenPayload = { ...payload, exp: Date.now() + TTL_MS };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const dot = token.lastIndexOf('.');
    const encoded = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'base64url'), Buffer.from(expected, 'base64url'))) return null;
    const payload: TokenPayload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
