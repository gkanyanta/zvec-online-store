import { NextResponse } from 'next/server';
import { sql, toBanner, ensureSchema } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const rows = await sql`SELECT * FROM slideshow_banners ORDER BY sort_order ASC, created_at ASC`;
  return NextResponse.json(rows.map(toBanner));
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();
  const { id, image, title, tagline, linkUrl, sortOrder, active } = await req.json();
  const [row] = await sql`
    INSERT INTO slideshow_banners (id, image, title, tagline, link_url, sort_order, active)
    VALUES (${id}, ${image}, ${title ?? ''}, ${tagline ?? ''}, ${linkUrl ?? '/products'}, ${sortOrder ?? 0}, ${active ?? true})
    RETURNING *
  `;
  return NextResponse.json(toBanner(row), { status: 201 });
}
