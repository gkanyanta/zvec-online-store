import { NextResponse } from 'next/server';
import { sql, toProduct } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const current = toProduct(rows[0]);
  const merged = { ...current, ...body };

  const [row] = await sql`
    UPDATE products SET
      name           = ${merged.name},
      slug           = ${merged.slug},
      category       = ${merged.category},
      price          = ${merged.price},
      original_price = ${merged.originalPrice ?? null},
      cost_price     = ${merged.costPrice ?? null},
      image          = ${merged.image},
      description    = ${merged.description},
      features       = ${merged.features ?? []},
      in_stock       = ${merged.inStock},
      badge          = ${merged.badge ?? null}
    WHERE id = ${id}
    RETURNING *
  `;

  return NextResponse.json(toProduct(row));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM products WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
