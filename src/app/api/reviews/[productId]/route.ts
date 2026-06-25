import { NextResponse } from 'next/server';
import { sql, toReview, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  await ensureSchema();
  const rows = await sql`
    SELECT * FROM reviews WHERE product_id = ${productId} ORDER BY created_at DESC
  `;
  return NextResponse.json(rows.map(toReview));
}

export async function POST(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  await ensureSchema();
  const { id, authorName, rating, comment } = await req.json();

  if (!authorName?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });

  const [row] = await sql`
    INSERT INTO reviews (id, product_id, author_name, rating, comment)
    VALUES (${id}, ${productId}, ${authorName.trim()}, ${rating}, ${comment?.trim() ?? ''})
    RETURNING *
  `;
  return NextResponse.json(toReview(row), { status: 201 });
}
