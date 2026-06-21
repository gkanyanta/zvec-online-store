const KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? '';

export function adminFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const existing = (opts.headers ?? {}) as Record<string, string>;
  return fetch(url, {
    ...opts,
    headers: { ...existing, Authorization: `Bearer ${KEY}` },
  });
}
