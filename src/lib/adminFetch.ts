function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('zvec-admin-token') ?? '';
}

export function adminFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const existing = (opts.headers ?? {}) as Record<string, string>;
  return fetch(url, {
    ...opts,
    headers: { ...existing, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}
