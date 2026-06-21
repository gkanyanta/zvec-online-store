import { neon } from '@neondatabase/serverless';
import { products as seedProducts } from './data';
import type { Product, Expense, BizDocument, DocumentItem } from '@/types';

export const sql = neon(process.env.DATABASE_URL!);

export function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    category: row.category as string,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    costPrice: row.cost_price != null ? Number(row.cost_price) : undefined,
    image: row.image as string,
    description: row.description as string,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    inStock: row.in_stock as boolean,
    badge: row.badge ? (row.badge as string) : undefined,
    stockQuantity: row.stock_quantity != null ? Number(row.stock_quantity) : undefined,
    lowStockThreshold: row.low_stock_threshold != null ? Number(row.low_stock_threshold) : undefined,
  };
}

function toISODate(val: unknown): string {
  return new Date(val as string | Date).toISOString().split('T')[0];
}

export function toExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    category: row.category as string,
    amount: Number(row.amount),
    date: toISODate(row.date),
    description: row.description ? (row.description as string) : undefined,
    createdAt: row.created_at as string,
  };
}

export function toDocument(row: Record<string, unknown>): BizDocument {
  return {
    id: row.id as string,
    type: row.type as BizDocument['type'],
    number: row.number as string,
    status: row.status as BizDocument['status'],
    customer: row.customer as BizDocument['customer'],
    items: row.items as DocumentItem[],
    subtotal: Number(row.subtotal),
    tax: Number(row.tax ?? 0),
    discount: Number(row.discount ?? 0),
    total: Number(row.total),
    notes: row.notes ? (row.notes as string) : undefined,
    dueDate: row.due_date != null ? toISODate(row.due_date) : undefined,
    linkedDocId: row.linked_doc_id ? (row.linked_doc_id as string) : undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

let ready = false;

export async function ensureSchema(): Promise<void> {
  if (ready) return;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id             TEXT    PRIMARY KEY,
      name           TEXT    NOT NULL,
      slug           TEXT    NOT NULL UNIQUE,
      category       TEXT    NOT NULL,
      price          NUMERIC NOT NULL,
      original_price NUMERIC,
      cost_price     NUMERIC,
      image          TEXT    NOT NULL,
      description    TEXT    NOT NULL,
      features       TEXT[]  DEFAULT '{}',
      in_stock       BOOLEAN NOT NULL DEFAULT true,
      badge          TEXT
    )
  `;

  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5`;

  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id          TEXT        PRIMARY KEY,
      category    TEXT        NOT NULL,
      amount      NUMERIC     NOT NULL,
      date        DATE        NOT NULL,
      description TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id             TEXT        PRIMARY KEY,
      type           TEXT        NOT NULL,
      number         TEXT        NOT NULL UNIQUE,
      status         TEXT        NOT NULL DEFAULT 'draft',
      customer       JSONB       NOT NULL DEFAULT '{}',
      items          JSONB       NOT NULL DEFAULT '[]',
      subtotal       NUMERIC     NOT NULL DEFAULT 0,
      tax            NUMERIC     NOT NULL DEFAULT 0,
      discount       NUMERIC     NOT NULL DEFAULT 0,
      total          NUMERIC     NOT NULL DEFAULT 0,
      notes          TEXT,
      due_date       DATE,
      linked_doc_id  TEXT,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS doc_sequences (
      type     TEXT PRIMARY KEY,
      last_num INTEGER DEFAULT 0
    )
  `;

  await sql`
    INSERT INTO doc_sequences (type, last_num)
    VALUES ('quote', 0), ('invoice', 0), ('receipt', 0)
    ON CONFLICT DO NOTHING
  `;

  for (const p of seedProducts) {
    await sql`
      INSERT INTO products
        (id, name, slug, category, price, original_price, image, description, features, in_stock, badge)
      VALUES
        (${p.id}, ${p.name}, ${p.slug}, ${p.category}, ${p.price}, ${p.originalPrice ?? null},
         ${p.image}, ${p.description}, ${p.features ?? []}, ${p.inStock}, ${p.badge ?? null})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  ready = true;
}

// Atomically allocate a number AND insert the document in one CTE — prevents sequence gaps.
export async function insertDocumentAtomic(params: {
  id: string;
  type: 'quote' | 'invoice' | 'receipt';
  status: string;
  customer: object;
  items: object;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
  dueDate: string | null;
  linkedDocId: string | null;
  now: string;
}): Promise<BizDocument> {
  const { id, type, status, customer, items, subtotal, tax, discount, total, notes, dueDate, linkedDocId, now } = params;
  const prefix = type === 'quote' ? 'QT' : type === 'invoice' ? 'INV' : 'REC';

  const [row] = await sql`
    WITH seq AS (
      UPDATE doc_sequences SET last_num = last_num + 1
      WHERE type = ${type}
      RETURNING last_num
    )
    INSERT INTO documents
      (id, type, number, status, customer, items, subtotal, tax, discount, total,
       notes, due_date, linked_doc_id, created_at, updated_at)
    SELECT
      ${id}, ${type},
      ${prefix} || '-' || lpad(seq.last_num::text, 3, '0'),
      ${status},
      ${JSON.stringify(customer)},
      ${JSON.stringify(items)},
      ${subtotal}, ${tax}, ${discount}, ${total},
      ${notes}, ${dueDate}, ${linkedDocId}, ${now}, ${now}
    FROM seq
    RETURNING *
  `;
  return toDocument(row);
}
