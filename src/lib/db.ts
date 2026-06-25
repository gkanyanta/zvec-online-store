import crypto from 'crypto';
import { neon, neonConfig } from '@neondatabase/serverless';
import { products as seedProducts } from './data';
import type { Product, Expense, BizDocument, DocumentItem, Order, OrderItem, OrderStatus, PaymentMethod, AdminUser, UserRole, DeliveryRun, DeliveryRunStatus, SlideshowBanner, PromoCode, Review } from '@/types';

// WSL2 fix: undici (Node's built-in fetch) tries IPv6 first but it's unroutable in WSL2,
// causing ETIMEDOUT. Override with an https-module fetch that resolves to IPv4 directly.
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const https = require('https') as typeof import('https');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dns = require('dns') as typeof import('dns');

  neonConfig.fetchFunction = (url: string | URL, opts: RequestInit = {}): Promise<Response> => {
    const parsed = new URL(url.toString());
    return new Promise((resolve, reject) => {
      dns.lookup(parsed.hostname, { family: 4 }, (err, ip) => {
        if (err) { reject(err); return; }
        const body = opts.body as string | undefined;
        const req = https.request(
          {
            hostname: ip,
            port: 443,
            path: parsed.pathname + parsed.search,
            method: opts.method ?? 'GET',
            headers: { ...(opts.headers as Record<string, string>), host: parsed.hostname },
            servername: parsed.hostname,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => {
              const text = Buffer.concat(chunks).toString();
              const headers = new Headers();
              Object.entries(res.headers).forEach(([k, v]) => {
                if (v) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
              });
              resolve(new Response(text, { status: res.statusCode ?? 200, headers }));
            });
            res.on('error', reject);
          }
        );
        req.on('error', reject);
        req.setTimeout(30_000, () => req.destroy(new Error('neon fetch timeout')));
        if (body) req.write(body);
        req.end();
      });
    });
  };
}

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
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
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

export function toUser(row: Record<string, unknown>): AdminUser {
  return {
    id: row.id as string,
    name: row.name as string,
    username: row.username as string,
    role: row.role as UserRole,
    active: row.active as boolean,
    createdAt: row.created_at as string,
  };
}

export function toOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    customer: row.customer as Order['customer'],
    items: row.items as OrderItem[],
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    discountCode: row.discount_code as string | undefined,
    discountAmount: row.discount_amount != null ? Number(row.discount_amount) : undefined,
    total: Number(row.total),
    paymentMethod: row.payment_method as PaymentMethod,
    status: row.status as OrderStatus,
    deliveryDate: row.delivery_date ? toISODate(row.delivery_date) : undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function toReview(row: Record<string, unknown>): Review {
  return {
    id:         row.id as string,
    productId:  row.product_id as string,
    authorName: row.author_name as string,
    rating:     Number(row.rating),
    comment:    (row.comment ?? '') as string,
    createdAt:  row.created_at as string,
  };
}

export function toPromoCode(row: Record<string, unknown>): PromoCode {
  return {
    id: row.id as string,
    code: row.code as string,
    discountType: row.discount_type as 'percent' | 'fixed',
    discountValue: Number(row.discount_value),
    minOrder: Number(row.min_order),
    maxUses: row.max_uses != null ? Number(row.max_uses) : null,
    usesCount: Number(row.uses_count),
    active: Boolean(row.active),
    createdAt: row.created_at as string,
  };
}

export function toBanner(row: Record<string, unknown>): SlideshowBanner {
  return {
    id:        row.id as string,
    image:     row.image as string,
    title:     row.title as string,
    tagline:   row.tagline as string,
    linkUrl:   row.link_url as string,
    sortOrder: Number(row.sort_order),
    active:    Boolean(row.active),
    createdAt: row.created_at as string,
  };
}

export function toDeliveryRun(row: Record<string, unknown>, orders?: Order[]): DeliveryRun {
  return {
    id: row.id as string,
    label: row.label as string,
    date: toISODate(row.date),
    driverId: row.driver_id as string | null,
    driverName: row.driver_name as string,
    status: row.status as DeliveryRunStatus,
    notes: row.notes ? (row.notes as string) : undefined,
    orderCount: row.order_count != null ? Number(row.order_count) : undefined,
    orders,
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
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'`;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id             TEXT        PRIMARY KEY,
      customer       JSONB       NOT NULL DEFAULT '{}',
      items          JSONB       NOT NULL DEFAULT '[]',
      subtotal       NUMERIC     NOT NULL DEFAULT 0,
      delivery_fee   NUMERIC     NOT NULL DEFAULT 0,
      total          NUMERIC     NOT NULL DEFAULT 0,
      payment_method TEXT        NOT NULL DEFAULT 'cod',
      status         TEXT        NOT NULL DEFAULT 'pending',
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;

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
    VALUES ('quote', 0), ('invoice', 0), ('receipt', 0), ('delivery_note', 0)
    ON CONFLICT DO NOTHING
  `;

  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE`;

  await sql`
    CREATE TABLE IF NOT EXISTS delivery_runs (
      id          TEXT        PRIMARY KEY,
      label       TEXT        NOT NULL,
      date        DATE        NOT NULL,
      driver_id   TEXT,
      driver_name TEXT        NOT NULL DEFAULT '',
      status      TEXT        NOT NULL DEFAULT 'planned',
      notes       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS delivery_run_orders (
      run_id   TEXT NOT NULL,
      order_id TEXT NOT NULL,
      PRIMARY KEY (run_id, order_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT        PRIMARY KEY,
      name       TEXT        NOT NULL,
      username   TEXT        NOT NULL UNIQUE,
      password   TEXT        NOT NULL,
      role       TEXT        NOT NULL DEFAULT 'sales',
      active     BOOLEAN     NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed default owner if no users exist yet
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM users`;
  if (count === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await new Promise<string>((res, rej) =>
      crypto.scrypt('Admin1234', salt, 64, (err, key) => err ? rej(err) : res(key.toString('hex')))
    );
    const defaultId = crypto.randomBytes(6).toString('hex');
    await sql`
      INSERT INTO users (id, name, username, password, role)
      VALUES (${defaultId}, 'ZVEC Owner', 'admin', ${salt + ':' + hash}, 'owner')
    `;
  }

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

  await sql`
    CREATE TABLE IF NOT EXISTS slideshow_banners (
      id         TEXT    PRIMARY KEY,
      image      TEXT    NOT NULL,
      title      TEXT    NOT NULL DEFAULT '',
      tagline    TEXT    NOT NULL DEFAULT '',
      link_url   TEXT    NOT NULL DEFAULT '/products',
      sort_order INTEGER NOT NULL DEFAULT 0,
      active     BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id             TEXT        PRIMARY KEY,
      code           TEXT        UNIQUE NOT NULL,
      discount_type  TEXT        NOT NULL DEFAULT 'percent',
      discount_value NUMERIC     NOT NULL,
      min_order      NUMERIC     NOT NULL DEFAULT 0,
      max_uses       INTEGER,
      uses_count     INTEGER     NOT NULL DEFAULT 0,
      active         BOOLEAN     NOT NULL DEFAULT true,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0`;

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id          TEXT        PRIMARY KEY,
      product_id  TEXT        NOT NULL,
      author_name TEXT        NOT NULL,
      rating      INTEGER     NOT NULL,
      comment     TEXT        NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS restock_requests (
      id         TEXT        PRIMARY KEY,
      product_id TEXT        NOT NULL,
      contact    TEXT        NOT NULL,
      type       TEXT        NOT NULL DEFAULT 'phone',
      notified   BOOLEAN     NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS flash_sales (
      id         TEXT        PRIMARY KEY,
      product_id TEXT        NOT NULL,
      label      TEXT        NOT NULL DEFAULT 'Flash Sale',
      sale_price NUMERIC     NOT NULL,
      ends_at    TIMESTAMPTZ NOT NULL,
      active     BOOLEAN     NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id         TEXT        PRIMARY KEY,
      first_name TEXT        NOT NULL,
      last_name  TEXT        NOT NULL,
      email      TEXT        NOT NULL UNIQUE,
      phone      TEXT        NOT NULL DEFAULT '',
      password   TEXT        NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  ready = true;
}

// Atomically allocate a number AND insert the document in one CTE — prevents sequence gaps.
export async function insertDocumentAtomic(params: {
  id: string;
  type: 'quote' | 'invoice' | 'receipt' | 'delivery_note';
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
  const prefix = type === 'quote' ? 'QT' : type === 'invoice' ? 'INV' : type === 'receipt' ? 'REC' : 'DN';

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
