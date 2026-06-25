function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('zvec-admin-token') ?? '';
}

export async function adminFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const existing = (opts.headers ?? {}) as Record<string, string>;
  const res = await fetch(url, {
    ...opts,
    headers: { ...existing, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    // Clear both the raw token and the Zustand persist state so the
    // auth gate shows the login form on the next render.
    localStorage.removeItem('zvec-admin-token');
    localStorage.removeItem('zvec-auth');
    window.location.href = '/admin?session=expired';
  }

  return res;
}
