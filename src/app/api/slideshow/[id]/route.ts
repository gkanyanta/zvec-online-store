import { NextResponse } from 'next/server';
import { sql, toBanner } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  const body = await req.json();

  const rows = await sql`SELECT * FROM slideshow_banners WHERE id = ${id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const cur = toBanner(rows[0]);
  const merged = { ...cur, ...body };

  const [row] = await sql`
    UPDATE slideshow_banners SET
      image      = ${merged.image},
      title      = ${merged.title},
      tagline    = ${merged.tagline},
      link_url   = ${merged.linkUrl},
      sort_order = ${merged.sortOrder},
      active     = ${merged.active}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(toBanner(row));
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  const { id } = await params;
  await sql`DELETE FROM slideshow_banners WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
